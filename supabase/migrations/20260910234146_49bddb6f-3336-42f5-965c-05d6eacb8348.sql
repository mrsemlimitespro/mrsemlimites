ALTER TABLE public.licencas
  ADD COLUMN IF NOT EXISTS mr_social_growth_ativo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mr_sem_limites_ativo boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.set_licenca_produto(_licenca_id uuid, _produto text, _ativo boolean)
RETURNS public.licencas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _l public.licencas; _antes public.licencas;
BEGIN
  IF _produto NOT IN ('mr_social_growth','mr_sem_limites') THEN
    RAISE EXCEPTION 'Produto inválido.';
  END IF;

  SELECT * INTO _antes FROM public.licencas WHERE id = _licenca_id;

  IF _produto = 'mr_social_growth' THEN
    UPDATE public.licencas SET mr_social_growth_ativo = _ativo
     WHERE id = _licenca_id
       AND (public.has_role(auth.uid(),'admin') OR revendedor_id = public.current_revendedor_id())
     RETURNING * INTO _l;
  ELSE
    UPDATE public.licencas SET mr_sem_limites_ativo = _ativo
     WHERE id = _licenca_id
       AND (public.has_role(auth.uid(),'admin') OR revendedor_id = public.current_revendedor_id())
     RETURNING * INTO _l;
  END IF;

  IF _l.id IS NULL THEN RAISE EXCEPTION 'Licença não encontrada.'; END IF;

  INSERT INTO public.licencas_eventos(licenca_id, tipo, mensagem, ator_user_id, metadata)
  VALUES (
    _l.id,
    'produto_alterado',
    CASE WHEN _produto = 'mr_social_growth' THEN 'MR Social Growth ' ELSE 'MR Sem Limites ' END
      || CASE WHEN _ativo THEN 'liberado' ELSE 'bloqueado' END,
    auth.uid(),
    jsonb_build_object('produto', _produto, 'ativo', _ativo)
  );

  RETURN _l;
END; $function$;

GRANT EXECUTE ON FUNCTION public.set_licenca_produto(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_licenca_produto(uuid, text, boolean) TO service_role;