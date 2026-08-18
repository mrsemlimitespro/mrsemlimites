# Plano de Implementação - Rota de Proxy Segura para Extensão (MR Central)

Implementação de uma nova rota de backend (\`/api/public/ext/send-command-compatible\`) para o projeto MR Central, compatível com a extensão Chrome v17.0. Esta rota validará licenças no banco de dados local e encaminhará comandos para o Lovable de forma segura.

## Alterações Propostas

### Backend (Nova Rota)

- **Criar \`src/routes/api/public/ext/send-command-compatible.ts\`**:
    - Implementar handlers \`POST\` e \`OPTIONS\`.
    - Adicionar suporte a CORS restrito (Headers: Content-Type, Authorization, apikey, x-client-info, x-extension-trace-id).
    - Lógica de extração e normalização de chave de licença (\`user_license_key\` > \`licenseKey\` > \`license_key\`).
    - Validação de licença via banco de dados (tabelas \`licencas\` e \`licenca_dispositivos\`).
    - Encaminhamento do payload (\`token\`, \`projectId\`, \`message\`, \`attachments\`, \`lastPayload\`) para a API do Lovable.
    - Garantir que erros de licença retornem \`401/403\` com códigos compatíveis (\`license_invalid\`, \`hwid_mismatch\`, etc.).
    - Garantir que o sucesso retorne \`success: true, ok: true, status: 200\`.

### Documentação e Testes

- **Criar \`src/tests/ext-compatible-route.test.ts\`**:
    - Script de teste isolado validando todos os cenários (sem licença, chave inválida, expirada, revogada, HWID mismatch, sucesso).
- **Gerar \`public/mr-central-extension-route-kit.zip\`**:
    - Pacote contendo a nova rota, utilitários de licença e instruções.

## Detalhes Técnicos

- **Normalização**: Utilizar \`normalizeLicenseKey\` existente em \`src/lib/licenca/utils.ts\`.
- **Segurança**: Uso de \`supabaseAdmin\` (carregado via handler) para validação bypassando RLS se necessário, mantendo o \`service_role\` oculto do cliente.
- **Isolamento**: Nenhuma rota ou arquivo existente (\`src/routes/api/public/ext/send-command.ts\`, etc.) será modificado.

## Passo a Passo

1. Pesquisar a URL da API do Lovable usada no encaminhamento atual.
2. Criar a nova rota com a lógica de validação e proxy.
3. Criar e executar script de teste.
4. Gerar o ZIP de entrega.
