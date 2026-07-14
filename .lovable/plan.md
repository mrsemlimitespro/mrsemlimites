## Fase 3 — Automação completa (plano cirúrgico)

### Auditoria: o que JÁ está automatizado no banco

Antes de propor mudanças, mapeei o estado atual. Muita coisa da Fase 3 já roda:

| Requisito Fase 3 | Estado atual |
|---|---|
| Aprovar pagamento → creditar plano | ✅ `trg_pagamento_status_after` → `approve_pagamento` |
| Aprovar pagamento → gerar licença | ✅ `trg_pagamento_gerar_licenca` (mas **não vincula cliente**) |
| Aprovar pagamento → notificar | ✅ `trg_pagamento_notify` |
| Eventos de licença (criada/ativada/renovada/etc.) | ✅ `trg_licencas_evento` |
| Transição teste → premium | ✅ `trg_licenca_tipo_transicao` |
| Consumo de crédito ao criar cliente | ✅ `trg_cliente_consume_credit` |
| Auto-cadastro de cliente no signup | ✅ `tg_auth_user_to_cliente` |
| Anti-abuso do teste grátis (1 por email) | ✅ dentro de `atribuir_licenca_cliente` |
| Trial só inicia na ativação | ✅ `expirar_trials_vencidos` + `validar_licenca` |
| RPCs: cancelar/reativar/renovar/converter premium/resetar device | ✅ existem |
| Expirar licenças vencidas | ✅ `expirar_licencas_vencidas` (função pronta, **sem cron**) |
| Expirar trials vencidos | ✅ `expirar_trials_vencidos` (função pronta, **sem cron**) |
| Notificar expirando (7d/1d) | ✅ `notificar_licencas_expirando` (função pronta, **sem cron**) |

### O que falta (gaps reais)

#### A. Pagamento aprovado não fecha o ciclo cliente ↔ licença ↔ produto
`trg_pagamento_gerar_licenca` hoje só cria a linha em `licencas` com `revendedor_id`. Não localiza/cria `cliente`, não preenche `licencas.cliente_id`/`email`, não escreve em `licenca_produtos`. Resultado: a Fase 2 (CRM) só enxerga a compra via fallback por nome.

**Correção (migration única):** estender a função do trigger para:
1. Se `payment_transactions` tiver dado do comprador (`cliente_nome`/`cliente_email` — colunas já existem), fazer `upsert` em `clientes` por email.
2. Vincular `licencas.cliente_id` + `email`.
3. Se `plano.produto_id` existir, inserir em `licenca_produtos`. **Só adiciono coluna** `planos.produto_id` (nullable) se hoje não houver relação — pergunta 1 abaixo.
4. Emitir notificação `revendedor` ("Nova venda") e `cliente` ("Licença criada").

Nada muda no schema de `licencas`, `clientes`, `payment_transactions` ou `licenca_produtos`. Só a função do trigger é reescrita.

#### B. Nenhum job agendado — expirações e avisos dependem de ação manual

Criar 4 cron jobs via `pg_cron` chamando as funções existentes (todas SECURITY DEFINER):

```
*/10 * * * *   SELECT public.expirar_trials_vencidos();
0    * * * *   SELECT public.expirar_licencas_vencidas();
0    9 * * *   SELECT public.notificar_licencas_expirando();
0    3 * * *   -- limpeza de logs voláteis (payment_webhook_logs > 90d, licencas_eventos.tipo='acesso' > 60d)
```

Zero endpoint HTTP — chamadas SQL puras, mais barato e sem exposição pública. Isso resolve os itens 3, 6, 7 e 9 do briefing (regras de validade, dashboard vivo, notificações e jobs) sem nova infra.

#### C. Central de licenças no frontend (TS) — parcialmente feito na Fase 2

Já temos `src/lib/admin/cliente-pagamentos.ts` (pagamentos) e as ações em lote em `admin.clientes.$id.tsx` chamando RPCs. Falta consolidar num único módulo `src/lib/admin/licencas-service.ts` que exponha:

