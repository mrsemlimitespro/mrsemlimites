# Plano de Repaginação Visual Premium — MR SEM LIMITES

Executar uma transformação visual completa para uma estética SaaS premium (fintech/cybersecurity), removendo o excesso de rosa e padronizando o Design System.

## Objetivos Visuais
- **Paleta:** Preto profundo, grafite, cinza carvão, azul elétrico/neon, ciano e toques de violeta.
- **Estética:** Clean, tecnológica, premium, com hierarquia visual clara.
- **Componentes:** Padronização de botões, inputs, cards e tabelas.

## Etapa 1: Design System e Global Styles
- [ ] Atualizar `src/styles.css` com novos tokens de cores (substituindo magenta dominante por tons de azul/grafite).
- [ ] Refinar utilitários `.glass` e `.card-premium`.
- [ ] Padronizar tipografia e espaçamentos.

## Etapa 2: Sidebar e Navegação
- [ ] Refatorar `src/components/app-sidebar.tsx` para suporte a modo expandido/recolhido (rail).
- [ ] Adicionar identificação de perfil (Admin, Revendedor, Cliente).
- [ ] Organizar grupos lógicos (Comercial, Revenda, Conteúdo, Operação, Sistema).

## Etapa 3: Core Layout e Dashboard
- [ ] Atualizar `src/routes/_app.tsx` e `src/components/top-bar.tsx`.
- [ ] Repaginar Dashboards (`_app.dashboard.tsx` e `admin.index.tsx`) com cards modernos e dados reais.
- [ ] Implementar visualização diferenciada por Role (Ultra Admin vs Revendedor vs Cliente).

## Etapa 4: Telas de Conteúdo e Operação
- [ ] Modernizar tabelas em Licenças (`_app.licencas.tsx`) e Clientes.
- [ ] Repaginar Catálogos de IA (Agents e Prompts).
- [ ] Atualizar página de Downloads (`_app.baixar-extensao.tsx`).

## Etapa 5: Autenticação e Login
- [ ] Repaginar `src/routes/login.tsx` e `registro.tsx`.
- [ ] Remover excesso de rosa e aplicar background dark premium.

## Detalhes Técnicos
- Utilizar `oklch` para todas as cores novas.
- Preservar integridade de todas as rotas e funções de API.
- Garantir responsividade em 4 breakpoints (Mobile, Tablet, Notebook, Desktop).

## Validação
- Testar todos os fluxos de Role.
- Verificar estados de loading (Skeletons).
- Gerar relatório `REPAGINACAO_PREMIUM_MR_SEM_LIMITES.md`.
