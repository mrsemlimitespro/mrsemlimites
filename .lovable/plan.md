# FASE 2 — Painel Admin de Produtos Premium

Painel dedicado para gerenciar produtos da loja com upload múltiplo, galeria arrastar-e-soltar, capa, compressão WebP e preview igual à vitrine.

## Escopo

- Nova rota `/admin/loja/produtos-galeria` (editor dedicado, sem tocar no editor genérico existente para não quebrar outros recursos).
- Card na página `/admin/loja` apontando para o novo editor premium (mantém atalho antigo).

## Banco

Campo `imagens text[]` já existe. Adicionar somente se faltar:
- garantir default `'{}'`
- `imagem_url` continua sendo a capa (primeira do array)

Sem novas tabelas.

## Upload / Compressão (client-side)

Utilitário `src/lib/image-compress.ts`:
- redimensiona para no máx 1920px (canvas)
- exporta WebP q=0.9
- retorna Blob + preview `objectURL`

Upload vai para bucket `admin-media` já existente, path `produtos/{produto_id}/{uuid}.webp`, com progresso via `XMLHttpRequest` (Supabase Storage `upload` não expõe progresso; usar `fetch` + `ReadableStream` com contador ou `XMLHttpRequest` na URL assinada). Simples: mostrar barra determinística por arquivo baseada em `onprogress` do XHR contra endpoint `storage/v1/object/...` com o token do usuário.

## UI do editor

`src/routes/admin.loja.produtos.tsx` (nova rota):

```text
[Lista lateral de produtos]  |  [Formulário]
                             |    Nome / Título / Categoria
                             |    Descrição / Preço / Estoque
                             |    Status / Ativo / Ordem / Link
                             |
                             |    Galeria
                             |    ┌──┐ ┌──┐ ┌──┐ ┌──┐  +
                             |    │⭐│ │  │ │  │ │  │
                             |    └──┘ └──┘ └──┘ └──┘
                             |    (arraste p/ reordenar · ⭐ define capa · 🗑 remove)
                             |
                             |    [Preview Desktop] [Tablet] [Mobile]
                             |    [Visualizar Produto] (abre modal da loja)
                             |    [Salvar]
```

Bibliotecas: `@dnd-kit/core` + `@dnd-kit/sortable` (leve, sem dependências pesadas). Adicionar via `bun add`.

Componentes novos:
- `src/components/admin/produto-gallery-editor.tsx` — dropzone, thumbnails sortáveis, botão capa, remover, progresso.
- `src/components/admin/produto-preview.tsx` — reusa `ProdutoModal` já existente em `home-sections.tsx` (extrair para arquivo próprio `src/components/loja/produto-modal.tsx` e importar tanto na home quanto aqui).

## Vitrine

`ProdutoModal` e `ProdutosBannerCarousel` já usam `imagens[]`. Sem mudanças de comportamento — só extração para arquivo separado.

## Lazy loading / performance

- `<img loading="lazy" decoding="async">` em todas as miniaturas.
- Primeira imagem do card com `loading="eager"` + `fetchpriority="high"`.
- Blur placeholder: `ArtImage` já usa fundo `blur-2xl` da própria imagem. Manter.
- Modal só monta galeria completa quando aberto (já é o caso).

## Ordem de implementação

1. Extrair `ProdutoModal` para `src/components/loja/produto-modal.tsx`; ajustar import em `home-sections.tsx`.
2. `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
3. Criar `src/lib/image-compress.ts`.
4. Criar `src/components/admin/produto-gallery-editor.tsx`.
5. Criar rota `src/routes/admin.loja.produtos.tsx` com list + form + preview.
6. Adicionar card no `admin.loja.tsx` apontando para a nova rota.
7. Migração leve garantindo default `'{}'` em `imagens` (se necessário).

## Fora de escopo

- Não mexer no editor genérico `admin.$resource.tsx` (outros recursos dependem dele).
- Sem alterações em outras seções da vitrine além da extração do modal.

Confirma que posso seguir? Ou prefere que eu comece por alguma parte específica (ex.: só o upload múltiplo + galeria, sem preview responsivo)?
