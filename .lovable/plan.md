# Etapa 3 — Migração Packs Premium (Link MR Store Pro → MR Sem Limites)

## Escopo real do módulo no origem

Inventário do projeto Link MR Store Pro:

**Tabelas do banco** (10+ migrations):
- `premium_packs` — tabela principal, ~30 colunas (slug, categoria, source_type, source_url_encrypted, public_token, sales_platform, visibility_status, tags, destaque, downloads, popularidade, etc.)
- `pack_access` — grants de acesso VIP por assinante
- `pack_share_tokens` — tokens temporários de compartilhamento
- `pack_downloads` — auditoria de downloads
- `pack_public_tokens` — links públicos assinados
- Tabelas auxiliares (VIP codes, download security, commercial KPIs)
- Funções `premium_packs_validate`, triggers de auditoria
- Extensões: `pgsodium`/`pgcrypto` para AES-256-GCM

**Código** (`src/lib/premium-packs/`):
- `packs.functions.ts` — CRUD público
- `admin.functions.ts` — CRUD admin
- `access.functions.ts` — grants de acesso VIP
- `share-tokens.functions.ts` — mint/validate share tokens
- `library-sync.functions.ts` + `.server.ts` — sync com Google Drive/Dropbox
- `access-status.functions.ts` — checa se user pode ver pack
- `types.ts`, `format.ts`

**UI** (`src/components/premium-packs/`, 16 arquivos):
- `PremiumPacksHub.tsx` — hub público (grid + filtros)
- `PackDetailPage.tsx` — página de detalhe com abas
- `PackCard`, `PackCover`, `PackOpenDialog`, `PackQuickActions`
- `PackShareDialog`, `PackMediaTab`, `PackMarketplaceStats`
- `PremiumPacksAdmin.tsx` — painel admin completo
- `AccessGrantPanel.tsx` — grants VIP
- `PublicLinkPanel.tsx`, `PublicPackLanding.tsx` — landing pública
- `CoverCropDialog`, `CroppedImageUploader`

**Rotas**:
- `/api/public/pack-download/$slug/$nodeId` — download signing endpoint
- `admin.comercial.tsx` — painel comercial (KPIs, VIP codes, publish builder)
- Landing pública de pack por token

**Integrações externas**:
- Google Drive API (import + streaming)
- Dropbox
- OneDrive
- Cloudflare R2
- Supabase Storage

## Conflitos com o MR Sem Limites

| Conflito | Impacto |
|---|---|
| Rota `/packs` já existe e serve `creditos_packs` (domínio: crédito) | Não posso reusar o path. Usarei `/pacotes` ou `/premium-packs`. |
| Sistema de "assinantes VIP" do origem não existe aqui — só `licencas`/`revendedores` | `pack_access` precisará de FK própria, não integra com licenças. |
| Extensão `pgsodium` para encryption pode não estar habilitada | Se falhar, uso `pgcrypto` (AES-256) ou armazeno URL em texto e restrinjo por RLS admin-only. |
| Instrução original: "não alterar autenticação/licenciamento/dashboard" | Vou criar **sistema paralelo** de acesso a packs (grants + share tokens) que **não toca** em `licencas`. |
| Integrações Google Drive/Dropbox exigem secrets novos | Vou parar antes desta parte e pedir os secrets. |

## Fases da migração (paro entre cada uma)

Cada fase termina com relatório e aguarda aprovação antes da próxima.

### Fase 3.1 — Schema completo
Uma única migration com todas as tabelas e triggers:
- `premium_packs` (com public_token, source_type, source_url_encrypted como jsonb, visibility_status)
- `pack_access` (user_id → auth.users, expires_at)
- `pack_share_tokens` (pack_id, token, expires_at, uses_left)
- `pack_downloads` (pack_id, user_id, node_id, downloaded_at)
- `pack_public_tokens` (para landing pública)
- Trigger `premium_packs_validate`, updated_at
- Policies: leitura pública `TO anon` para packs `status='ativo' AND visibility_status='publico'`; grants via `pack_access`; admin via `has_role('admin')`
- **Sem** vínculo a `licencas`, `revendedores`, `clientes` — sistema paralelo.

### Fase 3.2 — Server functions e types
- Copiar `src/lib/premium-packs/*` do origem
- Adaptar `admin.functions.ts` para usar `requireSupabaseAuth` + `has_role('admin')` (padrão do MR Sem Limites), **não** `requireAdmin` do origem
- `library-sync.functions.ts` — copiar mas comentar chamadas Google Drive/Dropbox até você fornecer secrets
- Tipos e helpers 1:1

### Fase 3.3 — UI pública
- Copiar `PremiumPacksHub`, `PackDetailPage`, `PackCard`, `PackOpenDialog`, `PackQuickActions`, `PackShareDialog`, filtros
- Nova rota `/pacotes` (não `/packs` que já é crédito)
- Integrar com `AINovaDashboard`? **Não** — packs tem hub próprio no origem, mantenho.
- Ajustar `usePremiumFavorites` → `useLocalFavorites` (Etapa 2)

### Fase 3.4 — Rota pública de download
- `src/routes/api/public/pack-download.$slug.$nodeId.ts` copiado 1:1
- Verificar `visibility_status` e token antes de retornar URL assinada
- **Sem** integração Drive/Dropbox nesta fase — retorna 501 até secrets serem fornecidos

### Fase 3.5 — Admin de packs
- `PremiumPacksAdmin` como nova rota admin `/admin/premium-packs` (**não** editar `AdminSidebar` existente — usuário decide se adiciona link depois)
- CRUD + upload de capa + grants VIP + share tokens
- Ainda sem sync externo

### Fase 3.6 — Import de dados (após você exportar do origem)
- Você abre Link MR Store Pro → Admin → Premium Packs → "Exportar JSON"
- Me envia o arquivo
- Faço INSERT em `premium_packs` (e depois AI Prompts + AI Agents)

### Fase 3.7 (opcional, futura) — Integrações externas
- Google Drive, Dropbox, R2 — só após você:
  - Autorizar os secrets (`GOOGLE_DRIVE_SERVICE_ACCOUNT`, `DROPBOX_TOKEN`, etc.)
  - Confirmar que quer os connectors ativos

## O que **não** será tocado

- `licencas`, `revendedores`, `clientes`, `payment_transactions`, `creditos_movimentos` → intactos
- `AdminSidebar` existente → intacto (link novo para `/admin/premium-packs` fica pra você adicionar se quiser)
- Rota `/packs` (créditos) → intacta
- `_authenticated` layout, login, ROLE, dashboard `/` → intactos
- Tabelas `ai_prompts`, `ai_agents`, `prompt_favorites` → intactas (já usadas pelas Etapas 1-2)

## Riscos claros

1. **AES encryption** — se `pgsodium` não estiver disponível, source URLs ficarão em texto plano restritas a admin via RLS (não é o padrão do origem, mas é mais seguro do que quebrar).
2. **Download signing** — sem integrações externas, o endpoint responde 501 até você fornecer secrets. Cards de pack ainda funcionam para preview.
3. **Landing pública** — mantida, mas `visibility_status='publico'` + `public_token` são obrigatórios; sem isso não aparece.

## Decisão que preciso agora

Aprovar a **Fase 3.1 (schema)** primeiro. Vou submeter uma única migration com todas as tabelas do módulo Packs Premium, sem tocar em nada existente. Você aprova a SQL antes dela rodar. Só depois sigo para 3.2.

**Confirma que posso submeter a migration da Fase 3.1?**
