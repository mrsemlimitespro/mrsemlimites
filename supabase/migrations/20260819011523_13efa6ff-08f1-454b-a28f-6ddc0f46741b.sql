-- RPC Final para expiração de licenças trial
CREATE OR REPLACE FUNCTION public.expirar_trials_vencidos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.licencas
    SET status = 'expirada'
    WHERE status = 'ativa'
      AND tipo = 'teste'
      AND expira_em < now();
END;
$$;

-- Permissões básicas para as tabelas v17 (se ainda não aplicadas corretamente)
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO authenticated;
GRANT ALL ON public.ext_v17_sessions TO service_role;
GRANT INSERT ON public.ext_v17_requests TO authenticated;
GRANT ALL ON public.ext_v17_requests TO service_role;
GRANT INSERT ON public.ext_v17_uploads TO authenticated;
GRANT ALL ON public.ext_v17_uploads TO service_role;
