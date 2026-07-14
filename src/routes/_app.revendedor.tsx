import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  KeyRound,
  DollarSign,
  TrendingUp,
  Wallet,
  AlertCircle,
  Loader2,
  Coins,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/revendedor")({
  head: () => ({
    meta: [
      { title: "Painel do Revendedor — MR sem Limites" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RevendedorDashboard,
});

type DashKPI = {
  ok: boolean;
  clientes: number;
  licencas_total: number;
  licencas_ativas: number;
  vendas_mes: number;
  receita_mes: number;
  receita_total: number;
  comissao_pendente: number;
  comissao_paga: number;
  saldo_creditos: number;
  pendencias: number;
};

function RevendedorDashboard() {
  const [kpi, setKpi] = useState<DashKPI | null>(null);
  const [vendas, setVendas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("revendedor_dashboard");
      setKpi(data as DashKPI);

      const [{ data: v }, { data: c }, { data: co }] = await Promise.all([
        supabase
          .from("payment_transactions")
          .select("id,valor,status,metodo,cliente_email,cliente_nome,created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("clientes")
          .select("id,nome,email,created_at,status")
          .order("created_at", { ascending: false })
          .limit(10),
        (supabase as any)
          .from("comissoes")
          .select("id,valor,percentual,status,created_at,payment_id")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setVendas(v ?? []);
      setClientes(c ?? []);
      setComissoes(co ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!kpi?.ok) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-semibold">Área do revendedor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta ainda não é revendedora. Fale com o administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Revenda
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text">Painel do Revendedor</span>
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Clientes" value={kpi.clientes} icon={Users} />
        <Kpi label="Licenças ativas" value={kpi.licencas_ativas} icon={KeyRound} />
        <Kpi
          label="Vendas do mês"
          value={kpi.vendas_mes}
          hint={`R$ ${money(kpi.receita_mes)}`}
          icon={TrendingUp}
        />
        <Kpi
          label="Receita total"
          value={`R$ ${money(kpi.receita_total)}`}
          icon={DollarSign}
        />
        <Kpi label="Créditos" value={kpi.saldo_creditos} icon={Coins} />
        <Kpi
          label="Comissão pendente"
          value={`R$ ${money(kpi.comissao_pendente)}`}
          icon={Wallet}
        />
        <Kpi
          label="Comissão paga"
          value={`R$ ${money(kpi.comissao_paga)}`}
          icon={Wallet}
        />
        <Kpi label="Pendências" value={kpi.pendencias} icon={AlertCircle} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Últimas vendas">
          {vendas.length === 0 ? (
            <Empty msg="Sem vendas recentes." />
          ) : (
            <ul className="divide-y divide-white/5">
              {vendas.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div>{v.cliente_nome || v.cliente_email || "—"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(v.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ {money(v.valor)}</div>
                    <div
                      className={cn(
                        "text-[10px] uppercase tracking-wider",
                        v.status === "aprovado"
                          ? "text-emerald-300"
                          : "text-muted-foreground",
                      )}
                    >
                      {v.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Últimos clientes">
          {clientes.length === 0 ? (
            <Empty msg="Sem clientes recentes." />
          ) : (
            <ul className="divide-y divide-white/5">
              {clientes.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div>{c.nome}</div>
                    <div className="text-[10px] text-muted-foreground">{c.email}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Card title="Histórico de comissões">
        {comissoes.length === 0 ? (
          <Empty msg="Sem comissões registradas ainda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-white/5">
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Valor</th>
                  <th className="px-2 py-2">%</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {comissoes.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-2 py-2 text-xs">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-2 py-2 font-medium">R$ {money(c.valor)}</td>
                    <td className="px-2 py-2 text-xs">{Number(c.percentual).toFixed(0)}%</td>
                    <td className="px-2 py-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                          c.status === "pago"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : c.status === "pendente"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300",
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function money(v: any): string {
  return Number(v ?? 0).toFixed(2).replace(".", ",");
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: any;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-6 text-center text-xs text-muted-foreground">{msg}</div>;
}
