
# Plano — Servidor de Licenciamento MR LOV 2.2

## Situação atual (o que já existe hoje no projeto)

Antes de criar qualquer coisa nova, é importante você saber que **grande parte do que você pediu JÁ EXISTE** no MR Sem Limites. O servidor "antigo perdido" pode ter sido, na verdade, este próprio backend. Resumo do que já está implantado:

**Tabelas já existentes:**
- `licencas` (24 colunas: chave, status, tipo teste/premium, trial, expira_em, device_id, max_dispositivos, cliente_id, revendedor_id, fornecedor_slug, versao_min, etc.)
- `licenca_dispositivos` (HWID/multi-device com ip, user_agent, último acesso)
- `licenca_acessos` (log de cada validação — ok, invalid, blocked, trial_expired, device_limit, outdated, upstream_denied)
- `licencas_eventos` (auditoria: criada, vinculada, ativada, renovada, cancelada, expirada, reset, acesso)
- `licenca_produtos`, `clientes`, `planos`, `payment_transactions`, `payment_gateways`, `payment_webhook_logs`, `user_roles` (com `has_role` + enum `app_role`)

**Endpoint público já existente:**
- `POST /api/public/validar-licenca` — faz tudo: valida chave+email+device, inicia trial na 1ª chamada, expira trial/premium vencidos, controla limite de dispositivos, chama proxy do fornecedor, grava log, retorna `{ ok, valid, premium, tipo, expira_em, expires_in, cliente_id, reason }`.

**Funções DB já existentes:** `gerar_licencas`, `atribuir_licenca_cliente`, `renovar_licenca`, `reativar_licenca`, `cancelar_licenca`, `resetar_device_licenca`, `converter_licenca_em_premium`, `expirar_licencas_vencidas`, `expirar_trials_vencidos`, `notificar_licencas_expirando`, `has_role`.

**Painel admin já existente:** `/admin/licencas` (via `admin.$resource.tsx`), `/admin/pagamentos`, `/admin/usuarios`, `/admin/pack-autorizacoes`, `/admin/configuracoes`.

**Webhooks já existentes:** Cakto, Kiwify, Mercado Pago (`/api/public/webhooks/*`).

**Segurança:** RLS ativo em todas as tabelas, JWT via Supabase Auth, `has_role` com `user_roles` (padrão seguro), logs em `licenca_acessos` e `audit_logs`.

## O que realmente falta (delta a construir)

Comparando seu pedido com o que existe, o gap é pequeno:

1. **Endpoints REST adicionais que a extensão pode chamar** (hoje só existe `validar-licenca`):
   - `POST /api/public/licenca/heartbeat` — ping periódico (grava `ultimo_acesso`, retorna status)
   - `POST /api/public/licenca/renovar` — renovação a partir da extensão (com token)
   - `POST /api/public/licenca/reset-hwid` — solicitação de reset (fila; admin aprova)
   - `POST /api/public/licenca/revogar` — auto-revogação/logout do device
   - `GET  /api/public/licenca/config` — download de configuração remota da extensão (feature flags, endpoints, versão mínima)
   - `GET  /api/public/licenca/consulta?chave=...` — consulta pública read-only (status/expira_em)

2. **Estados formais VALID/EXPIRED/REVOKED/BLOCKED/DEVICE_MISMATCH/PENDING/TRIAL** — hoje o campo `status` usa `ativa/expirada/cancelada/revogada` + `tipo` `teste/premium`. Vou adicionar uma **view/coluna computada** `estado_extensao` que mapeia os campos internos para os 7 rótulos que a extensão espera, **sem quebrar** o schema atual.

3. **Dashboard consolidado de licenciamento** (`/admin/licencas-dashboard`): totais, ativas, expiradas, bloqueadas, dispositivos conectados, ativações hoje, renovações do dia — hoje só existe a listagem CRUD.

4. **Tabela `api_keys`** (para chaves de integração/serviço, ex.: extensão em modo signed) — não existe ainda.

5. **Tabela `settings` centralizada** — hoje temos `admin_settings` (singleton para senha admin); vou estender para chave→valor genérico usado por `/licenca/config`.

6. **Rate limit por IP/chave** nos endpoints públicos — hoje não há.

7. **Mercado Pago recorrente:** o webhook já existe, mas o fluxo "aprovado → cria licença → envia email com a chave" precisa ser completado (hoje aprova pagamento e credita, mas não gera licença automaticamente por plano).

