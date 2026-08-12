# Plano: Reconstrução Visual Completa MR SEM LIMITES

Este plano detalha a reestruturação completa da interface do painel MR SEM LIMITES, seguindo fielmente a referência visual fornecida (SaaS Premium Dark/Neon). O objetivo é aplicar um AppShell de 3 colunas (Sidebar Esquerda, Conteúdo Central, Sidebar Direita) e padronizar toda a hierarquia visual.

## 1. Alterações Visuais e Design System
- **Paleta Cromática:** Atualizar `src/styles.css` para usar os tons oficiais: Background (#02040B), Superfícies (#050914, #07101F, #091225), Azul Elétrico (#006BFF), Ciano (#00D9FF), Violeta (#5B21FF). Eliminar rosa dominante.
- **Tipografia & Componentes:** Cards com border-radius 10-14px, botões com gradientes azul->violeta, efeito glow controlado.
- **Assinatura Inferior:** Criar componente para a assinatura "SEM LIMITES" com linhas neon e subtítulo "AUTOMAÇÃO • PRODUTIVIDADE • RESULTADOS".

## 2. Estrutura do AppShell (Desktop 3 Colunas)
- **Refatoração do Layout Pai (`src/routes/_app.tsx`):** Implementar `grid-template-columns: var(--sidebar-left-width) minmax(0, 1fr) var(--sidebar-right-width)`.
- **Sidebar Esquerda:** Organizar navegação em grupos (Visão Geral, Comercial, Revenda, Conteúdo, Operação, Sistema) com avatar e status ONLINE no topo.
- **Sidebar Direita:** Painel contextual com perfil do usuário, saldo de créditos, ações rápidas e informações da conta.
- **Conteúdo Central:** Área de trabalho que respeita o container e nunca é sobreposta pelas sidebars.

## 3. Páginas e Componentes Específicos
- **Header Superior:** Busca global (Ctrl+K), notificações com badge, mensagens e tela cheia.
- **Página de Licenças (`src/routes/_app.licencas.tsx`):**
    - Cabeçalho padronizado com breadcrumb e ações primárias.
    - Linha de KPI cards compactos com dados reais.
    - Filtros de período (1h, 1d, 2d, etc.) e busca na tabela.
    - Marca d'água oficial MR SEM LIMITES grande e centralizada atrás da tabela.
- **Página de Dashboard:** KPIs modernizados seguindo a nova paleta.

## 4. Funcionalidades e Backend (PRESERVAÇÃO)
- **Zero Mocks:** Toda exibição de dados continuará utilizando as queries do Supabase e server functions existentes.
- **Segurança:** Manter RLS, políticas de autenticação e diferenciação de permissões (Ultra Admin vs Revendedor vs Cliente).
- **Responsividade:** Sidebar esquerda recolhível, sidebar direita transformada em drawer ou oculta em telas menores.

## Detalhes Técnicos
- Utilizar CSS Grid real para evitar sobreposições de sidebar.
- Manter o asset oficial da logo em todos os pontos de marca (Sidebar, Watermark, Header).
- Atualizar tokens OKLCH no `src/styles.css` para refletir a nova paleta hex/neon.
- Implementar `PageHeader` e `PageContainer` aprimorados para garantir consistência em todas as rotas.
