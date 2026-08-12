-- 1. Cria a função que gera o formato antigo (XXXXX-XXXXX-XXXXX-XXXXX)
CREATE OR REPLACE FUNCTION public.gerar_chave_licenca_v1()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  _chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  _out text := '';
  _i int;
  _j int;
BEGIN
  FOR _j IN 1..4 LOOP
    FOR _i IN 1..5 LOOP
      _out := _out || substr(_chars, 1 + floor(random() * length(_chars))::int, 1);
    END LOOP;
    IF _j < 4 THEN _out := _out || '-'; END IF;
  END LOOP;
  RETURN _out;
END;
$function$;

-- 2. Cria a função que gera o formato novo (MR-XXXX-XXXX-XXXX)
CREATE OR REPLACE FUNCTION public.gerar_chave_licenca_v2()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  _chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  _out text := 'MR-';
  _i int;
  _j int;
BEGIN
  FOR _j IN 1..3 LOOP
    FOR _i IN 1..4 LOOP
      _out := _out || substr(_chars, 1 + floor(random() * length(_chars))::int, 1);
    END LOOP;
    IF _j < 3 THEN _out := _out || '-'; END IF;
  END LOOP;
  RETURN _out;
END;
$function$;

-- 3. Atualiza a função principal gerar_licencas para aceitar um parâmetro opcional de formato
-- Alteramos a assinatura para incluir _modelo_mr (boolean)
CREATE OR REPLACE FUNCTION public.gerar_licencas(
    _quantidade integer, 
    _duracao_dias integer DEFAULT 30, 
    _revendedor_id uuid DEFAULT NULL,
    _modelo_mr boolean DEFAULT FALSE
)
RETURNS SETOF public.licencas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      -- Escolhe o gerador baseado no parâmetro
      IF _modelo_mr THEN
        _chave := public.gerar_chave_licenca_v2();
      ELSE
        _chave := public.gerar_chave_licenca_v1();
      END IF;
      
      EXIT WHEN NOT EXISTS(SELECT 1 FROM public.licencas WHERE chave = _chave);
    END LOOP;

    INSERT INTO public.licencas(chave, revendedor_id, status, duracao_dias)
    VALUES (_chave, _rev, 'ativa', COALESCE(_duracao_dias, 30))
    RETURNING * INTO _row;

    RETURN NEXT _row;
  END LOOP;
END;
$$;

-- 4. Re-garante os GRANTs
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO service_role;
