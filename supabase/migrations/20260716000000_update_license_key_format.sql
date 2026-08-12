-- Atualiza o formato de geração de chaves para MR-XXXX-XXXX-XXXX
CREATE OR REPLACE FUNCTION public.gerar_chave_licenca()
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

GRANT EXECUTE ON FUNCTION public.gerar_chave_licenca() TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_chave_licenca() TO service_role;
