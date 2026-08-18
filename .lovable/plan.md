# Plano de Implementação: Backend Completo Compatível v17.0

Este plano descreve a implementação de um backend isolado e funcional no projeto **MR Sem Limites** para suportar a extensão Lovable-Infinito v17.0, sem alterar a extensão original.

## 1. Infraestrutura de Banco de Dados e Segurança
- Criar migração SQL para tabelas auxiliares: `ext_v17_sessions`, `ext_v17_requests`, `ext_v17_uploads`.
- Definir políticas RLS (Row Level Security) e conceder permissões (GRANT) para `authenticated` e `service_role`.
- Criar bucket de storage `ext_v17_uploads` no Supabase.

## 2. Camada de Serviço (Server-Side)
- **auth.server.ts**: Refinar a validação de licenças MR (aliases de chaves, HWID, expiração).
- **lovable.server.ts**: Implementar proxy real para a API do Lovable (`/chat`), preservando integralmente o `lastPayload` e `ai_message_id`.
- **storage.server.ts**: Lógica de upload real para o bucket seguro.

## 3. Rotas de API Isolated (/api/public/ext-v17/*)
- `validate-license`: Validação profunda de status e dispositivos.
- `heartbeat`: Manutenção de sessão ativa.
- `send-chat`: Proxying de mensagens com suporte a stream.
- `send-command`: Implementação do fluxo `send-command-v8` (edição visual, etc.).
- `fix-stream`: Suporte a recuperação de stream SSE.
- `upload`: Upload de arquivos reais com retorno de URL pública/assinada.
- `create-project` & `publish-project`: Mapeamento de criação e publicação no Lovable.
- `proxy-command` & `send-lovable-message`: Aliases para compatibilidade total.
- `process-payment`: Handler de sinalização de pagamento (via MR Central).

## 4. Testes e Validação
- Criar suite de testes em `tests/ext-v17/` cobrindo todos os cenários obrigatórios (licença, payload, proxying, stream).
- Validar ausência de stubs (501) ou mocks de sucesso falso.

## 5. Documentação e Entrega (ZIP)
- Gerar ZIP `mr-sem-limites-backend-extension-v17-completo.zip` com:
    - Código fonte isolado.
    - Migrações e políticas.
    - Testes executáveis.
    - Guias de integração e ambiente.

## Detalhes Técnicos
- **CORS**: Restrito a `chrome-extension://*`.
- **Segurança**: Uso exclusivo de `supabaseAdmin` server-side para validação de licenças; chaves de API nunca expostas ao cliente.
- **TanStack Start**: Implementação via `createFileRoute` com handlers server.
