# Integração Backend MR Sem Limites — Extensão V17.0 (Fixed)

Este documento descreve as rotas e contratos do backend compatível com a extensão original `lovable-infinito-v17.0`.

## Endpoints Principais (Prefixo `/api/public/ext-v17/`)

### 1. Validação de Licença
- **Rota:** `POST /validate-license`
- **Payload:**
  ```json
  {
    "license_key": "MR-XXXX-XXXX-XXXX",
    "hwid": "fingerprint-dispositivo",
    "session_id": "opcional"
  }
  ```
- **Resposta Sucesso (200):**
  ```json
  {
    "ok": true,
    "valid": true,
    "status": "active",
    "license_key": "MR-...",
    "user_name": "...",
    "expires_at": "ISO-DATE",
    "session_id": "...",
    "device_id": "..."
  }
  ```

### 2. Heartbeat
- **Rota:** `POST /heartbeat`
- **Funcionamento:** Idêntico ao `validate-license`, usado para manter a sessão ativa e verificar status em tempo real.

### 3. Envio de Chat (Proxy Lovable)
- **Rota:** `POST /send-chat`
- **Payload:**
  ```json
  {
    "token": "lovable-session-token",
    "projectId": "uuid-projeto",
    "license_key": "MR-...",
    "lastPayload": { ... motor payload ... }
  }
  ```
- **Regras:**
  - Preserva `lastPayload` integralmente.
  - Exige `ai_message_id` original (não gera IDs artificiais).
  - Proxy para `https://api.lovable.dev/projects/{projectId}/chat`.

### 4. Outras Rotas (Status: 501 Not Implemented)
- `POST /send-command`: Comandos v8.
- `POST /fix-stream`: Correção de stream v1.
- `POST /upload`: Gestão de uploads.

## Segurança e CORS
- **Origens permitidas:** `chrome-extension://*`, `http://localhost:*`.
- **Headers:** `Authorization`, `Content-Type`, `x-lovable-project-id`.

## Variáveis de Ambiente Necessárias
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