## O que **NÃO** vou fazer

- **Não vou renomear** `licencas` para `licenses`, `clientes` para `users`, etc. Isso quebraria todo o painel, RLS, funções DB, webhooks e a própria extensão que provavelmente já usa os nomes atuais. Vou manter os nomes em PT-BR do projeto e apenas **adicionar** o que falta.
- **Não vou** recriar tabelas que já existem (`clientes`, `planos`, `licencas`, `licenca_dispositivos`, `payment_transactions`, `licencas_eventos` já cobrem `users/licenses/license_devices/payments/license_logs`).
- **Não vou** trocar a tecnologia (continua TanStack Start + Lovable Cloud + RLS).
- **Não vou** tocar em nada da Home, checkout, packs, prompts, agents, PWA — como você já pediu antes.
- **Não vou** aplicar nada antes de você aprovar este plano.

## Fase 2 — quando você enviar o ZIP da extensão MR LOV 2.2

Ao receber o `.zip/.rar` da extensão, vou:

1. Extrair e ler `manifest.json`, `background.js`/service worker, `content-scripts`, `popup`, `options`.
2. Listar **todos** os `fetch(...)`/`XMLHttpRequest`/URLs base encontrados.
3. Extrair o **shape exato** de request/response que a extensão envia e espera em cada endpoint.
4. Comparar com o endpoint atual `/api/public/validar-licenca` e com os novos que este plano cria.
5. Ajustar **apenas o backend** para bater 100% com o contrato da extensão (nomes de campos, códigos de erro, envelope JSON). A extensão não será modificada.
6. Entregar o **Relatório Final** que você pediu: endpoints identificados, fluxos, % de compatibilidade, checklist, arquivos a alterar (se algum) vs. intactos.

Somente depois disso, e com sua nova aprovação explícita, aplico o ajuste de compatibilidade.

## Ordem de execução (após aprovação)

1. **Migração 1 — schema delta:** cria `api_keys`, estende `admin_settings` com JSON `config_extensao`, adiciona view `v_licenca_estado` (mapeia para VALID/EXPIRED/REVOKED/BLOCKED/DEVICE_MISMATCH/PENDING/TRIAL), adiciona coluna `reset_hwid_solicitado_em` em `licencas`. Todos os GRANTs + RLS.
2. **Migração 2 — MP recorrente:** trigger `payment_transactions.status=aprovado + plano_id` → gera licença automaticamente via `gerar_licencas`, vincula ao cliente, dispara notificação.
3. **Rotas server:** cria os 6 endpoints `/api/public/licenca/*` acima, com verificação de assinatura simples (chave + timestamp), rate-limit em memória por IP.
4. **UI admin:** cria `/admin/licencas-dashboard` (cards + gráfico), reaproveitando o layout de `admin.index.tsx`.
5. **Testes de fumaça:** curl em cada endpoint público para conferir shape.
6. **Aguardar ZIP** para Fase 2 (compatibilidade).

## Detalhes técnicos (para referência)

- Stack: TanStack Start v1 + React 19 + Tailwind v4 (mantido).
- Endpoints públicos ficam sob `src/routes/api/public/licenca/*.ts` (bypass de auth do Lovable — cada handler valida assinatura/chave por conta própria).
- Reset HWID vira **fluxo em duas etapas**: extensão marca `reset_hwid_solicitado_em`; admin aprova em `/admin/licencas` (usa `resetar_device_licenca` existente).
- Estados exportados via view SQL — zero mudança destrutiva nas colunas atuais.
- `api_keys`: `id, nome, hash, scopes[], created_by, revoked_at`; hash BCrypt, nunca guarda a chave em claro.
- Nenhuma exposição do `SUPABASE_SERVICE_ROLE_KEY` para o cliente.

## Confirmação que preciso de você

Responda:

1. **Aprovado** → executo os passos 1–5 e aguardo o ZIP.
2. **Aprovado apenas parcialmente** → me diga quais itens tirar/adiar.
3. **Envie o ZIP antes** → então eu paro aqui, leio a extensão primeiro, e volto com o plano refinado ao contrato real dela (recomendado se você tem o arquivo em mãos — evita retrabalho).

Nenhum arquivo do projeto será alterado até sua confirmação.
