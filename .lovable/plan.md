## Fase 2 — CRM de Clientes + Licenças

Objetivo: evoluir apenas a área administrativa de clientes/licenças, sem tocar checkout, extensão, SDK, prompts, agents, packs, loja, design system ou banco existente (novas colunas só se estritamente necessário — pergunto antes).

### Escopo (o que muda)

Somente:
- `src/routes/admin.clientes.tsx` (busca + filtros)
- `src/routes/admin.clientes.$id.tsx` (refatorado em abas)
- Novos componentes em `src/components/admin/cliente/`
- Nova camada `src/lib/admin/cliente-detail.ts` (queries agregadas + exportação)

### Página do Cliente — reorganização em abas

Cabeçalho e resumo superior já existem — mantidos e completados com:
- Foto placeholder (avatar), Nome, Email, Telefone, Empresa, CPF, Revendedor, Cadastro, Último acesso, Última compra, Valor gasto.
- Grade de status: Total, Ativas, Em teste, Aguardando, Bloqueadas, Expiradas.

Sistema de abas (`Tabs` shadcn) substituindo a lista única atual:

1. **Licenças** — tabela com bolinha de status colorida (verde/azul/amarelo/vermelho/cinza), dias/tempo restante, produto, chave, criação, ativação, expiração, dispositivo, SO, versão e IP do último acesso (colunas de device usam `licenca_dispositivos` / `licenca_acessos` existentes; campos ausentes exibem "—"). Seleção múltipla + ações em lote existentes + **Mover para outro cliente** (dialog com busca de clientes) e **Excluir** (com confirmação, respeitando RLS admin).
2. **Compras** — pedido, produto, valor, gateway, status, data, forma de pagamento. Reaproveita `fetchPagamentosByCliente` (camada única já pronta).
3. **Produtos** — produtos derivados das licenças do cliente (agrupado por `licenca_produtos`).
4. **Downloads** — arquivo, data, IP, dispositivo, versão (via `pack_download_logs`).
5. **Histórico** — timeline consolidada: compras + eventos de licença + downloads.
6. **Observações** — bloco de anotações internas (apenas admin). Grava em `clientes.observacoes` (já existe).
7. **Logs** — `licencas_eventos` do cliente (criação, ativação, teste, renovação, bloqueio, desbloqueio, expiração, acesso, download). Somente leitura — nenhum trigger/RPC novo.

### Página Admin > Clientes — busca e filtros

- Busca ampliada: nome, email, telefone, empresa, CPF, chave de licença, id de pedido, revendedor. Implementada client-side sobre os dados já carregados + fallback server para chave/pedido quando houver termo longo.
- Barra de filtros (chips): Ativos, Teste, Expirados, Bloqueados, Sem ativação, Com compras, Sem compras.
- Exportação da lista atual em **CSV**, **Excel (.xlsx via SheetJS)** e **PDF (via jsPDF + autotable)**. Deps adicionadas: `xlsx`, `jspdf`, `jspdf-autotable`.

### Ações em licença (já parciais)

Manter as existentes (bloquear/desbloquear/renovar/alterar validade/exportar/enviar novamente) e adicionar:
- **Mover para outro cliente** — `UPDATE licencas SET cliente_id=? WHERE id IN (...)` via client admin (RLS já permite admin).
- **Excluir** — soft-delete via `status='cancelada'` (não removemos linhas para preservar histórico). Caso o usuário queira remoção física, confirmo antes.

### Compatibilidade

- Nada de checkout/SDK/extensão/APIs públicas/webhooks/migrations/prompts/agents/packs/loja.
- Nenhuma coluna nova no banco. "Enviar novamente ao cliente" continua como toast (placeholder) já que não há transporte de email configurado nesta fase — se quiser, ligo a um fluxo futuro.
- Design system atual preservado (`glass`, tokens, gradientes).
- Zero mudança em rotas existentes; a página do cliente continua em `/admin/clientes/$id`.

### Pontos que preciso confirmar antes de codar

1. **Excluir licença**: soft (status=cancelada) ou hard delete físico? Recomendo soft.
2. **Exportação Excel/PDF**: OK adicionar `xlsx` + `jspdf` + `jspdf-autotable` como dependências? (~150 KB gzip somados, lazy-loaded no clique.)
3. **"Enviar novamente ao cliente"**: mantém como placeholder (toast) ou você quer que eu conecte já a um endpoint de email? Se sim, qual (Resend, SMTP, etc.)?
4. **Campos device/SO/versão/IP nas licenças**: hoje a licença tem `device_id` texto e `ultimo_acesso`; SO/versão/IP moram em `licenca_acessos`/`licenca_dispositivos` (JOIN). Confirma que posso ler dessas tabelas via SELECT (sem alterar RLS)?

Ao final entrego: lista de arquivos alterados/criados, rotas (nenhuma nova rota; apenas conteúdo das existentes), campos usados (todos já existentes), e confirmação de que nada fora do admin de clientes/licenças foi tocado.
