
# Plano — Admin → Painel do Cliente (CMS Completo)

Objetivo: **fazer o sistema funcionar de ponta a ponta**, sem tocar em layout, cores, sidebar, rotas ou autenticação. Só banco + consultas + integração.

## Diagnóstico rápido do estado atual

- **CRUD genérico já existe** (`src/routes/admin.$resource.tsx` + `src/lib/admin/resources.ts`) — suporta texto, textarea, número, boolean, data, select, select_from_table, imagem e vídeo, com busca, ordenação e paginação. Nenhum módulo precisa ser refeito, só ganhar campos.
- **Dashboard `_app.index.tsx`** já lê dados reais (view `v_dashboard_metricas`, `payment_transactions`, `clientes`, `notificacoes`, `access_logs`). Faltam cards extras (produtos, banners, revendedores, uploads, etc.).
- **Home** hoje mostra apenas: logo + `PromoCarousel` (que puxa `banners`, não `promocoes`) + KPIs + gráfico + últimas vendas. Não há seção pública de Promoções, Planos, Produtos, Propagandas nem Avisos.
- **Colunas faltando** em várias tabelas conforme spec do usuário (subtítulo, banners desktop/mobile separados, badges, cores, ícones, ordem, agendamento, mostrar_premium, etc.).

## Etapas (uma por vez, teste antes de avançar)

### Etapa 1 — Fundação de schema (migração única, aditiva)
Adicionar TODAS as colunas que faltam sem remover nada:
- `promocoes`: `subtitulo, banner_desktop_url, banner_mobile_url, botao_texto, preco_antigo, preco_atual, cor, icone, ordem, destaque, cta_link`
- `banners`: `subtitulo, descricao, imagem_mobile_url, preco, preco_promocional, botao_texto, cor_botao, cor_fundo, badge, icone, inicio, fim`
- `propagandas`: `posicao, ordem, tempo_segundos, imagem_desktop_url, imagem_mobile_url, mostrar_premium, botao_texto, ativa`
- `planos`: `beneficios (jsonb), cor, icone, botao_texto, link, imagem_url, ordem, ativo` (o que faltar)
- `produtos`: `titulo, categoria, estoque, botao_texto, link, status, ordem, imagem_url` (o que faltar)
- `imagens`: `ordem, ativo` (o que faltar)
- Garantir GRANTs e políticas RLS de leitura pública para tabelas de conteúdo visível ao cliente.

### Etapa 2 — Registry Admin completo (`resources.ts`)
Expor todos os novos campos nos formulários do CRUD genérico. Adicionar filtros e ordenação onde faltarem. Nada de UI nova — só configuração.

### Etapa 3 — Promoções → Home
- Componente `PromocoesSection` na Home que lê `promocoes` ativas (por `inicio/fim/ativo/ordem`).
- Renderiza título, subtítulo, preço antigo/atual, desconto, cor, ícone, botão com link.
- Realtime subscribe → atualiza imediatamente ao salvar no Admin.

### Etapa 4 — Carrossel dedicado
- Nova tabela **`carrossel_slides`** (separada de `banners`) com todos os campos da spec.
- Migrar `PromoCarousel` para ler dessa tabela; `banners` fica só como banners visuais.
- Removem-se os slides demo hardcoded.

### Etapa 5 — Propagandas, Banners, Planos, Produtos → Home
Cada um em componente próprio (`PropagandasSection`, `BannersSection`, `PlanosSection`, `ProdutosSection`), todos com realtime, filtros de `ativo/ordem/data`, e respeito a `mostrar_premium` quando aplicável.

### Etapa 6 — Dashboard com contadores reais
Adicionar cards com `count(*)` real de: clientes, licenças, produtos, planos, promoções, banners, imagens, vídeos, créditos vendidos, revendedores, uploads. Tudo via `supabase.from(...).select('*', {count:'exact', head:true})`.

### Etapa 7 — Sincronização (Realtime)
Habilitar `ALTER PUBLICATION supabase_realtime ADD TABLE ...` para cada tabela consumida na Home. Cada seção da Home escuta `postgres_changes` e refaz o fetch.

### Etapa 8 — Verificação final
Rodar cada CRUD no Admin (criar/editar/excluir/ativar/reordenar) e conferir na Home em outra aba. Relatório final com módulos, tabelas, consultas e uploads.

## Regras obrigatórias
- ❌ **Zero mudança** em: layout, cores, sidebar, rotas, autenticação, componentes que funcionam.
- ✅ Todas as migrations são **aditivas** — nenhuma coluna removida, nenhum dado apagado.
- ✅ RLS: leitura pública apenas para tabelas de conteúdo visível ao cliente (banners, promoções, propagandas, planos, produtos, aulas, carrossel, imagens públicas).
- ✅ Realtime obrigatório para o requisito "atualização automática".

## O que preciso confirmar de você antes de começar

1. **Posso avançar com a Etapa 1** (migração aditiva de schema) já?
2. Alguma tabela dessa lista **você não usa** e prefere pular? (ex: `aulas`, `videos`, `logos`).
3. **`banners` hoje é usado como carrossel** — devo criar `carrossel_slides` separada (recomendo) ou expandir `banners` e usar o mesmo registro para banner e para carrossel?

Assim que confirmar, começo pela Etapa 1 e sigo módulo por módulo, testando antes de avançar.
