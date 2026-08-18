# PLANO DE IMPLEMENTAÇÃO — BACKEND COMPATÍVEL V17.0

## Objetivo
Atender a extensão Chrome `lovable-infinito-v17.0` através de rotas isoladas `/api/public/ext-v17/*` no projeto MR Sem Limites, preservando o banco de dados e as rotas atuais.

## 1. Infraestrutura e Utilitários
- Criar `src/lib/ext-v17/auth.server.ts` para validação centralizada de licença e HWID seguindo as regras estritas da V17.0.
- Criar `src/lib/ext-v17/lovable.server.ts` para encapsular as chamadas ao motor do Lovable.
- Criar `src/lib/ext-v17/storage.server.ts` para gestão de uploads compatíveis.

## 2. Rotas de API (`/api/public/ext-v17/*`)
- `POST validate-license`: Validação de `license_key`, `hwid`, `session_id`.
- `POST heartbeat`: Manutenção de sessão e verificação de status.
- `POST send-chat`: Encaminhamento para `/projects/{projectId}/chat` com preservação de `lastPayload`.
- `POST send-command`: Comandos especiais (v8 compatibility).
- `POST fix-stream`: Correção de stream (v1 compatibility).
- `POST upload`: Upload de arquivos via `upload-manager.js`.

## 3. Segurança e CORS
- Implementar `OPTIONS` em todas as rotas com suporte a `chrome-extension://*` e `localhost`.
- Rate limiting básico (monitoramento via logs de acesso da licença).
- Nenhuma exposição de segredos (`service_role`, `API_KEY`) no frontend.

## 4. Documentação e Entrega
- Criar `INTEGRATION_V17_BACKEND.md`.
- Gerar ZIP `mr-sem-limites-backend-extension-v17-compatible.zip`.
- Gerar `SHA256SUMS.txt`.

## Technical Details
- **Tables used**: `licencas`, `licenca_dispositivos`, `licenca_acessos`.
- **Validation**: Strict normalization via `normalizeLicenseKey`.
- **Proxying**: Explicit single call per command to Lovable API.
