# INTEGRATION V17.0 BACKEND COMPLETE

Este documento detalha a implementação do backend compatível com a extensão Lovable-Infinito v17.0 no ecossistema **MR Sem Limites**.

## Visão Geral
O backend foi implementado de forma isolada no namespace `/api/public/ext-v17/*` para garantir que as funcionalidades existentes do MR Central não sejam afetadas.

## Endpoints Implementados
- `POST /api/public/ext-v17/validate-license`: Valida chaves MR-XXXX, HWID e expiração.
- `POST /api/public/ext-v17/heartbeat`: Mantém a sessão ativa e audita o uso.
- `POST /api/public/ext-v17/send-chat`: Proxy real para o chat do Lovable, preservando `lastPayload`.
- `POST /api/public/ext-v17/send-command`: Proxy para comandos de edição visual e ações do motor v17.
- `POST /api/public/ext-v17/fix-stream`: Recuperação de contexto de stream SSE.
- `POST /api/public/ext-v17/upload`: Upload real para Storage Supabase com URLs públicas.
- `POST /api/public/ext-v17/create-project`: Criação de projetos via API Lovable.
- `POST /api/public/ext-v17/publish-project`: Publicação de projetos via API Lovable.
- `POST /api/public/ext-v17/send-lovable-message`: Alias para mensagens diretas.
- `POST /api/public/ext-v17/proxy-command`: Proxy genérico para compatibilidade.
- `POST /api/public/ext-v17/process-payment`: Sinalização de fluxo de pagamento MR.

## Segurança
- **CORS**: Restrito a `chrome-extension://*`.
- **HWID**: Limite estrito de dispositivos por licença.
- **Auditoria**: Todas as requisições e sessões são registradas em tabelas `ext_v17_*`.

## Como Testar
1. Configure `SUPABASE_SERVICE_ROLE_KEY` no ambiente.
2. Execute `bunx vitest run tests/ext-v17/integration.test.ts`.
