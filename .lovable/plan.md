# Auditoria MR sem limites — Plano de execução

Escopo enorme. Divido em **6 fases entregáveis**, cada uma testável isolada. Nenhuma fase toca em design, layout, sidebar, dashboard visual ou responsividade — só lógica, banco e integração.

---

## Fase 1 — Fundação de dados (banco)

Migrations que sustentam todo o resto. Sem UI.

- Tabela `licencas_eventos` (histórico): criada, vinculada, primeira_ativacao, ultimo_acesso, reset, renovacao, cancelamento, expiracao, reativacao. Populada por triggers.
- Tabela `dispositivos`: nome, so, versao, navegador, ip, cidade, pais, licenca_id, cliente_id, primeira_vez, ultimo_acesso.
- Extensão de `access_logs` para capturar user-agent parseado + geo (via header CF quando disponível).
- Tabela `audit_logs`: ator (user_id/role/email), acao, entidade, entidade_id, dados_antes, dados_depois, ip, ua, created_at. Trigger genérico anexado às tabelas críticas.
- Tabela `notificacoes` já existe — adicionar `tipo` enum e função `criar_notificacao`.
- Views:
  - `v_dashboard_metricas` (receita total/mês/ano, contagens, conversão)
  - `v_estoque_licencas` (disponíveis / ativas / expiradas / canceladas / bloqueadas)
  - `v_revendedor_visao` (clientes, licenças, créditos, receita, plano, validade por revendedor)
- Triggers automáticos:
  - Ao inserir/atualizar `licencas` → grava evento em `licencas_eventos`.
  - Ao aprovar pagamento → notificação para revendedor.
  - Ao expirar plano/créditos baixos → notificação.
- RPCs de manutenção:
  - `expirar_licencas_vencidas()` (chamada por cron)
  - `renovar_licenca(_id, _dias)`
  - `cancelar_licenca(_id, _motivo)` / `reativar_licenca`
- Realtime habilitado em: `licencas`, `payment_transactions`, `clientes`, `notificacoes`, `creditos_movimentos`.

---

## Fase 2 — Dashboard real + tempo real

- Server functions que leem as views acima.
- Substituir todos os números/placeholders/gráficos fake do dashboard atual pelos dados dessas views.
- Sparklines: receita últimos 30d, vendas 30d, cadastros 30d (queries por dia).
- Listas "Últimas Compras / Cadastros / Pagamentos": consultas reais com limit 5.
- Subscription realtime que invalida as queries do dashboard quando muda pagamento/cliente/licença.
- Mesmo layout, só troca a fonte dos dados.

---

## Fase 3 — Licenças, Estoque, Dispositivos, Clientes, Revendedores

- **Licenças**: painel de histórico (drawer) mostrando `licencas_eventos` + dispositivos. Botões Reset device, Renovar, Cancelar, Reativar — todos via RPC. IP/dispositivo/último acesso na tabela.
- **Estoque**: fatiar por status via `v_estoque_licencas`, contadores no header.
- **Dispositivos**: rota já existente ou aba dentro da licença — lista real da tabela `dispositivos`.
- **Clientes**: enriquecer com licença, plano, validade, revendedor, status, créditos consumidos, último acesso — vindos por join real.
- **Revendedores**: dashboard por linha (clientes, licenças, créditos, receita mês, plano/validade, pagamentos) via `v_revendedor_visao`.

---

## Fase 4 — Financeiro, Notificações, Logs, Admin

- **Financeiro / Pagamentos**: listar `payment_transactions` com gateway, status, valor, data/hora, cliente, revendedor, plano, créditos, transação. Drawer com payload do webhook (`payment_webhook_logs`).
- **Notificações**: bell no top-bar puxando `notificacoes` do usuário atual, marcar como lida, tempo real.
- **Logs / Auditoria**: tela lendo `audit_logs` com filtros.
- **Admin**: garantir que toda tela de configuração (loja, pagamentos, personalização, segurança, backup) grave em `admin_settings` / tabelas próprias — nada hardcoded.

---

## Fase 5 — Pesquisa, filtros, ordenação, paginação, uploads, validação

- Padronizar hook `useResourceList` com search server-side (ILIKE em colunas indexadas), filtros por status, sort por coluna e paginação (`range`).
- Aplicar em: clientes, licenças, revendedores, pagamentos, logs, notificações, estoque.
- **Uploads**: garantir bucket `admin-media` público para leitura, RLS de escrita só admin. Endpoint reusável em logo/banner/imagem/produto/vídeo. Retornar URL final e salvar no registro.
- **Validação**: schema `zod` em todos os formulários (email, telefone, CPF/CNPJ opcional, duplicidade via consulta prévia, saldo de créditos antes de cadastrar cliente etc.).

---

## Fase 6 — Relatórios, cron, limpeza final

- Relatórios: clientes / revendedores / pagamentos / licenças / créditos / financeiro / produtos / planos.
  - Exportação: CSV nativo, XLSX (`xlsx` lib), PDF (`jspdf` + autotable). Server functions montam o dataset.
- Cron via `pg_cron` chamando `expirar_licencas_vencidas` a cada 15 min + notificações de plano expirando (D-7, D-1).
- Limpeza: remover páginas mock, componentes órfãos, chamadas duplicadas, dead code. Rodar linter/typecheck.
- Relatório final ao usuário: problemas encontrados, correções, funcionalidades implementadas, dependências externas pendentes (credenciais Mercado Pago / Kiwify / Cakto).

---

## Regras invioláveis em todas as fases

- Zero mudança de: design, layout, componentes visuais, sidebar, menus, dashboard visual, fluxo de navegação, responsividade, tokens do design system.
- Zero dado fictício remanescente ao fim.
- Toda validação crítica no banco (RLS + funções SECURITY DEFINER).
- Realtime só onde faz sentido (dashboard, notificações, licenças, pagamentos).

---

## Como quero conduzir

Prefiro entregar **fase por fase** com aprovação sua entre cada uma — porque cada fase tem migrations grandes e mudanças em várias telas. Se você aprovar tudo de uma vez, executo em sequência sem parar.

**Confirma que posso começar pela Fase 1 (banco)?** Ou prefere que ajuste o escopo de alguma fase antes?

## Detalhes técnicos

- Todas as consultas via `createServerFn` + TanStack Query com `invalidateQueries` no realtime.
- Auditoria: trigger genérico `tg_audit()` anexado a tabelas críticas grava JSONB diff.
- Geo/UA: parse do header `user-agent` no servidor; `cf-ipcountry`/`cf-ipcity` quando presente (Cloudflare Workers).
- Views são `SECURITY INVOKER`; RLS das tabelas base é respeitado.
- Relatórios PDF/XLSX gerados no server (worker-compatible: `jspdf`, `exceljs`).
