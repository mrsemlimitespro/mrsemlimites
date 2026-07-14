# Fase 4 — Comunicação + Revendas + Portal do Cliente

Escopo grande. Divido em blocos independentes que não tocam SDK, checkout, APIs públicas, prompts/agents/packs/loja, tema, layout ou rotas existentes. Só **adiciono** rotas novas, tabelas novas (todas nullable/opt-in) e um serviço central de email.

## 1. Provider de email (Resend + arquitetura plugável)

Novo módulo `src/lib/email/` com interface `EmailProvider`:
- `resend.ts` (padrão, via connector Resend ou secret `RESEND_API_KEY`)
- stubs vazios para `smtp.ts`, `sendgrid.ts`, `ses.ts`, `mailgun.ts` (contrato pronto, implementação futura)
- `index.ts` seleciona provider via `EMAIL_PROVIDER` env (default `resend`)

Configuração: peço ao usuário aprovar Resend via `standard_connectors--connect` OU salvar `RESEND_API_KEY` via `add_secret`. Enquanto não configurado, envios ficam em fila com status `pending_config` — não quebra nada.

## 2. Tabelas novas (migração única)

Todas nullable, todas com GRANT + RLS:

- `email_templates` — id, chave (unique: `licenca_criada`, `licenca_renovada`, `licenca_reenviada`, `licenca_premium`, `licenca_reativada`, `licenca_movida`, `compra_aprovada`, `pagamento_recusado`, `expiracao_7d`, `expiracao_1d`, `promocao`), assunto, html, texto, variaveis jsonb, ativo, updated_at. Seed com 11 templates padrão em português.
- `email_queue` — id, template_chave, destinatario, assunto, html, variables, status (`pending|sending|sent|failed`), attempts, last_error, scheduled_for, sent_at, cliente_id, licenca_id, revendedor_id, metadata.
- `email_logs` — id, queue_id, evento (`queued|sent|failed|bounced|opened|clicked`), detalhes jsonb, created_at.
- `comissoes` — id, revendedor_id, payment_id, licenca_id, cliente_id, valor, percentual, status (`pendente|pago|cancelado`), pago_em, created_at.

Trigger `tg_licenca_email` em `licencas` (AFTER INSERT/UPDATE): enfileira email do template certo conforme transição (criada/renovada/reativada/premium/movida).

Trigger `tg_pagamento_comissao` em `payment_transactions` (após aprovado): calcula comissão via `revendedores.comissao_percentual` e insere em `comissoes`.

RPC `enfileirar_email(_template, _destinatario, _variables, _licenca_id?, _cliente_id?)`.
RPC `reenviar_licenca(_licenca_id)` — recarrega variáveis e enfileira `licenca_reenviada`, grava audit.

## 3. Worker de envio

Rota nova `src/routes/api/public/hooks/email-worker.ts` (POST):
- verifica header `apikey` = anon key
- pega até 20 emails `pending`, marca `sending`, renderiza template com variáveis, chama provider, marca `sent` ou incrementa `attempts` (máx 5 com backoff exponencial via `scheduled_for`).
- registra em `email_logs`.

Cron `pg_cron` a cada 1 min chamando esse endpoint (via `supabase--insert`).

## 4. Portal do Cliente (`/minha-conta`)

Nova rota `src/routes/_app.minha-conta.tsx` (com sub-tabs, sem tocar navegação existente — acesso via link direto e card no perfil).

Abas:
- **Licenças** — lista licenças do cliente logado (via `cliente_id` = email do user), com Copiar / Baixar (txt) / Renovar (abre checkout) / Detalhes / Suporte / dias restantes / último acesso / dispositivo.
- **Produtos** — produtos vinculados via `licenca_produtos` + acessos de packs/prompts/agents (leitura das tabelas existentes, sem alterá-las).
- **Downloads** — extensão + manuais + assets ligados aos produtos.
- **Pedidos** — `payment_transactions` do cliente.
- **Histórico** — `licencas_eventos` + `email_logs` do cliente.
- **Notificações** — `notificacoes` com destino user.

Design usa tokens existentes (`.glass`, `.icon-tile`, gradientes). Zero mudança de tema.

## 5. Dashboard do Revendedor

Nova rota `src/routes/_app.revendedor.tsx` (só role revendedor): clientes, licenças ativas, vendas do mês, comissões (pago/pendente), receita, pendências, últimas 10 vendas, últimos 10 clientes. Só leitura via RPCs novas `revendedor_dashboard()` e `revendedor_comissoes()`.

## 6. Admin — Comunicação

Nova rota `src/routes/admin.comunicacao.tsx`: fila, enviados, falhas (com botão reenviar), editor de templates (tabela `email_templates`), logs. Reusa componentes admin existentes.

Botão "Reenviar licença" nas telas de licença admin (`admin.licencas.tsx`, `admin.clientes.$id.tsx`) chama a RPC `reenviar_licenca`.

## 7. Segurança / performance

- Templates renderizam apenas: nome, produto, chave da licença (últimos 4 chars mascaráveis? — mantenho chave completa pois é o próprio ativo do cliente), validade, status, link download, link extensão, link suporte. Nunca secrets, tokens, service role, device_id completo.
- Fila desacoplada; retry com backoff; sem bloquear triggers de licença (só `INSERT` na fila).
- Provider chamado apenas do worker server-side.

## 8. Não muda

- Nenhum arquivo em `src/routes/api/public/ext/`, `src/routes/api/public/licenca/`, `src/routes/api/public/webhooks/`.
- Nenhum arquivo do SDK (`extension-sdk/`).
- Checkout, prompts, agents, packs, loja intactos.
- `src/styles.css`, `tailwind`, tema — intactos.
- Navegação (`app-sidebar.tsx`) — só adiciono link "Minha Conta" no menu do cliente autenticado (item novo, sem remover nada). Se preferir, deixo só acessível via `/perfil`.

## Perguntas antes de codar

1. **Provider de email** — posso usar Resend via connector Lovable (recomendado) ou você prefere que eu peça `RESEND_API_KEY` direto?
2. **Comissão padrão** — quando `revendedores.comissao_percentual` for null, uso quantos %? (sugiro 30%)
3. **"Minha Conta" na sidebar** — adiciono um ícone no rail lateral para clientes, ou deixo só via `/perfil`? (Você disse "não alterar navegação existente" — interpreto como não remover/reordenar; adicionar 1 item de cliente é OK?)
4. **Templates iniciais** — OK eu escrever os 11 em português com identidade MR Lova, ou você quer fornecer o copy?

Depois das respostas eu executo tudo em uma única leva (migração + arquivos).
