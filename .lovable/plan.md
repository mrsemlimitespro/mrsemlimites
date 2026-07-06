# Loja real, clicável e editável

Hoje `_app.creditos.tsx` mostra cards fixos no código (packs de 1/5/10 chaves, planos LOVABLE / É CAMPEÃO / CONTA LOVABLE / MANUS AI / Chave Vitalícia). Vou trocar tudo por dados reais das tabelas `creditos_packs`, `planos` e `promocoes`, com cards totalmente editáveis pelo admin e um checkout que já funciona mesmo antes de nenhum gateway de pagamento estar configurado.

## 1. Banco — migração
Adicionar colunas para permitir personalização visual:

- `planos.imagem_url` (text) — upload no admin
- `planos.badge` (text) — etiqueta ("PRO", "POWER", "ESSE SIM"...)
- `planos.cor_gradiente` (text) — presets ("violet", "orange", "cyan", "pink"...) ou hex custom
- `creditos_packs.badge` (text)
- `creditos_packs.cor_gradiente` (text)

`imagem_url` já existe em `creditos_packs` e `promocoes`. Sem mudança em RLS/GRANT (colunas novas em tabela já existente).

## 2. Admin — edição dos cards
Ampliar os formulários de `/admin/packs` e `/admin/planos` (via `admin.$resource.tsx`) para incluir todos os campos personalizáveis:

- **Nome**, **preço**, **descrição**, **quantidade de créditos**, **duração** (planos)
- **Badge** (etiqueta colorida no topo do card)
- **Upload de imagem** (bucket `admin-media` — mesma mecânica dos banners)
- Seletor de **cor/gradiente** com paleta pronta + hex opcional
- Toggle **ativo/inativo**

Chave Vitalícia continua vindo da tabela `promocoes` (já tem `imagem_url`, `link`, `plano_id`, `pack_id`) — só polir o formulário dela.

Componente `<CardEditor />` reutilizável entre packs / planos / promoções para manter tudo consistente.

## 3. Loja — cards reais e clicáveis
Refatorar `src/routes/_app.creditos.tsx`:

- `useQuery` puxando `creditos_packs`, `planos` (ativos) e a promoção vitalícia ativa
- Cada card renderiza usando `nome`, `preco`, `imagem_url`, `badge`, `cor_gradiente` vindos do banco
- Layout mantém a estrutura visual do print (3 packs de chaves + linha de planos coloridos + banner promocional)
- Cada botão **"Comprar"** vira `<Link to="/checkout/$tipo/$id">` — `tipo` = `pack` | `plano` | `promo`
- Estado vazio: "Nenhum produto cadastrado. Acesse `/admin/packs` para criar."

## 4. Checkout — funciona antes do gateway existir
Nova rota `src/routes/_app.checkout.$tipo.$id.tsx`:

Fluxo:
1. Ao abrir, chama server function `criarTransacaoAguardando({ tipo, id })` que cria (ou reaproveita) uma linha em `payment_transactions` com `status='aguardando_configuracao'`, vinculando `revendedor_id`, `pack_id`/`plano_id`, `valor`.
2. Consulta `payment_gateways WHERE enabled=true`:
   - **Nenhum ativo** → tela laranja **"Aguardando configuração de pagamento"**. Mostra resumo do pedido (produto, valor), número da transação, botão **"Avisar admin"** que dispara `criar_notificacao(...)` para os admins. Nada de crédito liberado.
   - **Algum gateway ativo** → tela azul "Escolha a forma de pagamento" listando os gateways ativos (Pix / cartão / boleto). Botão "Pagar" abre o checkout do gateway (stub inicial — cada gateway é plugado depois, sem quebrar o resto).
3. Quando o gateway confirmar o pagamento, o trigger `tg_pagamento_status` (já existe) chama `approve_pagamento` → `add_credits` → créditos liberados automaticamente. Nada novo pra fazer nessa parte.

## 5. Liberação manual pelo admin
`/admin/ajustar-creditos` já existe. Reforçar dois pontos:

- Nova aba **"Pedidos aguardando"** que lista `payment_transactions WHERE status='aguardando_configuracao'`. Cada linha tem botão **"Liberar créditos manualmente"** que chama `approve_pagamento(id)` (RPC já existente) — libera crédito, marca como aprovado e a notificação sai sozinha (trigger `tg_pagamento_notify` já cuida).
- Na página do cliente (`/admin/revendedores/:id`), o botão **"+ Adicionar créditos"** já usa `add_credits`. Deixar visível também na listagem principal para acesso rápido.

## 6. Detalhes técnicos

Server functions novas (todas com `requireSupabaseAuth`):
- `criarTransacaoAguardando({ tipo, id })` → retorna `transacao_id`
- `notificarAdminPagamento({ transacao_id })`
- `listarGatewaysAtivos()` → só slug + nome (sem chave secreta)
- `liberarCreditosManual({ transacao_id })` → só admin, chama `approve_pagamento`

Sem novas tabelas. Sem edge functions.

## Ordem de execução
1. Migração das colunas
2. `<CardEditor />` + rotas `/admin/packs` e `/admin/planos` usando ele (upload de imagem + gradiente)
3. Refactor da Loja (`_app.creditos.tsx`) puxando dados reais
4. Rota `/checkout/$tipo/$id` com os dois estados (aguardando / gateway ativo)
5. Aba "Pedidos aguardando" em `/admin/ajustar-creditos`

Cada etapa é testável isoladamente. Confirmando o plano, começo pela migração.