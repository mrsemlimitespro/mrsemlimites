REVOKE EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_licencas(integer, integer, uuid, boolean) TO service_role;