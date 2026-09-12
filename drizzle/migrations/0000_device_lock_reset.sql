ALTER TABLE public.licencas ADD COLUMN IF NOT EXISTS device_vinculado_em timestamptz;

-- Backfill: traz para licencas.device_id o dispositivo mais recente já registrado
UPDATE public.licencas l
SET device_id = d.device_id,
    device_vinculado_em = COALESCE(l.device_vinculado_em, d.primeiro_acesso, now())
FROM (
  SELECT DISTINCT ON (licenca_id) licenca_id, device_id, primeiro_acesso
  FROM public.licenca_dispositivos
  ORDER BY licenca_id, COALESCE(ultimo_acesso, primeiro_acesso) DESC
) d
WHERE d.licenca_id = l.id AND (l.device_id IS NULL OR l.device_id = '');

CREATE OR REPLACE FUNCTION public.resetar_device_licenca(_licenca_id uuid)
RETURNS public.licencas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _lic public.licencas; _antes public.licencas;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Sem permissão.';
  END IF;
  SELECT * INTO _antes FROM public.licencas WHERE id = _licenca_id;
  IF _antes.id IS NULL THEN RAISE EXCEPTION 'Licença não encontrada.'; END IF;

  DELETE FROM public.licenca_dispositivos WHERE licenca_id = _licenca_id;

  UPDATE public.licencas
     SET device_id = NULL, device_vinculado_em = NULL, ultimo_acesso = NULL
   WHERE id = _licenca_id
   RETURNING * INTO _lic;

  INSERT INTO public.licencas_eventos (licenca_id, tipo, mensagem, device_id, ator_user_id, metadata)
  VALUES (_licenca_id, 'device_liberado', 'Dispositivo liberado manualmente pelo suporte.',
          _antes.device_id, auth.uid(),
          jsonb_build_object('device_anterior', _antes.device_id));

  PERFORM public.log_audit('reset_device','licenca',_lic.id, to_jsonb(_antes), to_jsonb(_lic));
  RETURN _lic;
END; $$;