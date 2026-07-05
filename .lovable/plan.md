# Design System Foundation — NovaMind Style

Nesta etapa vou apenas estabelecer o **padrão visual reutilizável** do projeto, sem criar páginas, dashboards, menus, abas ou funcionalidades. Nenhum conteúdo da imagem de referência será copiado — apenas a linguagem visual.

## Identidade Visual

- Dark mode premium com fundo quase preto azulado (`oklch(~0.13 0.03 275)`)
- Gradientes de destaque **roxo → azul** (violet 270° → blue 250°)
- Glassmorphism: superfícies translúcidas com `backdrop-blur`, borda `1px` em `white/10`, brilho interno sutil
- Bordas arredondadas generosas (radius base `0.75rem`, cards `1rem–1.25rem`)
- Sombras suaves em camadas + glow discreto colorido nos elementos ativos
- Tipografia limpa (Inter), hierarquia consistente, tracking levemente apertado em títulos
- Espaçamento em escala 4px, ritmo consistente
- Animações suaves (150–300ms, ease-out) para hover, focus e entrada

## O que será criado

### 1. Tokens de design em `src/styles.css`
- Paleta semântica em `oklch` (background, surface, surface-elevated, foreground, muted, border, ring)
- Cores de marca: `--brand-violet`, `--brand-blue`, `--brand-cyan`, `--brand-magenta`
- Gradientes reutilizáveis: `--gradient-primary` (violet→blue), `--gradient-glow`, `--gradient-surface`
- Sombras: `--shadow-soft`, `--shadow-elevated`, `--shadow-glow`
- Radius scale e transições padrão (`--transition-smooth`)
- Registro no `@theme inline` para gerar utilitários Tailwind (`bg-brand`, `text-brand`, etc.)
- Fonte Inter carregada via `<link>` no `__root.tsx` (nunca `@import` remoto)

### 2. Utilitários Tailwind v4 (`@utility`)
- `.glass` — superfície glassmorphism padrão
- `.glass-strong` — variante mais opaca para cards principais
- `.glow-primary` — glow roxo/azul para elementos ativos
- `.gradient-text` — texto com gradiente da marca

### 3. Ajuste dos primitives shadcn existentes (apenas variantes/estilos, sem mudar API)
- `button.tsx`: variante `premium` (gradiente + glow no hover), refino de `default`/`outline`/`ghost` para o tema escuro
- `card.tsx`: aplicar superfície glass por padrão, radius e borda sutil
- `input.tsx` / `textarea.tsx`: fundo translúcido, borda `white/10`, ring roxo no focus
- `badge.tsx`: variantes com gradiente sutil
- Nenhum componente novo além dos já presentes em `src/components/ui/*`

### 4. Metadados do root
- Atualizar `title`/`description` em `__root.tsx` para algo neutro do projeto (placeholder até o usuário definir), removendo os defaults "Lovable App"
- Preload da fonte Inter

## O que NÃO será feito agora
- Nenhuma rota nova
- Nenhum dashboard, sidebar, header, menu, aba
- Nenhum card de métrica, gráfico, lista ou formulário de exemplo
- `src/routes/index.tsx` permanece como está (placeholder) até o usuário enviar o primeiro print

## Detalhes técnicos
- Tailwind v4 CSS-first: tokens em `@theme inline`, utilitários customizados via `@utility` (nunca `@layer utilities`)
- Todas as cores em `oklch`
- Sem cores hardcoded (`text-white`, `bg-black`, hex direto) em componentes — apenas tokens semânticos
- Mobile-first já é padrão do Tailwind; primitives permanecem responsivos
- Acessibilidade: contraste AA garantido nos tokens, `focus-visible` ring visível em todos os interativos

Quando aprovar, aplico apenas esta base. Depois é só me enviar os prints — cada tela será reconstruída fielmente sobre esse design system.