```
gerar / renovar / bloquear / desbloquear / cancelar / expirar
mover(clienteId) / duplicar / transferir(revendedorId)
listarAcessos / listarDispositivos / listarEventos
```

Todos são wrappers finos sobre RPCs já existentes (`gerar_licencas`, `renovar_licenca`, `cancelar_licenca`, `reativar_licenca`, `resetar_device_licenca`, `converter_licenca_em_premium`) + updates diretos (RLS admin já permite) para mover/duplicar. As telas `admin.licencas.tsx`, `admin.clientes.$id.tsx` e `admin.licencas-dashboard.tsx` passam a consumir esse módulo — sem alterar comportamento visível, só remove duplicação. Nenhuma tela nova.

#### D. Dashboard em tempo real

`admin.licencas-dashboard.tsx` já lê agregados. Adicionar canal Supabase Realtime único no dashboard (`postgres_changes` em `licencas`, `payment_transactions`, `clientes`) chamando `refetch` com debounce. Requer `ALTER PUBLICATION supabase_realtime ADD TABLE ...` para essas 3 tabelas.

#### E. Auditoria consistente

Tabela `audit_logs` (13 colunas, 2 policies) já existe mas não é gravada pelas RPCs. Adicionar helper `public.log_audit(_action, _entity, _entity_id, _before, _after)` e chamá-lo dentro das RPCs de escrita (`cancelar_licenca`, `reativar_licenca`, `renovar_licenca`, `resetar_device_licenca`, `converter_licenca_em_premium`). IP/user-agent virão via `metadata` quando a chamada for por server function (não passa hoje via RPC — aceitável).

### O que NÃO vou tocar

Checkout, SDK da extensão, APIs públicas (`/api/public/**`), webhooks (`cakto/kiwify/mercadopago`), prompts, agents, packs, loja, design system, tema, rotas existentes, sistema atual de chaves (`gerar_chave_licenca`).

### Entrega

**Migrations (2):**
- `M1`: reescrever `tg_pagamento_gerar_licenca` (upsert cliente + vincular + licenca_produtos + notificação dupla) + criar `log_audit` + adicionar chamadas de auditoria nas 5 RPCs de escrita + `ALTER PUBLICATION supabase_realtime` para 3 tabelas.
- `M2` (via **insert tool**, não migration): 4 `cron.schedule(...)` — não vai em migration porque contém URL/agenda específica do projeto.

**Arquivos novos:**
- `src/lib/admin/licencas-service.ts` — central única de licenças.

**Arquivos alterados:**
- `src/routes/admin.licencas.tsx`, `admin.clientes.$id.tsx`, `admin.licencas-dashboard.tsx` — passam a chamar o serviço central + subscribe realtime no dashboard.

**Nada novo de rota, tela, componente visual ou dependência.**

### Perguntas antes de codar

1. **`planos.produto_id`**: hoje não vejo relação plano↔produto. Posso **adicionar essa coluna nullable** em `planos` para o trigger conseguir preencher `licenca_produtos` no auto-fluxo? (Se preferir não mexer no schema, pulo o item 3 do bloco A — licença é criada, produto fica vazio até vínculo manual.)
2. **Comissão do revendedor**: o briefing pede "comissão" no painel do revendedor. Não existe campo hoje (`revendedores` não tem `comissao_percentual`, `payment_transactions` não tem `comissao_valor`). Adiciono ou deixo fora desta fase?
3. **Limpeza de logs**: OK apagar `payment_webhook_logs > 90 dias` e `licencas_eventos` do tipo `acesso` > 60 dias no cron diário? (Histórico "importante" — criada/ativada/renovada/cancelada/expirada — nunca é apagado.)
4. **Realtime**: OK habilitar realtime em `licencas`, `payment_transactions`, `clientes`? (Custo pequeno; sem isso o "dashboard em tempo real" fica em polling.)