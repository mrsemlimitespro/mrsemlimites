# Plano de Auditoria e Correção Final — Release 6

Correção definitiva do backend MR Sem Limites para a extensão v17.0, eliminando sucessos simulados e garantindo compatibilidade total com o motor original.

## Correções Técnicas Obrigatórias

### 1. Rota `fix-stream` (Real Passthrough)
- **O que:** Remover o bloco de fallback que retorna `ok: true`.
- **Como:** Repassar integralmente o status e corpo do erro do Lovable (404, 500, etc.) para que o motor da extensão gerencie a falha.
- **Arquivo:** `src/routes/api/public/ext-v17/fix-stream.ts`.

### 2. Rota `send-command` (Mapeamento Completo)
- **O que:** Expandir o mapeamento de tipos de comando para endpoints específicos do motor.
- **Mapeamento:**
  - `publish` -> `/publish`
  - `deploy` -> `/deploy`
  - `preview` -> `/preview`
  - `reset` -> `/reset`
  - `undo` -> `/undo`
  - `redo` -> `/redo`
  - `terminal_command` -> `/terminal`
  - `file_content` -> `/files`
  - `project_config` -> `/config`
  - Outros -> `/chat` (fallback seguro).
- **Preservação:** Manter `lastPayload` byte-a-byte sem alterações.
- **Arquivo:** `src/routes/api/public/ext-v17/send-command.ts`.

### 3. Rota `process-payment` (Checkout Seguro)
- **O que:** Definir a resposta como `redirect_required` vinculada à licença validada.
- **Como:** Retornar a URL de checkout MR Sem Limites contendo `licenca_id` e `key`, forçando o redirecionamento do motor.
- **Arquivo:** `src/routes/api/public/ext-v17/process-payment.ts`.

### 4. Integração do `UploadManager`
- **O que:** Substituir o transporte de upload na extensão (mockado no backend novo) para apontar para a rota centralizada.
- **Arquivo:** `src/routes/api/public/ext-v17/upload.ts` (já implementado, verificar aderência ao contrato).

## Infraestrutura e Auditoria
- **Migrations:** Consolidar e aplicar migrations para as tabelas `ext_v17_sessions`, `ext_v17_requests` e `ext_v17_uploads`.
- **Storage:** Garantir que o bucket `ext_v17_uploads` esteja configurado com as permissões corretas.
- **Testes:** Executar suíte `tests/ext-v17/final-validation.test.ts` cobrindo 100% dos requisitos.

## Entrega
- **ZIP Final:** Gerar novo pacote `mr-sem-limites-backend-extension-v17-completo.zip` via `scripts/generate_final_zip.cjs`.
- **URL de Download:** https://mrsemlimites.lovable.app/api/public/ext-v17/download-zip.
