import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search,
  KeyRound,
  ShieldCheck,
  Clock,
  Ban,
  Store,
  DollarSign,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Admin" },
      { name: "description", content: "Gestão de clientes." },
    ],
  }),
  component: AdminClientesPage,
});

type Cliente = {
  id: string;
  nome: string | null;
  email: string | null;
  created_at: string | null;
  revendedor_id: string | null;
  revendedores?: { nome: string | null } | null;
  licencas?: Array<{
    id: string;
    status: string | null;
    ativada_em: string | null;
    created_at: string | null;
    expira_em: string | null;
  }>;
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

type Licenca = NonNullable<Cliente["licencas"]>[number];
function classify(l: Licenca) {
  const st = (l.status ?? "").toLowerCase();
  const exp = l.expira_em ? new Date(l.expira_em).getTime() : null;
  if (st === "revogada" || st === "bloqueada") return "bloqueada";
  if (exp !== null && exp < Date.now()) return "expirada";
  if (st === "ativa") return "ativa";
  if (!l.ativada_em || st === "pendente" || st === "aguardando") return "aguardando";
  return "ativa";
}

function AdminClientesPage() {
  const [q, setQ] = useState("");

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["admin", "clientes", "cards"],
    queryFn: async (): Promise<Cliente[]> => {
      const { data, error } = await (supabase as any)
        .from("clientes")
        .select(
          "id, nome, email, created_at, revendedor_id, revendedores:revendedor_id(nome), licencas:licencas(id, status, ativada_em, created_at, expira_em)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Cliente[];
    },
    staleTime: 30_000,
  });

  // Preload aggregated "valor gasto" via payment_transactions matched by cliente_nome.
  // Relationship cliente_id não existe em payment_transactions atualmente; usamos
  // cliente_nome como fallback. Quando o relacionamento formal existir, esta query
  // pode ser trocada sem alterar o card.
  const { data: gastoByNome = {} } = useQuery({
    queryKey: ["admin", "clientes", "valor-gasto"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await (supabase as any)
        .from("payment_transactions")
        .select("cliente_nome, valor, status")
        .in("status", ["approved", "pago", "paid", "aprovado"]);
      if (error) return {};
      const map: Record<string, number> = {};
      for (const r of (data ?? []) as Array<{ cliente_nome: string | null; valor: number | null }>) {
        const k = (r.cliente_nome ?? "").trim().toLowerCase();
        if (!k) continue;
        map[k] = (map[k] ?? 0) + Number(r.valor ?? 0);
      }
      return map;
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clientes;
    return clientes.filter(
      (c) =>
        (c.nome ?? "").toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s),
    );
  }, [clientes, q]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text-warm">Clientes</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientes.length} cliente(s) no total
        </p>
      </header>

      <label className="glass relative flex h-12 w-full items-center rounded-2xl pl-11 pr-4">
        <Search className="absolute left-4 size-4 text-muted-foreground" strokeWidth={2} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </label>

      {isLoading ? (
        <div className="glass flex items-center justify-center rounded-2xl px-6 py-14 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-14 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const licencas = c.licencas ?? [];
            const buckets = { ativa: 0, aguardando: 0, bloqueada: 0, expirada: 0 };
            let ultimaCompra: string | null = null;
            for (const l of licencas) {
              buckets[classify(l)]++;
              const t = l.created_at;
              if (t && (!ultimaCompra || new Date(t) > new Date(ultimaCompra))) ultimaCompra = t;
            }
            const gasto = gastoByNome[(c.nome ?? "").trim().toLowerCase()] ?? null;
            return (
              <ClienteCard
                key={c.id}
                id={c.id}
                nome={c.nome ?? "—"}
                email={c.email ?? "—"}
                total={licencas.length}
                ativas={buckets.ativa}
                aguardando={buckets.aguardando}
                bloqueadas={buckets.bloqueada + buckets.expirada}
                ultimaCompra={ultimaCompra}
                revendedor={c.revendedores?.nome ?? null}
                valorGasto={gasto}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClienteCard(props: {
  id: string;
  nome: string;
  email: string;
  total: number;
  ativas: number;
  aguardando: number;
  bloqueadas: number;
  ultimaCompra: string | null;
  revendedor: string | null;
  valorGasto: number | null;
}) {
  const initial = (props.nome || props.email || "?").charAt(0).toUpperCase();
  return (
    <article
      className="glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-magenta), var(--brand-orange))",
            boxShadow:
              "0 0 24px -4px color-mix(in oklab, var(--brand-magenta) 60%, transparent)",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{props.nome}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{props.email}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3 text-xs">
        <Row icon={KeyRound} color="var(--brand-violet)" label={`${props.total} licença(s)`} />
        <Row icon={ShieldCheck} color="var(--brand-emerald)" label={`${props.ativas} ativa(s)`} />
        <Row
          icon={Clock}
          color="oklch(0.78 0.19 75)"
          label={`${props.aguardando} aguardando ativação`}
        />
        <Row icon={Ban} color="oklch(0.72 0.2 25)" label={`${props.bloqueadas} bloqueada(s)`} />
      </ul>

      <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <Row
          icon={Calendar}
          color="var(--brand-blue)"
          label={
            <>
              Última compra:{" "}
              <span className="text-foreground">
                {props.ultimaCompra
                  ? new Date(props.ultimaCompra).toLocaleDateString("pt-BR")
                  : "—"}
              </span>
            </>
          }
        />
        <Row
          icon={Store}
          color="var(--brand-cyan)"
          label={
            <>
              Revendedor:{" "}
              <span className="text-foreground">{props.revendedor ?? "—"}</span>
            </>
          }
        />
        <Row
          icon={DollarSign}
          color="var(--brand-emerald)"
          label={
            <>
              Valor gasto:{" "}
              <span className="text-foreground">
                {props.valorGasto != null ? brl(props.valorGasto) : "—"}
              </span>
            </>
          }
        />
      </ul>

      <Link
        to="/admin/clientes/$id"
        params={{ id: props.id }}
        className={cn(
          "mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium",
          "border border-border/60 bg-white/[0.02] transition-colors hover:bg-white/[0.06]",
        )}
      >
        Abrir Cliente <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

function Row({
  icon: Icon,
  color,
  label,
}: {
  icon: any;
  color: string;
  label: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0" style={{ color }} strokeWidth={2} />
      <span className="truncate">{label}</span>
    </li>
  );
}
