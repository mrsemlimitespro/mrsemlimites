# Plano de Ação: API Pública MR Social Glow (v17.0+)

Este plano detalha a correção e publicação das rotas de API para compatibilidade com a extensão Chrome "MR Social Glow", garantindo segurança, suporte a múltiplos formatos de chave e conformidade com os requisitos de resposta.

## 1. Ajustes nas Rotas de API Pública
- **Objetivo**: Padronizar respostas e garantir suporte a CORS para extensões Chrome.
- **Rotas Alvo**:
    - `POST /api/public/validar-licenca`
    - `POST /api/public/ext/functions/v1/validate-license-v2`
    - `POST /api/public/licenca/heartbeat`
    - `POST /api/public/licenca/config`

## 2. Implementação Técnica
### A. Validação de Licença
- Suporte a chaves `MR-XXXX-XXXX-XXXX` e alfanuméricas padrão.
- Validação real no banco de dados (`licencas`), não apenas regex.
- Registro de acesso em `licenca_acessos`.
- Controle de dispositivos via `licenca_dispositivos` (limite `max_dispositivos`).
- Formato de resposta JSON fixo (status 200 mesmo em falha para compatibilidade):
    - **Sucesso**: `{ ok: true, valid: true, premium: true, ... }`
    - **Erro**: `{ ok: false, valid: false, reason: "...", error: "..." }`

### B. Heartbeat & Config
- **Heartbeat**: Atualizar último acesso e retornar estado atual (`ativa`, `expirada`, etc).
- **Config**: Retornar `versao_min`, `extension_id` e dados públicos do produto.

### C. Segurança e CORS
- **CORS**: Permitir `chrome-extension://*` e domínios oficiais.
- **Rate Limiting**: Implementar proteção por IP/Chave/Device no nível da aplicação.
- **Proteção de Segredos**: Garantir que `service_role` e chaves privadas nunca saiam do backend.

## 3. Validação e Testes
- Simular requisições de chaves válidas (MR e Padrão), expiradas, bloqueadas e limite de dispositivos.
- Verificar cabeçalhos CORS e requisições OPTIONS.
