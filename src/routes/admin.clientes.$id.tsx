import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  IdCard,
  Building2,
  KeyRound,
  Package,
  DollarSign,
  Download,
  Store,
  Eye,
  Pencil,
  Loader2,
  ShieldCheck,
  Clock,
  Ban,
  FlaskConical,
  CalendarClock,
  History,
  RefreshCw,
  Lock,
  Unlock,
  CalendarRange,
  FileDown,
  Send,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { setImpersonation } from "@/lib/impersonation";
import { cn } from "@/lib/utils";
import {
  fetchPagamentosByCliente,
  totalAprovado,
} from "@/lib/admin/cliente-pagamentos";

export const Route = createFileRoute("/admin/clientes/$id")({
  head: () => ({
    meta: [
      { title: "Cliente — Admin" },
      { name: "description", content: "Ficha completa do cliente." },
    ],
  }),
  component: ClienteDetailPage,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const dt = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString("pt-BR") : "—";
const d = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "—";

// -------- Classificação de licença (visual) --------
type LicStatus = "ativa" | "aguardando" | "teste" | "bloqueada" | "expirada";
type Licenca = {
  id: string;
  chave: string | null;
  status: string | null;
  plano: string | null;
  tipo: string | null;
  produto_id: string | null;
  ativada_em: string | null;
  expira_em: string | null;
  created_at: string;
  trial_iniciado_em: string | null;
  trial_duracao_minutos: number | null;
  licenca_produtos: { nome: string; slug: string } | null;
};

function classify(l: Licenca): LicStatus {
  const st = (l.status ?? "").toLowerCase();
  if (st === "revogada" || st === "bloqueada" || st === "cancelada") return "bloqueada";
  if (st === "expirada") return "expirada";
  const exp = l.expira_em ? new Date(l.expira_em).getTime() : null;
  if (exp !== null && exp < Date.now()) return "expirada";
  if (st === "teste" || st === "trial" || (l.tipo ?? "").toLowerCase() === "trial") return "teste";
  if (!l.ativada_em || st === "pendente" || st === "aguardando") return "aguardando";
  return "ativa";
}

const STATUS_META: Record<
  LicStatus,
  { label: string; color: string; dot: string; icon: any }
> = {
  ativa: {
    label: "Ativa",
    color: "var(--brand-emerald)",
    dot: "bg-[color:var(--brand-emerald)]",
    icon: ShieldCheck,
  },
  aguardando: {
    label: "Aguardando ativação",
    color: "oklch(0.82 0.17 90)",
    dot: "bg-[color:oklch(0.82_0.17_90)]",
    icon: Clock,
  },
  teste: {
    label: "Em teste",
    color: "var(--brand-blue)",
    dot: "bg-[color:var(--brand-blue)]",
    icon: FlaskConical,
  },
  bloqueada: {
    label: "Bloqueada",
    color: "oklch(0.7 0.22 25)",
    dot: "bg-[color:oklch(0.7_0.22_25)]",
    icon: Ban,
  },
  expirada: {
    label: "Expirada",
    color: "oklch(0.7 0.22 25)",
    dot: "bg-[color:oklch(0.7_0.22_25)]",
    icon: CalendarClock,
  },
};

function diasEntre(iso: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}
function minutosRestantesTrial(l: Licenca) {
  if (!l.trial_iniciado_em || !l.trial_duracao_minutos) return null;
  const fim = new Date(l.trial_iniciado_em).getTime() + l.trial_duracao_minutos * 60_000;
  const min = Math.max(0, Math.round((fim - Date.now()) / 60_000));
  return min;
}
function fmtTrial(min: number) {
  if (min >= 1440) return `${Math.floor(min / 1440)}d`;
  if (min >= 60) return `${Math.floor(min / 60)}h`;
  return `${min}min`;
}

function ClienteDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ["admin", "cliente", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("clientes")
        .select(
          "id, nome, email, telefone, whatsapp, cpf, empresa, observacoes, status, plano, expira_em, ultimo_acesso, created_at, revendedor_id, revendedores:revendedor_id(id, nome, email)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: licencas = [] } = useQuery({
    queryKey: ["admin", "cliente", id, "licencas"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("licencas")
        .select(
          "id, chave, status, plano, tipo, produto_id, ativada_em, expira_em, created_at, trial_iniciado_em, trial_duracao_minutos, licenca_produtos:produto_id(nome, slug)",
        )
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });
      return (data ?? []) as Licenca[];
    },
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ["admin", "cliente", id, "pagamentos"],
    enabled: !!cliente,
    // Delegado à camada única de vínculo cliente↔pagamentos.
    // Ver src/lib/admin/cliente-pagamentos.ts (FALLBACK marcado lá).
    queryFn: () => fetchPagamentosByCliente(cliente!),
  });

  const { data: downloads = [] } = useQuery({
    queryKey: ["admin", "cliente", id, "downloads", cliente?.email],
    enabled: !!cliente?.email,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("pack_download_logs")
        .select("id, pack_slug, file_name, status, created_at")
        .eq("user_email", cliente!.email!)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as any[];
    },
  });

  // -------- Resumo --------
  const resumo = useMemo(() => {
    const b = { ativa: 0, aguardando: 0, teste: 0, bloqueada: 0, expirada: 0 };
    for (const l of licencas) b[classify(l)]++;
    return b;
  }, [licencas]);

  const ultimaCompra = useMemo(() => {
    const aprov = pagamentos
      .filter((p) => ["approved", "pago", "paid", "aprovado"].includes((p.status ?? "").toLowerCase()))
      .map((p) => p.aprovado_em ?? p.created_at)
      .filter(Boolean) as string[];
    const licDates = licencas.map((l) => l.created_at).filter(Boolean);
    const all = [...aprov, ...licDates].sort();
    return all.at(-1) ?? null;
  }, [pagamentos, licencas]);

  const valorTotal = totalAprovado(pagamentos);

  const produtosUnicos = Array.from(
    new Map(
      licencas
        .filter((l) => l.licenca_produtos)
        .map((l) => [l.produto_id, l.licenca_produtos as { nome: string; slug: string }]),
    ).values(),
  );

  // -------- Bulk actions --------
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleOne = (lid: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(lid) ? n.delete(lid) : n.add(lid);
      return n;
    });
  const toggleAll = () => {
    if (selected.size === licencas.length) setSelected(new Set());
    else setSelected(new Set(licencas.map((l) => l.id)));
  };

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin", "cliente", id, "licencas"] });

  const bulkRun = useMutation({
    mutationFn: async ({
      ids,
      action,
      dias,
      novaValidade,
    }: {
      ids: string[];
      action: "bloquear" | "desbloquear" | "renovar" | "validade";
      dias?: number;
      novaValidade?: string;
    }) => {
      for (const lid of ids) {
        if (action === "bloquear") {
          const { error } = await (supabase as any).rpc("cancelar_licenca", {
            _licenca_id: lid,
            _motivo: "Bloqueio em lote pelo admin",
          });
          if (error) throw error;
        } else if (action === "desbloquear") {
          const { error } = await (supabase as any).rpc("reativar_licenca", {
            _licenca_id: lid,
          });
          if (error) throw error;
        } else if (action === "renovar") {
          const { error } = await (supabase as any).rpc("renovar_licenca", {
            _licenca_id: lid,
            _dias: dias ?? 30,
          });
          if (error) throw error;
        } else if (action === "validade") {
          const { error } = await supabase
            .from("licencas")
            .update({ expira_em: novaValidade! })
            .eq("id", lid);
          if (error) throw error;
        }
      }
    },
    onSuccess: (_r, vars) => {
      toast.success(`${vars.ids.length} licença(s) atualizada(s).`);
      setSelected(new Set());
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Falha na ação em lote"),
  });

  function askDias(): number | null {
    const raw = window.prompt("Renovar por quantos dias?", "30");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  function askDate(): string | null {
    const raw = window.prompt("Nova validade (AAAA-MM-DD):", "");
    if (!raw) return null;
    const dt = new Date(raw);
    return isNaN(+dt) ? null : dt.toISOString();
  }
  function doExport() {
    const rows = licencas.filter((l) => selected.has(l.id));
    const header = ["chave", "produto", "plano", "status", "ativada_em", "expira_em"];
    const body = rows.map((l) =>
      [
        l.chave ?? "",
        l.licenca_produtos?.nome ?? "",
        l.plano ?? "",
        l.status ?? "",
        l.ativada_em ?? "",
        l.expira_em ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `licencas-${cliente?.nome ?? id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="glass mx-auto flex max-w-4xl items-center justify-center rounded-2xl px-6 py-14 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Carregando cliente...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          to="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="glass rounded-2xl px-6 py-14 text-center text-sm text-muted-foreground">
          Cliente não encontrado.
        </div>
      </div>
    );
  }

  const initial = (cliente.nome || cliente.email || "?").charAt(0).toUpperCase();
  const selCount = selected.size;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin/clientes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para Clientes
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setImpersonation({
                kind: "cliente",
                id: cliente.id,
                name: cliente.nome ?? "—",
                email: cliente.email ?? "—",
                returnTo: window.location.pathname,
              });
              navigate({ to: "/dashboard" });
            }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-white/[0.02] px-3 text-sm hover:bg-white/[0.06]"
          >
            <Eye className="size-4" /> Visualizar Painel
          </button>
          <Link
            to="/admin/$resource"
            params={{ resource: "clientes" }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-white/[0.02] px-3 text-sm hover:bg-white/[0.06]"
          >
            <Pencil className="size-4" /> Editar
          </Link>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="glass flex items-center gap-5 rounded-2xl p-5">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-2xl text-2xl font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--brand-magenta), var(--brand-orange))",
            boxShadow: "0 0 30px -6px color-mix(in oklab, var(--brand-magenta) 60%, transparent)",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {cliente.nome ?? "—"}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{cliente.email ?? "—"}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Cadastro: {dt(cliente.created_at)}</span>
            {cliente.status && (
              <span className="rounded-full border border-border/60 px-2 py-0.5">
                {cliente.status}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Resumo superior */}
      <section className="glass rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryTile label="Total de licenças" value={licencas.length} color="var(--brand-violet)" icon={KeyRound} />
          <SummaryTile label="Ativas" value={resumo.ativa} color={STATUS_META.ativa.color} icon={ShieldCheck} />
          <SummaryTile label="Aguardando ativação" value={resumo.aguardando} color={STATUS_META.aguardando.color} icon={Clock} />
          <SummaryTile label="Em teste" value={resumo.teste} color={STATUS_META.teste.color} icon={FlaskConical} />
          <SummaryTile label="Bloqueadas" value={resumo.bloqueada} color={STATUS_META.bloqueada.color} icon={Ban} />
          <SummaryTile label="Expiradas" value={resumo.expirada} color={STATUS_META.expirada.color} icon={CalendarClock} />
          <SummaryTile label="Último acesso" text={dt(cliente.ultimo_acesso)} color="var(--brand-cyan)" icon={History} />
          <SummaryTile label="Última compra" text={ultimaCompra ? d(ultimaCompra) : "—"} color="var(--brand-blue)" icon={CalendarClock} />
          <SummaryTile label="Valor gasto" text={pagamentos.length ? brl(valorTotal) : "—"} color="var(--brand-emerald)" icon={DollarSign} />
          <SummaryTile label="Revendedor responsável" text={cliente.revendedores?.nome ?? "—"} color="var(--brand-cyan)" icon={Store} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Dados do cliente" className="lg:col-span-1">
          <Info icon={Mail} label="Email" value={cliente.email} />
          <Info icon={Phone} label="Telefone" value={cliente.telefone} />
          <Info icon={MessageCircle} label="WhatsApp" value={cliente.whatsapp} />
          <Info icon={IdCard} label="CPF" value={cliente.cpf} />
          <Info icon={Building2} label="Empresa" value={cliente.empresa} />
        </Card>

        <Card title="Revendedor vinculado" className="lg:col-span-1">
          {cliente.revendedores ? (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Store className="size-4 text-[color:var(--brand-cyan)]" />
                {cliente.revendedores.nome ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {cliente.revendedores.email ?? "—"}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem revendedor vinculado.</p>
          )}
        </Card>

        <Card title="Observações" className="lg:col-span-1">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {cliente.observacoes?.trim() || "Sem observações."}
          </p>
        </Card>
      </div>

      {/* Licenças */}
      <Card
        title={`Licenças (${licencas.length})`}
        icon={<KeyRound className="size-4 text-[color:var(--brand-violet)]" />}
      >
        {/* Barra de bulk actions */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === licencas.length}
              onChange={toggleAll}
              className="size-4 rounded border-border/60 bg-transparent"
            />
            Selecionar todas
          </label>
          <span className="text-xs text-muted-foreground">
            {selCount} selecionada(s)
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <BulkBtn
              icon={Lock}
              disabled={selCount === 0 || bulkRun.isPending}
              onClick={() =>
                bulkRun.mutate({ ids: [...selected], action: "bloquear" })
              }
            >
              Bloquear
            </BulkBtn>
            <BulkBtn
              icon={Unlock}
              disabled={selCount === 0 || bulkRun.isPending}
              onClick={() =>
                bulkRun.mutate({ ids: [...selected], action: "desbloquear" })
              }
            >
              Desbloquear
            </BulkBtn>
            <BulkBtn
              icon={RefreshCw}
              disabled={selCount === 0 || bulkRun.isPending}
              onClick={() => {
                const dias = askDias();
                if (dias)
                  bulkRun.mutate({ ids: [...selected], action: "renovar", dias });
              }}
            >
              Renovar
            </BulkBtn>
            <BulkBtn
              icon={CalendarRange}
              disabled={selCount === 0 || bulkRun.isPending}
              onClick={() => {
                const novaValidade = askDate();
                if (novaValidade)
                  bulkRun.mutate({
                    ids: [...selected],
                    action: "validade",
                    novaValidade,
                  });
              }}
            >
              Alterar validade
            </BulkBtn>
            <BulkBtn
              icon={FileDown}
              disabled={selCount === 0}
              onClick={doExport}
            >
              Exportar
            </BulkBtn>
            <BulkBtn
              icon={Send}
              disabled={selCount === 0}
              onClick={() =>
                toast.info(
                  "Envio ao cliente será conectado à automação de e-mail existente.",
                )
              }
            >
              Enviar novamente
            </BulkBtn>
          </div>
        </div>

        {licencas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma licença.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2"></th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Chave</th>
                  <th className="px-3 py-2 text-left">Produto</th>
                  <th className="px-3 py-2 text-left">Plano</th>
                  <th className="px-3 py-2 text-left">Ativada</th>
                  <th className="px-3 py-2 text-left">Expira</th>
                </tr>
              </thead>
              <tbody>
                {licencas.map((l) => {
                  const kind = classify(l);
                  const meta = STATUS_META[kind];
                  const Icon = meta.icon;
                  let extra: string | null = null;
                  if (kind === "ativa") {
                    const dd = diasEntre(l.expira_em);
                    extra = dd == null ? null : `${dd}d restantes`;
                  } else if (kind === "teste") {
                    const mm = minutosRestantesTrial(l);
                    extra = mm == null ? null : `${fmtTrial(mm)} restantes`;
                  }
                  const checked = selected.has(l.id);
                  return (
                    <tr
                      key={l.id}
                      className={cn(
                        "border-t border-border/40 transition-colors",
                        checked && "bg-white/[0.04]",
                      )}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(l.id)}
                          className="size-4 rounded border-border/60 bg-transparent"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            color: meta.color,
                            borderColor: `color-mix(in oklab, ${meta.color} 45%, transparent)`,
                            background: `color-mix(in oklab, ${meta.color} 12%, transparent)`,
                          }}
                        >
                          <Icon className="size-3" strokeWidth={2.5} />
                          {meta.label}
                          {extra && (
                            <span className="ml-1 opacity-80">· {extra}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{l.chave ?? "—"}</td>
                      <td className="px-3 py-2">{l.licenca_produtos?.nome ?? "—"}</td>
                      <td className="px-3 py-2">{l.plano ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {dt(l.ativada_em)}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {dt(l.expira_em)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Produtos */}
      <Card
        title={`Produtos (${produtosUnicos.length})`}
        icon={<Package className="size-4 text-[color:var(--brand-orange)]" />}
      >
        {produtosUnicos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto associado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {produtosUnicos.map((p) => (
              <span
                key={p.slug}
                className="rounded-full border border-border/60 bg-white/[0.03] px-3 py-1 text-xs"
              >
                {p.nome}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Pagamentos */}
      <Card
        title={`Histórico de compras / pagamentos (${pagamentos.length})`}
        icon={<DollarSign className="size-4 text-[color:var(--brand-emerald)]" />}
      >
        {pagamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum pagamento registrado.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Gateway</th>
                  <th className="px-3 py-2 text-left">Método</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr key={p.id} className="border-t border-border/40">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {dt(p.created_at)}
                    </td>
                    <td className="px-3 py-2">{p.gateway_slug ?? "—"}</td>
                    <td className="px-3 py-2">{p.metodo ?? "—"}</td>
                    <td className="px-3 py-2">{p.status ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {brl(Number(p.valor ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Downloads */}
      <Card
        title={`Downloads (${downloads.length})`}
        icon={<Download className="size-4 text-[color:var(--brand-blue)]" />}
      >
        {downloads.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem downloads registrados.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {downloads.slice(0, 20).map((dl) => (
              <li
                key={dl.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="truncate">{dl.file_name ?? dl.pack_slug ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {dl.pack_slug ?? ""} · {dl.status ?? ""}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {dt(dl.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---- Sub-componentes ----
function SummaryTile({
  label,
  value,
  text,
  color,
  icon: Icon,
}: {
  label: string;
  value?: number;
  text?: string;
  color: string;
  icon: any;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" style={{ color }} strokeWidth={2.5} />
        <span className="truncate">{label}</span>
      </div>
      <div
        className="mt-1 truncate text-lg font-semibold tracking-tight"
        style={value != null ? { color } : undefined}
      >
        {value != null ? value : text}
      </div>
    </div>
  );
}

function BulkBtn({
  icon: Icon,
  children,
  disabled,
  onClick,
}: {
  icon: any;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-white/[0.02] px-2.5 text-xs",
        "transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}

function Card({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-2xl p-5", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2 py-1 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate">{value?.trim() || "—"}</div>
      </div>
    </div>
  );
}
