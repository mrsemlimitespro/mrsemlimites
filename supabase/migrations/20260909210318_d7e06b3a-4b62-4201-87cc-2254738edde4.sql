CREATE OR REPLACE FUNCTION public.gerar_licencas_v3(
  _quantidade integer,
  _tipo text DEFAULT 'premium',
  _duracao_dias integer DEFAULT NULL,
  _trial_minutos integer DEFAULT NULL,
  _email text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL,
  _revendedor_id uuid DEFAULT NULL,
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
  _t text := lower(coalesce(_tipo, 'premium'));
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

  IF _t NOT IN ('teste', 'premium') THEN
    _t := 'premium';
  END IF;

  IF _t = 'teste' THEN
    _duracao_dias := NULL;
    _trial_minutos := COALESCE(_trial_minutos, 60);
  ELSE
    _trial_minutos := NULL;
    _duracao_dias := COALESCE(_duracao_dias, 30);
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

    INSERT INTO public.licencas(chave, revendedor_id, status, tipo, duracao_dias, trial_duracao_minutos, email, metadata)
    VALUES (
      _chave, _rev, 'ativa', _t, _duracao_dias, _trial_minutos,
      NULLIF(lower(trim(coalesce(_email, ''))), ''),
      COALESCE(_metadata, '{}'::jsonb)
    )
    RETURNING * INTO _row;

    RETURN NEXT _row;
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.gerar_licencas_v3(integer, text, integer, integer, text, jsonb, uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.gerar_licencas_v3(integer, text, integer, integer, text, jsonb, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_licencas_v3(integer, text, integer, integer, text, jsonb, uuid, boolean) TO service_role;