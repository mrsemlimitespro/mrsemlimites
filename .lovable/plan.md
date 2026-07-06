
# Migração cirúrgica: Link MR Store Pro → MR Sem Limites

Fiz o reconhecimento do projeto origem. Antes de copiar qualquer coisa preciso te avisar de restrições reais que o próprio código origem impõe — senão a migração vai quebrar as regras que você definiu.

## O que existe no projeto origem

**Rotas alvo (todas dentro de `/premium/*`):**
- AI Prompts → `premium.ai-prompts.tsx`, `premium.ai-studio.*` (12 sub-rotas), `premium.biblioteca-prompts.tsx`, `prompts-admin.tsx`, `10-prompts-secretos.tsx`
- AI Agents → `premium.ai-agents.tsx`, `premium.ai-studio.agentes.tsx`, `AIAgentsManager.tsx`
- Packs Premium → `premium.packs.tsx`, `premium.pack.$slug.tsx`, `pack.$slug.tsx`, `obrigado.pack.$slug.tsx`

**Diretórios de código correspondentes:**
- `src/components/prompts-library/`, `src/components/ai-studio/`, `src/components/ai-modules/`
- `src/components/premium-packs/`, `src/components/pack-viewer/`
- `src/lib/prompts-library/`, `src/lib/ai-studio/`, `src/lib/ai-modules/`, `src/lib/premium-packs/`, `src/lib/pack-viewer/`, `src/lib/pack-download/`
- Server fns: `prompts.functions.ts`, `prompts-library.functions.ts`, `ai-agents.functions.ts`, `premium-*.functions.ts`

## Conflitos que preciso resolver ANTES de começar

O código origem está **profundamente acoplado** ao ecossistema `/premium/*` do Link MR Store, que não existe no MR Sem Limites:

1. **Todas as rotas alvo vivem sob a shell `premium.tsx`** — usa `PremiumSidebar`, `PremiumGate`, `ModuleGate`, `useAuthorization`, `useVitrineMode`, `subscriber-permissions`, `module-access`, `vitrine`. Isso é justamente o "Sistema de Assinaturas / VIP / Vitrine / Marketplace Público" que você mandou NÃO migrar.
2. **`AdminSidebar` / `AdminDashboard`** origem tem entradas dedicadas para Prompts/Agents/Packs. O MR Sem Limites tem `AdminSidebar` próprio — mesclar corre risco de mexer no Painel Admin existente (proibido).
3. **Tabelas origem** para prompts/agents/packs provavelmente têm FKs para tabelas de assinantes/VIP/vitrine que não existem aqui.
4. **`clientes`, `revendedores`, `licencas`, `payment_transactions`** do MR Sem Limites são estruturas totalmente diferentes das do origem — não dá pra reaproveitar o modelo de acesso.

## Como pretendo migrar (respeitando suas regras)

Como não posso trazer PremiumGate/Vitrine/Subscribers, vou **desacoplar** cada módulo:

- Trocar `premium.*` prefix por rotas próprias no MR Sem Limites: `/ai-prompts`, `/ai-agents`, `/packs`
- Trocar gates de assinatura por gate de **licença ativa** do MR Sem Limites (usa `licencas` + `has_role('admin')` já existentes)
- Copiar UI/hooks/services 1:1; apenas os pontos de acesso trocam
- Admin: rota nova `/admin/ai-prompts`, `/admin/ai-agents`, `/admin/packs` — NÃO edito seu `AdminSidebar` atual, só adiciono links via componente novo no menu (se você autorizar) ou mantenho páginas acessíveis por URL direta
- Tabelas novas em `public.*` com prefixo neutro; FKs a `auth.users`, `has_role`, `revendedores` quando fizer sentido — nada em cima de tabelas existentes

## Etapa 1 — AI Prompts (o que farei nesta etapa apenas)

**Arquivos a copiar** (via `cross_project--copy_project_asset` para assets e leitura+recriação para código):
```
src/routes/premium.ai-prompts.tsx           → src/routes/ai-prompts.tsx
src/routes/premium.ai-studio.prompts.tsx    → src/routes/ai-studio.prompts.tsx
src/routes/premium.ai-studio.favoritos.tsx  → src/routes/ai-studio.favoritos.tsx
src/routes/premium.ai-studio.historico.tsx  → src/routes/ai-studio.historico.tsx
src/routes/premium.ai-studio.recentes.tsx   → src/routes/ai-studio.recentes.tsx
src/routes/premium.ai-studio.mais-utilizados.tsx → …
src/routes/premium.ai-studio.colecoes.tsx   → …
src/routes/premium.ai-studio.templates.tsx  → …
src/routes/premium.ai-studio.index.tsx      → src/routes/ai-studio.index.tsx
src/routes/premium.biblioteca-prompts.tsx   → src/routes/biblioteca-prompts.tsx
src/routes/prompts-admin.tsx                → src/routes/admin.ai-prompts.tsx
src/components/prompts-library/**
src/components/ai-studio/**
src/lib/prompts-library/**
src/lib/ai-studio/**
src/lib/prompts.functions.ts
src/lib/prompts-library.functions.ts
src/lib/prompts-classifier.ts
```

**Banco (migration única para Etapa 1):**
- Comparar schema de `ai_prompts`, `prompt_favorites`, `prompt_history`, `prompt_classification_learning` (já existem no MR Sem Limites!) com o origem
- Se colunas divergirem: **paro e te aviso** — não altero as tabelas existentes sem confirmação
- Se estiver compatível: só adiciono policies/GRANTs faltantes e tabelas auxiliares novas (ex.: `prompt_collections`, `prompt_templates` se houver)

**Relatório ao final da Etapa 1** com a auditoria completa que você pediu, e paro para confirmação.

## O que preciso que você confirme antes de eu tocar em qualquer arquivo

1. **Rotas fora de `/premium`** — OK trocar `premium.ai-prompts` → `/ai-prompts`? (Alternativa: criar `/premium` shell novo do zero — muito mais trabalho e conflita com "não migrar sistema VIP")
2. **Gate de acesso** — usar `has_role('admin')` + licença ativa do MR Sem Limites, OU deixar as páginas 100% abertas para usuários logados?
3. **Admin dos módulos** — criar rotas em `/admin/ai-prompts` etc. **sem** editar o `AdminSidebar` existente (acesso por URL direta), ou você libera eu adicionar itens no menu admin?
4. **Tabelas já existentes** (`ai_prompts`, `ai_agents`, `prompt_favorites`, `prompt_history`, `prompt_classification_learning`) — se o schema do origem tiver colunas a mais, posso adicionar colunas novas via `ALTER TABLE ADD COLUMN` (não destrutivo)?

Sem essas respostas, qualquer migração vai violar uma das suas restrições. Depois que você responder, executo a Etapa 1 completa e paro.
