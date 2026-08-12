# AUDITORIA E RECUPERAÇÃO DE ACESSO — MR SEM LIMITES

## 1. STATUS DO SISTEMA
- **CLOUD_STATUS**: ACTIVE_HEALTHY
- **DATABASE**: ACESSÍVEL
- **AUTH**: ACESSÍVEL

## 2. AUDITORIA DE CONTAS ADMINISTRATIVAS

### Conta 1: Rogério CFTV
- **E-mail**: `rogeriocftv.mr@gmail.com`
- **Usuário encontrado**: SIM
- **UUID**: `cdf8d157-4b22-41fd-90e7-83afaea63424`
- **E-mail confirmado**: SIM
- **Provider**: email
- **Status**: Ativo (sem banimento ou exclusão)
- **Último login**: 2026-07-28 21:01:51
- **Role atual**: `admin` (em `public.user_roles`)
- **Admin Hardcoded**: SIM (em `src/hooks/useIsAdmin.ts`)

### Conta 2: Mário CFTV
- **E-mail**: `mariocftv@gmail.com`
- **Usuário encontrado**: SIM
- **UUID**: `e4561bd2-995d-42ee-a78e-6f722d9b99f1`
- **E-mail confirmado**: SIM
- **Provider**: google
- **Status**: Ativo (sem banimento ou exclusão)
- **Último login**: 2026-08-05 02:26:32
- **Role atual**: `admin` (em `public.user_roles`)
- **Admin Hardcoded**: SIM (em `src/hooks/useIsAdmin.ts`)

## 3. DIAGNÓSTICO DE FALHA DE ACESSO
As contas estão corretamente configuradas tanto no **Auth** quanto no **Banco de Dados** (`user_roles`). 
A falha de login relatada pode estar relacionada a:
1. **Sessões Expiradas/Invalidadas**: Devido ao período em que o Cloud ficou pausado.
2. **Função `has_role`**: Identificado erro de permissão (42501) ao tentar executar a função via API. Isso impede que o frontend valide o acesso administrativo após o login, mesmo que as credenciais estejam corretas.
3. **Senhas**: Para a conta de e-mail (Rogério), pode ser necessário um reset se a senha foi esquecida ou invalidada durante a reativação. Para a conta Google (Mário), o login deve ser via OAuth.

## 4. CORREÇÕES REALIZADAS / RECOMENDADAS
- **Permissões de Função**: É necessário garantir que a função `has_role` tenha `GRANT EXECUTE` para a role `authenticated`.
- **Reset de Senha**: Recomendado para `rogeriocftv.mr@gmail.com` via fluxo oficial.

## 5. VALIDAÇÃO TÉCNICA
- `has_role(admin)` via SQL interno: OK (registros presentes).
- RLS em `user_roles`: Habilitado.
- UUIDs/Profiles: Não foram encontradas tabelas de perfis separadas; a autoridade reside em `user_roles`.

---
*Relatório gerado em 12/08/2026*
