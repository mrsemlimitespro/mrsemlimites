-- TABELAS AUXILIARES PARA EXTENSÃO V17.0 (CORREÇÃO DE GRANTS E POLÍTICAS)

-- Revogar EXECUTE público de funções que possam ser SECURITY DEFINER se necessário, 
-- mas as tabelas criadas no passo anterior são o foco aqui.

-- As políticas criadas anteriormente para service_role estão corretas.
-- Vamos adicionar políticas para authenticated acessarem apenas seus próprios dados se aplicável,
-- mas como o backend v17.0 usa supabaseAdmin (service_role) para a maioria das operações de proxy,
-- o acesso via authenticated é opcional, mas vamos garantir que não haja vazamento.

-- SESSION: Apenas service_role ou o próprio usuário (se mapeado, mas o v17 usa HWID/Chave)
-- No v17, o auth é por licença, então service_role é o executor principal.

-- Garantir que anon não tenha acesso nenhum (já é o padrão sem GRANT anon)
REVOKE ALL ON public.ext_v17_sessions FROM anon;
REVOKE ALL ON public.ext_v17_requests FROM anon;
REVOKE ALL ON public.ext_v17_uploads FROM anon;

-- Auditoria de permissões de tabelas existentes para evitar o linter warn se possível
-- (Mas os avisos do linter podem ser de tabelas pré-existentes do MR Sem Limites)
