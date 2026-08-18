# ROUTE CONTRACTS V17.0

## Validate License
**Endpoint**: `POST /api/public/ext-v17/validate-license`
**Payload**:
```json
{
  "key": "MR-XXXX-XXXX-XXXX",
  "hwid": "fingerprint"
}
```
**Response**:
```json
{
  "ok": true,
  "valid": true,
  "status": "active",
  "user_name": "Usuario",
  "expires_at": "ISO-DATE",
  "session_id": "sess_..."
}
```

## Send Chat
**Endpoint**: `POST /api/public/ext-v17/send-chat`
**Payload**:
```json
{
  "projectId": "uuid",
  "token": "lovable-token",
  "lastPayload": { ... }
}
```
**Response**: Proxy direto (Stream ou JSON) do Lovable.
