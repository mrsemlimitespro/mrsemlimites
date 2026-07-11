
# Sistema de Módulos Dinâmicos — MR Sem Limites

## Objetivo

Criar um gerenciador central onde o admin liga/desliga cada módulo do sistema com um clique. Módulos desativados somem da UI (sidebar, home, dashboard, busca) mas **nunca perdem dados**. Nada do design/layout/rotas/cores/animações atuais é alterado — só adicionamos uma camada de visibilidade por cima.

---

## Escopo — o que muda e o que NÃO muda

**NÃO muda:**
- Identidade visual, tokens, glass, neon, gradientes, animações
- Nenhuma rota existente, componente existente ou tabela existente
- Nenhuma funcionalidade — tudo continua funcionando igual quando ativo

**Muda (adição):**
- Nova tabela `system_modules` (catálogo + flags de visibilidade + ordem + favorito)
- Nova rota admin: `/admin/modulos` (🧩 Módulos)
- Sidebar admin, cards da Home admin, e busca passam a **filtrar** pela tabela
- Hook `useModules()` centraliza leitura + cache

---

## Fase 1 — Banco

Migration cria `system_modules`:

```
id uuid pk
slug text unique         -- ex: "loja", "pagamentos", "creditos"
nome text
descricao text
icone text               -- nome do ícone lucide (string)
categoria text           -- Administração | Loja | Financeiro | Marketing | IA | Conteúdo | Segurança | Sistema | Uploads | Configurações | Outros
rota text                -- ex: "/admin/loja"
ordem int default 0
cor text                 -- token hex/oklch opcional
ativo bool default true
favorito bool default false
mostrar_dashboard bool default true
mostrar_sidebar bool default true
mostrar_home bool default true
mostrar_busca bool default true
created_at, updated_at
```

- RLS: SELECT para `authenticated` (todos podem ler o catálogo); INSERT/UPDATE/DELETE apenas para `has_role(auth.uid(),'admin')`.
- GRANTs padrão (`authenticated`, `service_role`).
- Seed inline no migration com **todos os módulos existentes hoje**, marcados `ativo=true`:
  Painel, Configurações Gerais, Personalização, Animações, Sons, Usuários, Loja, Produtos & Galeria, Pagamentos, Ajustar Créditos, Segurança, Autorizações de Packs, Backup + todos os `resources.ts` (Licenças, Clientes, Revendedores, Planos, Promoções, Carrossel, Banners, Propagandas, Imagens, Vídeos, Aulas, Agentes, Prompts, Packs, Notificações, Logs, etc.).

## Fase 2 — Hook central `useModules()`

`src/lib/admin/use-modules.ts`:
- `useQuery(['system_modules'])` busca via `supabase.from('system_modules').select('*').order('favorito desc, ordem asc, nome')`
- Retorna helpers: `isActive(slug)`, `visibleIn('sidebar'|'home'|'dashboard'|'busca')`, `bySlug(slug)`
- Cache 5min, invalida ao salvar mudanças

## Fase 3 — Sidebar e Home admin passam a filtrar

**`src/routes/admin.tsx`** (sidebar):
- `specialLinks` e `resources` continuam existindo como **catálogo default** (fallback quando a tabela ainda não retornou)
- Antes de renderizar, filtrar por `modules.visibleIn('sidebar')` — item cujo `slug` está inativo simplesmente não é renderizado
- Ordem/favoritos aplicados quando presentes na tabela

**`src/routes/admin.index.tsx`** (Home / Visão Geral):
- Grid de cards deixa de ser fixo — mapeia `modules.visibleIn('home')`
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`
- Favoritos ⭐ vêm primeiro (já ordenado no query)

Rotas continuam existindo e acessíveis por URL direta — apenas a **descoberta visual** some.

## Fase 4 — Tela `/admin/modulos`

`src/routes/admin.modulos.tsx`:
- Header: título + busca em tempo real (nome/categoria/status) + filtro por categoria
- Grid de cards agrupado por categoria (colapsável)
- Cada card mostra: ícone, nome, descrição, categoria, status (badge), switch ON/OFF, botão ⭐ favorito, campo ordem, seletor de cor
- Drag-and-drop com `@dnd-kit` (já instalado) para reordenar — salva `ordem` em batch
- Toggles individuais para `mostrar_sidebar`, `mostrar_home`, `mostrar_dashboard`, `mostrar_busca` (menu contextual "⋯ Onde exibir")
- Contador de registros: consulta agregada opcional por slug (lazy, só quando expandido)
- Toast ao salvar; mutations invalidam `['system_modules']`

Adicionar link "Módulos" 🧩 em `specialLinks` do `admin.tsx`.

## Fase 5 — Busca global (opt-in)

Se houver componente de command palette / busca admin, respeitar `visibleIn('busca')`. Se ainda não existir, fica preparado — nada a fazer agora.

## Fase 6 — Novos módulos futuros

Convenção documentada em `AGENTS.md`: ao criar um novo módulo admin, adicionar entrada no seed via migration com `ativo=true` por padrão. Não há auto-registro em runtime (mantém previsibilidade).

---

## Detalhes técnicos

- **Ícones**: coluna `icone` armazena nome (`"Store"`, `"CreditCard"`…). Componente `<ModuleIcon name={...} />` faz lookup em `lucide-react` com fallback para `Package`.
- **Permissões por módulo (Admin/Funcionário/Cliente/Revendedor)**: fora do escopo desta entrega — o gate atual continua igual. Adicionar coluna `roles jsonb default '["admin"]'` na tabela agora, mas UI de edição só na fase seguinte (evita quebrar RLS/rotas existentes).
- **Performance**: `React.memo` nos cards; grid virtualizado só se a lista passar de ~200 (não é o caso hoje).
- **Compat**: se o `useQuery` falhar/ainda carregando, sidebar/home renderizam o catálogo default completo (fallback = tudo visível). Zero risco de tela em branco.

---

## Entrega em ordem

1. Migration `system_modules` + seed dos módulos atuais
2. `use-modules.ts` hook
3. Filtro na sidebar (`admin.tsx`) e na home admin (`admin.index.tsx`) — com fallback seguro
4. Rota `/admin/modulos` com listagem, switch, favorito, drag-and-drop, busca, filtro categoria
5. Link "Módulos" 🧩 no menu admin
6. Nota em `AGENTS.md` sobre cadastrar novos módulos no seed

Nenhum arquivo existente é reescrito — apenas `admin.tsx` e `admin.index.tsx` recebem filtro condicional em cima do array atual.
