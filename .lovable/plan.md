
# Reestruturação Enterprise — MR Sem Limites

Escopo: profissionalizar o **painel administrativo** e a **hierarquia Master → Revendedor → Cliente**, sem alterar extensão, SDK, APIs da extensão, sistema de licenciamento em produção, nem checkout Kiwify.

Tamanho real do trabalho: ~15–25 arquivos por fase, várias migrations, várias telas novas. Vou executar **por fases**, e ao final de cada fase paro para você validar antes da próxima.

---

## Fase 0 — Auditoria (só leitura, sem código)

Antes de mexer, vou mapear e te entregar um relatório com:

- Abas do admin que existem hoje (`admin.*.tsx`)
- Quais têm CRUD real vs quais são só UI
- Botões sem handler / sem função
- Cards com número mockado ou sem query
- Relatórios/gráficos que puxam dado real vs falso
- Tabelas do banco que já suportam a hierarquia e o que falta

Entregável: `.lovable/auditoria-admin.md` com lista item-a-item + severidade.

**Nada é alterado nesta fase.** Você aprova o que entra em cada fase seguinte.

---

## Fase 1 — Hierarquia (base de tudo)

Sem isso, nenhuma outra fase funciona.

**Banco (migration):**
- Garantir `revendedores.auth_user_id` como pivô da hierarquia (já existe).
- `clientes.revendedor_id` obrigatório em novos cadastros (já existe coluna; reforçar trigger).
- View `v_hierarquia` (master vê tudo; revendedor vê só seus clientes/licenças/vendas).
- RLS revisada nas tabelas: `clientes`, `licencas`, `payment_transactions`, `promocoes`, `notificacoes` — revendedor só enxerga o próprio escopo; master (has_role admin) vê tudo. Já está quase todo assim; vou fechar os buracos que a auditoria apontar.

**Front:**
- Nada novo aqui. Só garantir que as telas do revendedor (`/clientes`, `/licencas`, `/creditos`) filtram por `current_revendedor_id()` (já filtram via RLS).

---

## Fase 2 — Admin: limpar o que é falso

Para cada aba do admin listada na Fase 0:

- Aba sem uso → remover do menu (mantendo rota se algo importa).
- Botão sem handler → implementar ou remover.
- Card com número fixo → conectar em query real (`supabase.from(...).select("id",{count:"exact",head:true})`).
- CRUD incompleto → completar via `admin.$resource.tsx` (mecanismo genérico já existente em `src/lib/admin/resources.ts`).

Sem inventar dados. Se não há dado real, o card mostra "—" e explica.

---

## Fase 3 — Clientes & Cadastro automático

- Trigger `tg_auth_user_to_cliente` (já existe) — verificar se está vinculando ao revendedor certo quando o signup vem de link de revendedor. Se não, adicionar `raw_user_meta_data->>'revendedor_id'` no insert.
- Form de cliente no admin com todos os campos exigidos: nome, email, telefone, whatsapp, CPF (opcional), empresa (opcional), revendedor_id, status. Colunas que faltarem entram por migration.
- Tela "Clientes" do admin: filtro por revendedor, produto, status, última compra.

---

## Fase 4 — Licenças (organização, sem tocar validação)

Só UI + views. **Não altero** `validar_licenca`, `heartbeat_licenca`, endpoints `/api/public/licenca/*`, nem SDK.

- Abas no `/admin/licencas`: Teste · Premium · Expiradas · Canceladas · Bloqueadas · Todas.
- Coluna "Nível": Master / Revenda / Cliente (derivada de `revendedor_id` + `cliente_id`).
- Botão **Restaurar Dispositivo**: chama RPC `resetar_device_licenca` (já existe) + grava evento em `licencas_eventos` com motivo (novo campo `metadata.motivo`, sem alterar schema base).
- Histórico do reset: já cai em `licencas_eventos` via trigger.

---

## Fase 5 — Revendedor: promoções, cupons, campanhas

Tabela `promocoes` já existe. Vou:

- Garantir RLS: revendedor CRUD só nas próprias; master vê todas.
- CRUD no painel do revendedor (`/promocoes` — rota nova sob `_app`).
- Renderizar promoções ativas do revendedor no dashboard do cliente daquele revendedor.
- Cupons: coluna `codigo` + `desconto_percent`/`desconto_valor` (adicionar por migration se não houver).

---

## Fase 6 — Central de Comunicação (estrutura, sem enviar ainda)

- Tabela `mensagens_campanhas` (destinatário: todos/revendedores/clientes/individual; filtros: produto/plano/status/última compra; status: rascunho/agendada/enviada).
- Tela admin `/admin/comunicacao` com composer + preview de audiência (contagem real via query).
- **Envio real de WhatsApp fica desativado** — botão "Enviar" grava a campanha como `pronta_para_envio`. Integração com API oficial entra numa fase futura quando você tiver as credenciais.

---

## Fase 7 — Dashboard & Relatórios reais

Substituir números fixos por queries reais em: clientes, revendedores, produtos, licenças (por status), receita (soma de `payment_transactions` aprovados), downloads (`pack_download_logs`), ativações (`licencas_eventos.tipo='ativada'`), promoções ativas, conversão (aprovados/total), novos cadastros (7/30 dias), dispositivos (`licenca_dispositivos`).

---

## Regras que valem em todas as fases

- Não toco em: `extension-sdk/**`, `src/routes/api/public/ext/**`, `src/routes/api/public/licenca/**`, `src/routes/api/public/validar-licenca.ts`, `src/routes/api/public/webhooks/**`, `src/routes/checkout.tsx`, `supabase/config.toml`, arquivos auto-gerados do Supabase.
- Nenhum dado mockado. Se não há dado, mostra estado vazio.
- Cada fase termina com build passando e uma verificação rápida no preview.

---

## Como quero conduzir

Se você aprovar este plano, começo pela **Fase 0 (auditoria, só leitura)** e te devolvo o relatório antes de mexer em qualquer arquivo. Aí você me diz quais itens quer priorizar nas Fases 1–7 (ou se quer todas em ordem).
