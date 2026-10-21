-- Etapa 2: interruptor genérico por produto
CREATE TABLE IF NOT EXISTS public.licenca_produto_ativo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenca_id uuid NOT NULL REFERENCES public.licencas(id) ON DELETE CASCADE,
  produto text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (licenca_id, produto)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenca_produto_ativo TO authenticated;
GRANT ALL ON public.licenca_produto_ativo TO service_role;
ALTER TABLE public.licenca_produto_ativo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all licenca_produto_ativo" ON public.licenca_produto_ativo FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "revendedor read own licenca_produto_ativo" ON public.licenca_produto_ativo FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.licencas l WHERE l.id = licenca_id AND l.revendedor_id = public.current_revendedor_id()));
CREATE TRIGGER trg_licenca_produto_ativo_updated BEFORE UPDATE ON public.licenca_produto_ativo
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.set_licenca_produto_ativo(_licenca_id uuid, _produto text, _ativo boolean)
RETURNS public.licenca_produto_ativo
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _l public.licencas; _r public.licenca_produto_ativo;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.licenca_produtos WHERE slug = _produto AND ativo) THEN
    RAISE EXCEPTION 'Produto inválido.';
  END IF;
  SELECT * INTO _l FROM public.licencas WHERE id = _licenca_id
    AND (public.has_role(auth.uid(),'admin') OR revendedor_id = public.current_revendedor_id());
  IF _l.id IS NULL THEN RAISE EXCEPTION 'Licença não encontrada.'; END IF;
  INSERT INTO public.licenca_produto_ativo(licenca_id, produto, ativo)
  VALUES (_licenca_id, _produto, _ativo)
  ON CONFLICT (licenca_id, produto) DO UPDATE SET ativo = EXCLUDED.ativo
  RETURNING * INTO _r;
  INSERT INTO public.licencas_eventos(licenca_id, tipo, mensagem, ator_user_id, metadata)
  VALUES (_l.id, CASE WHEN _ativo THEN 'produto_ativado' ELSE 'produto_desativado' END,
          _produto || CASE WHEN _ativo THEN ' liberado' ELSE ' bloqueado' END,
          auth.uid(), jsonb_build_object('produto', _produto, 'ativo', _ativo));
  RETURN _r;
END; $$;
GRANT EXECUTE ON FUNCTION public.set_licenca_produto_ativo(uuid, text, boolean) TO authenticated;

-- Etapa 3: produto na auditoria v17
ALTER TABLE public.ext_v17_requests ADD COLUMN IF NOT EXISTS produto text;
CREATE INDEX IF NOT EXISTS idx_ext_v17_requests_lic_created ON public.ext_v17_requests(licenca_id, created_at);

-- Etapa 5: dispositivo por chave+produto (só v17)
CREATE TABLE IF NOT EXISTS public.ext_v17_dispositivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licenca_id uuid NOT NULL REFERENCES public.licencas(id) ON DELETE CASCADE,
  produto text NOT NULL DEFAULT 'motor-v17',
  device_id text NOT NULL,
  device_nome text,
  primeiro_acesso timestamptz NOT NULL DEFAULT now(),
  ultimo_acesso timestamptz NOT NULL DEFAULT now(),
  UNIQUE (licenca_id, produto, device_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ext_v17_dispositivos TO authenticated;
GRANT ALL ON public.ext_v17_dispositivos TO service_role;
ALTER TABLE public.ext_v17_dispositivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all ext_v17_dispositivos" ON public.ext_v17_dispositivos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Etapa 6: estatísticas
CREATE OR REPLACE VIEW public.v_ext_v17_stats WITH (security_invoker = true) AS
SELECT licenca_id, COALESCE(produto, 'motor-v17') AS produto, path,
       count(*) AS total,
       count(*) FILTER (WHERE created_at >= now() - interval '24 hours') AS ultimas_24h,
       count(*) FILTER (WHERE created_at >= now() - interval '7 days') AS ultimos_7d,
       max(created_at) AS ultimo_acesso
FROM public.ext_v17_requests
GROUP BY GROUPING SETS ((licenca_id), (licenca_id, produto), (licenca_id, path));
GRANT SELECT ON public.v_ext_v17_stats TO authenticated;
GRANT SELECT ON public.v_ext_v17_stats TO service_role;

CREATE OR REPLACE FUNCTION public.ext_v17_stats(_chave text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _k text; _id uuid; _res jsonb;
BEGIN
  _k := upper(btrim(regexp_replace(regexp_replace(normalize(coalesce(_chave,''), NFKC),
          '[\u200B-\u200D\uFEFF]', '', 'g'), '[‐‑‒–—−]', '-', 'g')));
  SELECT id INTO _id FROM public.licencas WHERE chave = _k;
  IF _id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;
  SELECT jsonb_build_object(
    'ok', true, 'licenca_id', _id,
    'total', count(*),
    'ultimas_24h', count(*) FILTER (WHERE created_at >= now() - interval '24 hours'),
    'ultimos_7d', count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
    'ultimo_acesso', max(created_at),
    'por_rota', COALESCE((SELECT jsonb_object_agg(path, n) FROM (SELECT path, count(*) n FROM public.ext_v17_requests WHERE licenca_id = _id GROUP BY path) s), '{}'::jsonb),
    'por_produto', COALESCE((SELECT jsonb_object_agg(p, n) FROM (SELECT COALESCE(produto,'motor-v17') p, count(*) n FROM public.ext_v17_requests WHERE licenca_id = _id GROUP BY 1) s), '{}'::jsonb)
  ) INTO _res FROM public.ext_v17_requests WHERE licenca_id = _id;
  RETURN _res;
END; $$;
REVOKE EXECUTE ON FUNCTION public.ext_v17_stats(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ext_v17_stats(text) TO service_role;