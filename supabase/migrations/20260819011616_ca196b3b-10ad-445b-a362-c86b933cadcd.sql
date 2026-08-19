-- Revogar execução pública da função SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.expirar_trials_vencidos() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.expirar_trials_vencidos() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.expirar_trials_vencidos() TO service_role;
