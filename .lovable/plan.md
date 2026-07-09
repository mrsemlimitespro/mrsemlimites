## O que será construído

Um sistema de licenças em duas camadas: a **chave do fornecedor** fica criptografada no servidor e **nunca sai dele**; o cliente recebe apenas a **chave MR pública**. A extensão consulta a API MR, que decide se libera, e opcionalmente valida contra o fornecedor por baixo. Nada quebra do que já existe hoje — tudo é aditivo.

---

### 1. Banco de dados (migração)

Novas colunas em `public.licencas`:

- `chave_fornecedor_encrypted` (jsonb) — chave real do fornecedor, AES-256-GCM (mesma crypto dos packs).
- `fornecedor_slug` (text) — ex.: `omega`, `alpha`, `outro`. Define qual proxy chamar.
- `produto_id` (uuid, FK para nova `licenca_produtos`).
- `tipo` (enum: `teste` | `premium`).
- `trial_duracao_minutos` (int) — 15, 30, 60, 120, 1440, 10080, 43200.
- `trial_iniciado_em` (timestamp) — gravado na 1ª validação.
- `max_dispositivos` (int, default 1) — 1, 2, 5, ou `NULL` = ilimitado.
- `versao_min` (text, nullable).
- `observacoes_admin` (text, nullable).

Nova tabela `public.licenca_produtos`:
- `nome`, `slug`, `descricao`, `fornecedor_padrao`, `versao_atual`, `ativo`.

Nova tabela `public.licenca_dispositivos` (substitui o `device_id` único quando `max_dispositivos > 1`):
- `licenca_id`, `device_id`, `device_nome`, `ip`, `user_agent`, `cidade`, `primeiro_acesso`, `ultimo_acesso`.
- Unique `(licenca_id, device_id)`.

Nova tabela `public.licenca_acessos` (histórico):
- `licenca_id`, `device_id`, `ip`, `user_agent`, `versao`, `resultado` (`ok` | `trial_expired` | `blocked` | `device_limit` | `invalid`), `created_at`.

Nova função SQL `expirar_trials_vencidos()` — marca `status='expirada'` quando `tipo='teste' AND trial_iniciado_em + trial_duracao_minutos < now()`. Chamada pela API a cada validação (lazy) + agendada.

RLS: mesmas regras das `licencas` existentes; `service_role` full; `authenticated` scoped por revendedor.

### 2. Server functions admin (`src/lib/licencas/*.functions.ts`)

- `adminListLicencas` — lista com filtros por tipo/status/produto.
- `adminUpsertLicenca` — cria/edita; recebe `chave_fornecedor_plain` opcional (criptografa server-side); nunca retorna a chave em plain.
- `adminRevelarChaveFornecedor` — retorna a chave descriptografada só sob `has_role('admin')`, para exibir uma vez ao admin.
- `adminConverterEmPremium` — muda `tipo='premium'`, zera `trial_iniciado_em`, remove `expira_em`, mantém a mesma chave MR.
- `adminBloquearLicenca`, `adminReativarLicenca`, `adminResetDispositivos`.
- `adminListDispositivos(licencaId)`, `adminListAcessos(licencaId)`.
- `adminListProdutos`, `adminUpsertProduto`.

Todas com `requireSupabaseAuth` + `assertAdmin`.

### 3. Endpoint público estendido (`/api/public/validar-licenca`)

Mantém o mesmo path (não quebra a extensão atual). Novo comportamento:

```text
POST /api/public/validar-licenca
{ email, chave, device_id, versao?, ip? }

→ 1. Busca licença pela chave MR.
  2. Se tipo=teste e trial_iniciado_em NULL → grava now(), calcula expira_em = now() + duracao.
  3. Chama expirar_trials_vencidos() lazy.
  4. Valida device: se count(dispositivos) >= max_dispositivos e device_id novo → nega.
     Registra dispositivo no primeiro acesso.
  5. Se fornecedor_slug != null → chama proxy interno ao fornecedor (server-side, com a chave descriptografada).
  6. Insere log em licenca_acessos.
  7. Retorna { ok, premium, expires_in, reason? }.
```

`expires_in` calculado dinamicamente para o warning de 5 min.

### 4. Proxy ao fornecedor (`src/lib/licencas/fornecedores.server.ts`)

Handlers por `fornecedor_slug`. Cada handler recebe a chave descriptografada e faz `fetch` ao endpoint do fornecedor. Registro inicial com adapter genérico (`custom_http`) configurável por produto — endpoint, método, template de body. Assim novos fornecedores entram sem código novo.

Falha do fornecedor → retorna `{ ok:false, reason:'upstream_unavailable' }`; NÃO libera por default (fail-closed).

### 5. UI Admin

Estende a página existente `admin.$resource.tsx` com o recurso `licencas` atualizado em `src/lib/admin/resources.ts`:

- Aba **Identificação**: produto, tipo (teste/premium), chave MR (gerada automaticamente ao criar).
- Aba **Fornecedor**: fornecedor_slug (select), campo secreto para chave do fornecedor (com botão "revelar/editar"), endpoint custom se `outro`.
- Aba **Teste**: duração (dropdown com presets), preview do horário de expiração.
- Aba **Dispositivos**: max_dispositivos (1/2/5/ilimitado), lista de dispositivos registrados com botão "resetar".
- Aba **Cliente**: nome, email, telefone, empresa (já existe).
- Aba **Histórico**: tabela de `licenca_acessos` — IP, cidade, versão, resultado, timestamp.
- Botões de ação no topo do detalhe: **Converter em Premium**, **Bloquear**, **Renovar**, **Resetar Dispositivos**.

Novo recurso `licenca_produtos` no admin sidebar.

### 6. UI Revendedor (`_app.licencas.tsx`)

Adição mínima: coluna "Tipo" (teste/premium) + badge de tempo restante quando trial. Sem exposição de fornecedor.

---

## Detalhes técnicos

- Criptografia reaproveita `src/lib/premium-packs/crypto.server.ts` (AES-256-GCM, chave derivada de `SUPABASE_SERVICE_ROLE_KEY`).
- Geração de chave MR: prefixo `MR-YYYY-XXXX-XXXX-XXXX` (mesma base32 sem ambíguos da `gerar_chave_licenca`, com prefixo custom).
- `expirar_trials_vencidos()` roda como SECURITY DEFINER, chamada dentro do endpoint público (lazy) — sem cron externo.
- Endpoint público continua retornando o shape antigo `{ ok, expira_em, cliente_id }` **mais** os novos campos (`premium`, `expires_in`, `reason`) — extensões antigas continuam funcionando.
- Fail-closed em qualquer erro upstream.

## Arquivos que serão criados

- `supabase/migrations/<timestamp>_licencas_v2.sql`
- `src/lib/licencas/_guard.ts`
- `src/lib/licencas/admin.functions.ts`
- `src/lib/licencas/produtos.functions.ts`
- `src/lib/licencas/fornecedores.server.ts`
- `src/lib/licencas/gerar-chave.ts`

## Arquivos editados (sem quebrar)

- `src/routes/api/public/validar-licenca.ts` — retrocompatível.
- `src/lib/admin/resources.ts` — recurso `licencas` estendido + novo `licenca_produtos`.
- `src/routes/_app.licencas.tsx` — coluna tipo/tempo restante.

Confirma que posso seguir e implementar tudo isso?