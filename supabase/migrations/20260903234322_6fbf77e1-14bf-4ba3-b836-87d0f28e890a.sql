DROP FUNCTION IF EXISTS public.gerar_licencas(integer, integer, uuid);

CREATE OR REPLACE FUNCTION public.gerar_licencas(
  _quantidade integer,
  _duracao_dias integer DEFAULT 30,
  _revendedor_id uuid DEFAULT NULL::uuid,
  _modelo_mr boolean DEFAULT true
)
RETURNS SETOF public.licencas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _rev uuid;
  _i integer;
  _chave text;
  _row public.licencas;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    _rev := _revendedor_id;
  ELSE
    _rev := public.current_revendedor_id();
    IF _rev IS NULL THEN
      RAISE EXCEPTION 'Revendedor inválido.';
    END IF;
  END IF;

  IF _quantidade IS NULL OR _quantidade < 1 OR _quantidade > 500 THEN
    RAISE EXCEPTION 'Quantidade inválida.';
  END IF;

  FOR _i IN 1.._quantidade LOOP
    LOOP
      IF COALESCE(_modelo_mr, true) THEN
        _chave := public.gerar_chave_licenca_v2();
      ELSE
        _chave := public.gerar_chave_licenca_v1();
      END IF;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.licencas WHERE chave = _chave);
    END LOOP;

    INSERT INTO public.licencas(chave, revendedor_id, status, duracao_dias)
    VALUES (_chave, _rev, 'ativa', COALESCE(_duracao_dias, 30))
    RETURNING * INTO _row;

    RETURN NEXT _row;
  END LOOP;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO service_role;

DROP POLICY IF EXISTS "revendedor update own licencas" ON public.licencas;
CREATE POLICY "revendedor update own licencas"
ON public.licencas
FOR UPDATE
TO authenticated
USING (revendedor_id = public.current_revendedor_id())
WITH CHECK (revendedor_id = public.current_revendedor_id());