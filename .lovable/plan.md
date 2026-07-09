# Fase 3 — Polimento Nativo (Android + iPhone)

## Princípio norteador

**Zero regressão funcional.** Nenhum componente de lógica de negócio (auth, licenças, créditos, packs, webhooks, admin, Supabase queries) será tocado. Todas as mudanças ficam em: CSS/tokens, layout wrappers, animações, config nativa Capacitor, e ajustes de acessibilidade/touch. Cada alteração é isolada e reversível.

---

## Etapa 1 — Auditoria (somente leitura, sem alterações)

Antes de qualquer edição, executo uma varredura completa e entrego um **relatório técnico** com:

- Lista de todas as rotas e componentes principais
- Componentes que quebram em mobile (< 375px) — via Playwright em viewports iPhone SE / iPhone 15 Pro / Pixel / iPad
- Áreas de toque abaixo de 44×44 px
- Elementos sem `safe-area-inset`
- Imagens sem `loading="lazy"` / sem formato otimizado
- Componentes que re-renderizam sem necessidade (checar `React.memo`, `useMemo`, `useCallback` faltantes em listas)
- Animações que não são GPU-accelerated (usam `top/left` em vez de `transform`)
- Dependências pesadas carregadas eagerly que poderiam virar lazy chunks
- Bundle size atual (dist-mobile) e oportunidades de code-splitting
- Rotas admin/pesadas que hoje entram no bundle principal

**Você recebe o relatório e aprova quais itens quero atacar.** Sem sua aprovação por item, nada muda.

---

## Etapa 2 — Aparência nativa (Capacitor + CSS)

Mudanças **cirúrgicas** em arquivos de config e no CSS raiz:

- `capacitor.config.ts`: `overlaysWebView: true` no iOS + ajuste splash duration + backgroundColor consistente
- `src/routes/__root.tsx` head: viewport com `viewport-fit=cover` já existe, revisar `apple-mobile-web-app-status-bar-style`
- `src/styles.css`: variáveis globais `--sat`, `--sar`, `--sab`, `--sal` mapeadas para `env(safe-area-inset-*)` e aplicadas em containers root
- `src/lib/native-init.ts`: já configura StatusBar dark — adicionar `NavigationBar` (Android) para esconder barra de navegação inferior quando possível, e desabilitar zoom pinch acidental
- Desabilitar seleção de texto e long-press menu em elementos não-textuais (`user-select: none` em botões/cards, mantido em conteúdo)
- Desabilitar overscroll bounce no iOS onde causa sensação de web
- CSS: `-webkit-tap-highlight-color: transparent` global + adicionar feedback via `:active` custom

Arquivos afetados: `capacitor.config.ts`, `src/styles.css`, `src/lib/native-init.ts`, `src/routes/__root.tsx` (só head/meta).

---

## Etapa 3 — Touch targets e legibilidade (só CSS)

Adiciono utilitários no `styles.css` e aplico via **classes**, sem mexer na estrutura JSX de componentes de negócio:

- `.tap-target` (min-h-11 min-w-11) — aplicado em botões que já foram identificados como pequenos
- Revisar `MobileBottomNav` para garantir 44px+ por item
- Revisar `TopBar` e `PageBackButton`
- Font-size mínimo 15px em textos de corpo no mobile, 13px em labels
- Line-height revisto em cards com muito texto

**Toda mudança de tamanho passa por preview visual antes de eu confirmar.**

---

## Etapa 4 — Performance mensurável

Ações concretas com ganho verificável:

1. **Code-splitting das rotas admin**: `admin.*.tsx` já é lazy pelo TanStack Router, mas verificar se algum import puxa admin para o chunk cliente.
2. **Lazy load do `SoftParticles`** (é decorativo e canvas pesado no mobile) — só carrega em desktop OU degrada para versão CSS-only no mobile.
3. **Imagens**: converter assets grandes para WebP/AVIF via `vite-imagetools` onde couber, adicionar `loading="lazy"` e `decoding="async"` em `<img>` fora do fold.
4. **React.memo** em `PackCover`, itens de listas grandes (Clientes, Licenças, Créditos) — só depois de medir com Profiler que existe re-render inútil.
5. **Debounce** em inputs de busca que hoje fazem query a cada tecla (se existirem).
6. Remover console.log de produção via Vite config já existente.

Meta: **-30% no bundle inicial mobile**, LCP < 2.5s no preview 3G simulado.

---

## Etapa 5 — Microinterações e feedback tátil

- Plugin `@capacitor/haptics` (pequeno, ~2KB) — adicionar em pontos de alto valor: tap em bottom nav, sucesso de ação, erro
- Envolver em `NativeService.haptics.light()` (a camada de abstração que você já pediu na Fase 2)
- Animações de transição de rota via TanStack Router `pending`/`enter` — 200ms max
- Estados `:active` com `scale(0.97)` em botões e cards clicáveis
- **Nada disso muda componentes de negócio, só adiciona classes/wrappers**

---

## Etapa 6 — Adaptação por dispositivo

Playwright automatizado nos viewports:
- iPhone SE (375×667) — o mais apertado
- iPhone 15 Pro (393×852) — Dynamic Island
- iPhone 15 Pro Max (430×932)
- Pixel 8 (412×915)
- Galaxy S mini simulado (360×640)
- iPad Mini (768×1024)
- iPad Pro (1024×1366)

Screenshot de cada rota principal em cada viewport → identifico quebras → corrijo **só via CSS/tokens**, nunca reescrevendo componentes.

---

## Etapa 7 — Entrega final

Relatório em `MOBILE-AUDIT.md` com:

- ✅ Antes/depois (screenshots)
- ✅ Lista de correções aplicadas por arquivo
- ✅ Métricas de bundle e performance
- ✅ Checklist Android (splash, ícone, permissões, back button, safe area, status bar, deep links preparados)
- ✅ Checklist iOS (splash, ícone, notch/Dynamic Island, safe area, status bar, App Tracking preparado)
- ✅ Checklist PWA (manifest, ícones 192/512, standalone, offline básico)
- ✅ Percentual de prontidão para publicação (score honesto por área)
- ✅ Blockers restantes antes de submeter às lojas (ícones finais, screenshots das lojas, política de privacidade, conta developer, assinatura de chaves)

---

## O que EU **NÃO** vou fazer nesta fase

- ❌ Não reescrevo componentes existentes
- ❌ Não mudo rotas, loaders, server functions, Supabase queries
- ❌ Não altero design tokens principais (cores, gradientes) sem sua aprovação — só adiciono utilitários
- ❌ Não adiciono novas dependências pesadas
- ❌ Não implemento features da Fase 2 aqui (push, biometria, câmera) — Fase 3 é polimento
- ❌ Não afirmo que testei em dispositivo físico Android/iOS — isso continua sendo validação sua no seu Mac/PC

---

## Cronograma proposto (ordem de execução)

1. **Auditoria** → entrega relatório → você aprova escopo
2. **Aparência nativa** (Capacitor + CSS raiz) → screenshot antes/depois
3. **Touch targets + legibilidade** → screenshot antes/depois
4. **Performance** → métricas antes/depois
5. **Microinterações** → você aprova quais pontos recebem haptics
6. **Multi-viewport** → screenshots comparativos
7. **Relatório final** + checklists

Cada etapa termina com você confirmando "seguir" antes de eu ir para a próxima.

---

## Decisão que preciso de você agora

**Confirmo que começo pela Etapa 1 (Auditoria, somente leitura, zero mudança de código)?**

Se sim, respondo com o relatório técnico completo antes de tocar em qualquer arquivo.
