# Plano de Correção e Auditoria Final — Backend v17.0 (Release 9)

Este plano corrige os bloqueadores remanescentes nas releases anteriores, garantindo que não haja sucessos simulados, que o mapeamento de comandos seja completo e que a infraestrutura de upload/pagamento seja real e segura.

## Alterações Técnicas

### 1. Rota `fix-stream.ts`
- Remoção definitiva de qualquer bloco que retorne `ok: true` ou `status: "stream_fixed"` em caso de erro upstream (404, 500, etc).
- O backend repassará o status code e o corpo da resposta original do Lovable sem alterações.

### 2. Rota `send-command.ts`
- Implementação de mapeamento exaustivo para comandos do motor v17:
    - `publish`, `deploy`, `preview`, `reset`, `undo`, `redo`, `terminal_command`, `file_content`, `project_config`.
- Preservação byte-a-byte do `motorPayload` (incluindo `ai_message_id`, `viewport`, etc).
- Garantia de **uma única chamada** upstream por comando.

### 3. Rota `process-payment.ts`
- Implementação da **Opção B**: Declaração explícita de redirecionamento.
- Validação estrita da licença antes de retornar o status `redirect_required`.
- Retorno de erro 403 para licenças inválidas/expiradas.

### 4. UploadManager da Extensão
- Criação do adaptador em `src/lib/ext-v17/upload-adapter.js` (a ser incluído no ZIP).
- Migração total para o endpoint `/api/public/ext-v17/upload`.
- Remoção completa de URLs e chaves anon de buckets Supabase antigos.
- Preservação do comportamento de progresso e assinatura da função.

### 5. Segurança e CORS
- Restrição de CORS apenas para `chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk`.
- Implementação de mascaramento de dados sensíveis (`Authorization`, `key`) nos logs de auditoria `ext_v17_requests`.

### 6. Infraestrutura e Publicação
- Execução e verificação das migrations SQL (`ext_v17_sessions`, `ext_v17_requests`, `ext_v17_uploads`).
- Configuração de buckets e RLS via `supabaseAdmin`.

## Verificação e Auditoria
- Execução da suíte de testes `tests/ext-v17/release-9-validation.test.ts` cobrindo todos os cenários.
- Cálculo do SHA-256 do novo ZIP para garantir unicidade e aplicação das mudanças.

O resultado será um backend isolado, seguro e 100% compatível com a extensão v17.0 original.
