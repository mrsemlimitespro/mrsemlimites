import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { setImpersonation } from "@/lib/impersonation";
import { cn } from "@/lib/utils";

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

function ClienteDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

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
          "id, chave, status, plano, produto_id, ativada_em, expira_em, created_at, licenca_produtos:produto_id(nome, slug)",
        )
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ["admin", "cliente", id, "pagamentos", cliente?.nome, cliente?.email],
    enabled: !!cliente,
    queryFn: async () => {
      if (!cliente) return [];
      const nome = (cliente.nome ?? "").trim();
      if (!nome) return [];
      const { data } = await (supabase as any)
        .from("payment_transactions")
        .select("id, gateway_slug, valor, moeda, status, metodo, created_at, aprovado_em")
        .ilike("cliente_nome", nome)
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
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

  const valorTotal = pagamentos
    .filter((p) => ["approved", "pago", "paid", "aprovado"].includes((p.status ?? "").toLowerCase()))
    .reduce((s, p) => s + Number(p.valor ?? 0), 0);

  const produtosUnicos = Array.from(
    new Map(
      licencas
        .filter((l) => l.licenca_produtos)
        .map((l) => [l.produto_id, l.licenca_produtos as { nome: string; slug: string }]),
    ).values(),
  );

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
                role: "cliente",
                userId: cliente.id,
                nome: cliente.nome,
                email: cliente.email,
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
            <span>Último acesso: {dt(cliente.ultimo_acesso)}</span>
            {cliente.status && (
              <span className="rounded-full border border-border/60 px-2 py-0.5">
                {cliente.status}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Dados */}
        <Card title="Dados do cliente" className="lg:col-span-1">
          <Info icon={Mail} label="Email" value={cliente.email} />
          <Info icon={Phone} label="Telefone" value={cliente.telefone} />
          <Info icon={MessageCircle} label="WhatsApp" value={cliente.whatsapp} />
          <Info icon={IdCard} label="CPF" value={cliente.cpf} />
          <Info icon={Building2} label="Empresa" value={cliente.empresa} />
        </Card>

        {/* Revendedor + Financeiro */}
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
          <div className="mt-4 border-t border-border/50 pt-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="size-4 text-[color:var(--brand-emerald)]" />
              Valor gasto (aprovado)
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {pagamentos.length ? brl(valorTotal) : "—"}
            </div>
          </div>
        </Card>

        {/* Observações */}
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
        {licencas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma licença.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Chave</th>
                  <th className="px-3 py-2 text-left">Produto</th>
                  <th className="px-3 py-2 text-left">Plano</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ativada</th>
                  <th className="px-3 py-2 text-left">Expira</th>
                </tr>
              </thead>
              <tbody>
                {licencas.map((l) => (
                  <tr key={l.id} className="border-t border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{l.chave ?? "—"}</td>
                    <td className="px-3 py-2">{l.licenca_produtos?.nome ?? "—"}</td>
                    <td className="px-3 py-2">{l.plano ?? "—"}</td>
                    <td className="px-3 py-2">{l.status ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {dt(l.ativada_em)}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {dt(l.expira_em)}
                    </td>
                  </tr>
                ))}
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

      {/* Histórico de compras / Pagamentos */}
      <Card
        title={`Histórico de compras / pagamentos (${pagamentos.length})`}
        icon={<DollarSign className="size-4 text-[color:var(--brand-emerald)]" />}
      >
        {pagamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum pagamento registrado (busca por nome do cliente).
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
            {downloads.slice(0, 20).map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="truncate">{d.file_name ?? d.pack_slug ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {d.pack_slug ?? ""} · {d.status ?? ""}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {dt(d.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-[11px] text-muted-foreground/70">
        Página somente para consulta. Use os botões acima para editar dados ou visualizar o
        painel do cliente.
      </p>
    </div>
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
