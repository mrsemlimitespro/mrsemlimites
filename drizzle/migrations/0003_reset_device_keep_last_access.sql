CREATE OR REPLACE FUNCTION public.resetar_device_licenca(_licenca_id uuid)
 RETURNS licencas
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _lic public.licencas; _antes public.licencas;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Sem permissão.';
  END IF;
  SELECT * INTO _antes FROM public.licencas WHERE id = _licenca_id;
  IF _antes.id IS NULL THEN RAISE EXCEPTION 'Licença não encontrada.'; END IF;

  DELETE FROM public.licenca_dispositivos WHERE licenca_id = _licenca_id;

  UPDATE public.licencas
     SET device_id = NULL, device_vinculado_em = NULL
   WHERE id = _licenca_id
   RETURNING * INTO _lic;

  INSERT INTO public.licencas_eventos (licenca_id, tipo, mensagem, device_id, ator_user_id, metadata)
  VALUES (_licenca_id, 'device_liberado', 'Dispositivo liberado manualmente pelo suporte.',
          _antes.device_id, auth.uid(),
          jsonb_build_object('device_anterior', _antes.device_id));

  PERFORM public.log_audit('reset_device','licenca',_lic.id, to_jsonb(_antes), to_jsonb(_lic));
  RETURN _lic;
END; $function$;