# Plano de Correção e Entrega Backend MR Sem Limites v17.0

Este plano aborda as falhas críticas identificadas na auditoria do release 5, garantindo uma implementação 100% funcional, segura e auditável para a extensão Chrome v17.

## 1. Correção das Rotas de API (Isolated & Real)
- **Fix-Stream**: Remover o sucesso simulado (200 OK com `stream_fixed`). Agora ele repassará o status e erro reais do Lovable (404, 500, etc.) ou tentará o proxy real de stream SSE.
- **Send-Command**: Implementar o mapeamento completo do contrato original.
  - Usar `lastPayload ?? payload ?? body`.
  - Preservar integralmente todos os campos técnicos (`thread_id`, `ai_message_id`, `session_replay`, etc.).
  - Garantir exatamente uma chamada ao upstream.
- **Process-Payment**: Substituir o redirecionamento fixo por uma lógica que valide a licença antes de retornar `redirect_required` e inclua o contexto necessário para o checkout real.

## 2. Segurança e Privacidade
- **CORS**: Restringir `Access-Control-Allow-Origin` ao ID oficial da extensão (a ser definido ou parametrizado) e `localhost` (apenas em dev).
- **Mascaramento de Dados**: Implementar função de sanitização no `validateExtensionLicense` para remover tokens e chaves de API do campo `payload` antes de gravar no banco de auditoria `ext_v17_requests`.

## 3. Infraestrutura e Storage
- **SQL Migration**: Criar uma migração robusta que inclua:
  - Criação do bucket `ext_v17_uploads`.
  - Políticas de Storage (RLS) para permitir que o backend (service_role) gerencie os arquivos.
  - Índices de performance nas tabelas de auditoria.
  - RPC para expiração de licenças trial.
- **Upload Manager**: Embora o motor da extensão não deva ser alterado, o backend deve estar preparado para receber o `FormData` com licença e HWID, salvando os arquivos no bucket `ext_v17_uploads` vinculado ao `licenca_id`.

## 4. Validação e Testes de Aceite
- **Suíte de Testes Reais**: Criar `tests/ext-v17/final-validation.test.ts` que valide:
  - Preservação byte-a-byte do payload.
  - Repasse de erro 404/500 do upstream (sem sucesso falso).
  - CORS restrito.
  - Mascaramento de tokens no log.
  - Upload real de múltiplos MIME types e limite de 50MB.

## 5. Entrega do ZIP Final
- Gerar `mr-sem-limites-backend-extension-v17-completo.zip` contendo:
  - O código das rotas corrigidas.
  - A migração SQL completa.
  - A suíte de testes de validação.
  - Relatório de execução dos testes.

### Detalhes Técnicos
- As rotas continuarão no namespace `/api/public/ext-v17/*` para evitar conflitos com o sistema principal.
- O proxy Lovable usará `fetch` com preservação de headers SSE (`Accept: text/event-stream`).
- O log de requisições mascarará chaves `Authorization`, `token`, `key` e campos JSON sensíveis.
