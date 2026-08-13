import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  MessageSquare,
  Target,
  Users,
  UserPlus,
  CreditCard,
  MessageCircle,
  FileText,
  LogIn,
  KeyRound,
  XCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Coins,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import React, { useEffect, useState, useCallback, useId } from "react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { PageContainer } from "@/components/page-container";

import { PromoCarousel } from "@/components/promo-carousel";
import {
  PromocoesSection,
  PlanosSection,
  ProdutosSection,
  ProdutosBannerCarousel,
  PropagandasSection,
  VideosSection,
} from "@/components/home/home-sections";
import { useModules } from "@/lib/admin/use-modules";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MR Lova" },
      { name: "description", content: "Painel principal do MR Lova." },
    ],
  }),
  component: DashboardPage,
});

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Kpi = {
  label: string;
  value: string;
  icon: IconType;
  color: string;
  sparkline: number[];
};

type Metrics = {
  receitaTotal: number;
  novosClientes: number;
  conversao: number;
  ticketsAbertos: number;
  receitaSpark: number[];
  clientesSpark: number[];
  conversaoSpark: number[];
  ticketsSpark: number[];
  chartDays: string[];
  chartValues: number[];
};

type PaymentRow = {
  id: string;
  cliente_nome: string | null;
  valor: number | null;
  status: string | null;
  created_at: string;
  metodo: string | null;
  gateway_slug: string | null;
};

type ActivityRow = {
  id: string;
  event: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function startOfDayUTC(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function last7Days() {
  const days: Date[] = [];
  const today = startOfDayUTC(new Date());
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

async function loadMetrics(): Promise<Metrics> {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [viewRes, txRecentes, clientesUlt, ticketsRes] = await Promise.all([
    supabase.from("v_dashboard_metricas").select("*").maybeSingle(),
    supabase
      .from("payment_transactions")
      .select("valor,status,created_at")
      .gte("created_at", since.toISOString()),
    supabase.from("clientes").select("created_at").gte("created_at", since.toISOString()),
    supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("categoria", "suporte")
      .is("lida_em", null),
  ]);

  const v = (viewRes.data ?? {}) as {
    receita_total?: number;
    clientes?: number;
    conversao?: number;
  };

  const days = last7Days();
  const chartValues = days.map((d) => {
    const dEnd = new Date(d);
    dEnd.setDate(dEnd.getDate() + 1);
    return (txRecentes.data ?? [])
      .filter((r) => {
        if (r.status !== "aprovado") return false;
        const t = new Date(r.created_at).getTime();
        return t >= d.getTime() && t < dEnd.getTime();
      })
      .reduce((s, r) => s + Number(r.valor ?? 0), 0);
  });

  const chartDays = days.map((d) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
  );

  const receitaSpark = chartValues.length ? chartValues : [0, 0, 0, 0, 0, 0, 0];

  const clientesSpark = days.map((d) => {
    const dEnd = new Date(d);
    dEnd.setDate(dEnd.getDate() + 1);
    return (clientesUlt.data ?? []).filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= d.getTime() && t < dEnd.getTime();
    }).length;
  });

  const conversaoSpark = days.map((d) => {
    const dEnd = new Date(d);
    dEnd.setDate(dEnd.getDate() + 1);
    const inDay = (txRecentes.data ?? []).filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= d.getTime() && t < dEnd.getTime();
    });
    if (inDay.length === 0) return 0;
    return (inDay.filter((r) => r.status === "aprovado").length / inDay.length) * 100;
  });

  return {
    receitaTotal: Number(v.receita_total ?? 0),
    novosClientes: Number(v.clientes ?? 0),
    conversao: Number(v.conversao ?? 0),
    ticketsAbertos: ticketsRes.count ?? 0,
    receitaSpark,
    clientesSpark,
    conversaoSpark,
    ticketsSpark: [0, 0, 0, 0, 0, 0, 0],
    chartDays,
    chartValues,
  };
}

const EVENT_META: Record<string, { label: string; icon: IconType; color: string }> = {
  novo_cliente: { label: "Novo cliente cadastrado", icon: UserPlus, color: "var(--brand-emerald)" },
  compra_aprovada: { label: "Compra aprovada", icon: CreditCard, color: "var(--brand-blue)" },
  compra_recusada: { label: "Compra recusada", icon: XCircle, color: "var(--brand-orange)" },
  licenca_criada: { label: "Licença criada", icon: FileText, color: "var(--brand-violet)" },
  credito_comprado: { label: "Crédito comprado", icon: Coins, color: "var(--brand-magenta)" },
  login: { label: "Login realizado", icon: LogIn, color: "var(--brand-cyan)" },
  cadastro: { label: "Novo cadastro", icon: KeyRound, color: "var(--brand-emerald)" },
  alteracao: { label: "Alteração importante", icon: Settings, color: "var(--brand-blue)" },
};

function eventInfo(ev: string) {
  return (
    EVENT_META[ev] ?? {
      label: ev.replaceAll("_", " "),
      icon: MessageCircle,
      color: "var(--brand-violet)",
    }
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function DashboardPage() {
  const { visibleIn, modules } = useModules();
  const showHome = (slug: string) => visibleIn("home", slug);

  // Fase 3 — ordem dinâmica das seções da Home
  const HOME_SECTION_RENDERERS: Record<string, () => React.ReactElement> = {
    carrossel: () => <PromoCarousel key="carrossel" />,
    propagandas: () => <PropagandasSection key="propagandas" posicao="home" />,
    "loja-produtos": () => <ProdutosBannerCarousel key="loja-produtos" />,
    promocoes: () => <PromocoesSection key="promocoes" />,
    planos: () => <PlanosSection key="planos" />,
    produtos: () => <ProdutosSection key="produtos" />,
    videos: () => <VideosSection key="videos" />,
  };
  const HOME_DEFAULT_ORDER = [
    "carrossel",
    "propagandas",
    "loja-produtos",
    "promocoes",
    "planos",
    "produtos",
    "videos",
  ];
  const homeSections = (() => {
    const configured = modules
      .filter((m) => m.mostrar_home && m.ativo && HOME_SECTION_RENDERERS[m.slug])
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => m.slug);
    // Fallback: sem módulos carregados ainda, usa ordem padrão
    if (configured.length === 0) return HOME_DEFAULT_ORDER;
    // Adiciona slugs restantes que ainda não estão em `configured` (novos/legado) usando defaults
    const missing = HOME_DEFAULT_ORDER.filter(
      (slug) => !configured.includes(slug) && showHome(slug),
    );
    return [...configured, ...missing];
  })();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [sales, setSales] = useState<PaymentRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  const refreshMetrics = useCallback(async () => {
    const m = await loadMetrics().catch(() => null);
    if (m) setMetrics(m);
  }, []);

  const refreshSales = useCallback(async () => {
    const { data } = await supabase
      .from("payment_transactions")
      .select("id,cliente_nome,valor,status,created_at,metodo,gateway_slug")
      .order("created_at", { ascending: false })
      .limit(6);
    setSales((data as PaymentRow[]) ?? []);
  }, []);

  const refreshActivity = useCallback(async () => {
    const { data } = await supabase
      .from("access_logs")
      .select("id,event,created_at,metadata")
      .order("created_at", { ascending: false })
      .limit(8);
    setActivity((data as ActivityRow[]) ?? []);
  }, []);

  useEffect(() => {
    refreshMetrics();
    refreshSales();
    refreshActivity();

    const ch = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_transactions" },
        () => {
          refreshMetrics();
          refreshSales();
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () =>
        refreshMetrics(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "access_logs" }, () =>
        refreshActivity(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [refreshMetrics, refreshSales, refreshActivity]);

  const kpis: Kpi[] = [
    {
      label: "Receita Total",
      value: metrics ? brl(metrics.receitaTotal) : "—",
      icon: DollarSign,
      color: "var(--brand-blue)",
      sparkline: metrics?.receitaSpark ?? [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Novos Clientes",
      value: metrics ? metrics.novosClientes.toLocaleString("pt-BR") : "—",
      icon: Users,
      color: "var(--brand-cyan)",
      sparkline: metrics?.clientesSpark ?? [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Conversão",
      value: metrics ? `${metrics.conversao.toFixed(1)}%` : "—",
      icon: Target,
      color: "var(--brand-violet)",
      sparkline: metrics?.conversaoSpark ?? [0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: "Tickets Abertos",
      value: metrics ? String(metrics.ticketsAbertos) : "—",
      icon: MessageSquare,
      color: "var(--brand-magenta)",
      sparkline: metrics?.ticketsSpark ?? [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  if (!metrics) return null;

  return (
    <PageContainer className="space-y-6 pb-24">
      {/* Dashboard Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="section-title-bar" />
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
               Visão <span className="text-brand-cyan">Geral</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <ChevronRight className="size-3 text-brand-blue" />
            Home / Visão Geral / <span className="text-brand-blue">Dashboard</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="h-11 px-6 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95">
             Últimos 30 dias <ChevronDown className="size-4 opacity-40" />
          </button>
          <button className="h-11 px-8 rounded-xl bg-brand-blue text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-blue/30 hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
            Relatório PDF
          </button>
        </div>
      </header>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-strong p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-brand-blue/30 transition-all duration-300">
             <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
             
             <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{kpi.label}</span>
                <div className={cn("size-8 rounded-xl grid place-items-center bg-white/5")}>
                   <kpi.icon className={cn("size-4", kpi.color === "var(--brand-blue)" ? "text-brand-blue" : kpi.color === "var(--brand-cyan)" ? "text-brand-cyan" : kpi.color === "var(--brand-violet)" ? "text-brand-violet" : "text-brand-magenta")} />
                </div>
             </div>

             <div className="flex items-end justify-between relative z-10">
                <div className="space-y-0.5">
                   <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-brand-emerald">+12.5%</span>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">vs mês anterior</span>
                   </div>
                </div>
                <div className="w-20 h-8 opacity-40 group-hover:opacity-80 transition-opacity">
                   <Sparkline data={kpi.sparkline} color={kpi.color === "var(--brand-blue)" ? "#145BFF" : kpi.color === "var(--brand-cyan)" ? "#00C8FF" : kpi.color === "var(--brand-violet)" ? "#7A00FF" : "#D600FF"} />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <div className="xl:col-span-2 glass-strong rounded-3xl border border-white/5 p-6 space-y-6">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Fluxo de Receita</h3>
                 <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Análise de vendas semanais</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-brand-blue" />
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Aprovadas</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-white/10" />
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Pendentes</span>
                 </div>
              </div>
           </div>

           <div className="h-[280px] w-full mt-4">
              <BigChart days={metrics.chartDays} values={metrics.chartValues} />
           </div>
        </div>

        {/* Sidebar Contextual do Dashboard */}
        <div className="space-y-6">
           <div className="glass-strong rounded-3xl border border-white/5 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Atividades Recentes</h3>
              <div className="space-y-5">
                 {activity.slice(0, 5).map((act) => {
                    const info = eventInfo(act.event);
                    return (
                       <div key={act.id} className="flex gap-4 group">
                          <div className="relative">
                          <div className={cn("size-9 rounded-xl grid place-items-center bg-white/5 relative z-10 border border-white/5 group-hover:border-white/10 transition-colors")}>
                                <info.icon className="size-4" style={{ color: info.color }} />
                             </div>
                             {/* Linha conectora — simplificada */}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 py-1">
                             <p className="text-xs font-bold text-white leading-snug truncate">{info.label}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                   {new Date(act.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {act.metadata && typeof act.metadata === 'object' && 'email' in act.metadata && (
                                   <span className="text-[10px] font-bold text-brand-blue/60 truncate max-w-[120px]">
                                      {String(act.metadata.email)}
                                   </span>
                                )}
                             </div>
                          </div>
                       </div>
                    );
                 })}
                 <button className="w-full py-3 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                    Ver todo histórico
                 </button>
              </div>
           </div>

           <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-brand-violet p-6 shadow-2xl shadow-brand-blue/20">
              <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                 <Target className="size-24 text-white" />
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Meta Mensal</h4>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Faltam R$ 12.400,00</p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white rounded-full" style={{ width: "65%" }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/80">
                       <span>65% Concluído</span>
                       <span>Alvo: R$ 50k</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PageContainer>
  );
}



function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border/40 bg-surface/40 p-6 transition-all duration-300 hover:bg-surface/60 hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {kpi.label}
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">
            {kpi.value}
          </p>
        </div>
        <div className="shrink-0 size-11 grid place-items-center rounded-2xl bg-surface border border-border/40 group-hover:border-primary/30 group-hover:text-primary transition-colors">
          <Icon className="size-5" strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              +12% <span className="opacity-50 font-normal">vs mês ant.</span>
           </span>
           <span className="text-[10px] font-medium text-muted-foreground/60">Últimos 7 dias</span>
        </div>
        <div className="flex-1 h-12 max-w-[120px]">
           <Sparkline data={kpi.sparkline} color={kpi.color} />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-glow" />
    </div>
  );
}

function ActivityCard({ items }: { items: ActivityRow[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Atividade em Tempo Real</h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{
              background: "var(--brand-emerald)",
              boxShadow: "0 0 8px color-mix(in oklab, var(--brand-emerald) 80%, transparent)",
            }}
          />
          Ao vivo
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma atividade registrada ainda.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => {
            const info = eventInfo(a.event);
            const Icon = info.icon;
            return (
              <li key={a.id} className="flex items-center gap-3">
                <span
                  className="icon-tile size-9 shrink-0"
                  style={{ ["--tile-color" as never]: info.color }}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{info.label}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function statusStyle(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s === "aprovado") return { label: "Aprovado", color: "var(--brand-emerald)" };
  if (s === "pendente" || s === "aguardando")
    return { label: "Pendente", color: "var(--brand-orange)" };
  if (s === "recusado" || s === "rejeitado")
    return { label: "Recusado", color: "var(--brand-magenta)" };
  if (s === "reembolsado") return { label: "Reembolsado", color: "var(--brand-blue)" };
  return { label: status ?? "—", color: "var(--brand-violet)" };
}

function RecentSalesCard({ sales }: { sales: PaymentRow[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Últimas Vendas</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{
              background: "var(--brand-blue)",
              boxShadow: "0 0 8px color-mix(in oklab, var(--brand-blue) 80%, transparent)",
            }}
          />
          Tempo real
        </span>
      </div>
      {sales.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma venda registrada ainda.</p>
      ) : (
        <ul className="space-y-3">
          {sales.map((s) => {
            const st = statusStyle(s.status);
            const produto = s.metodo || s.gateway_slug || "Venda";
            return (
              <li key={s.id} className="flex items-center gap-3">
                <span
                  className="icon-tile size-9 shrink-0"
                  style={{ ["--tile-color" as never]: st.color }}
                >
                  <DollarSign className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.cliente_nome ?? "Cliente"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {produto} · {timeAgo(s.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{brl(Number(s.valor ?? 0))}</p>
                  <p className="text-[10px] font-medium" style={{ color: st.color }}>
                    {st.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChartCard({ days, values }: { days: string[]; values: number[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Visão Geral</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground/80 hover:text-foreground"
        >
          Últimos 7 dias
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <BigChart days={days} values={values} />
    </div>
  );
}

function BigChart({ days, values }: { days: string[]; values: number[] }) {
  // Fallbacks determinísticos: SSR e cliente devem renderizar o mesmo texto.
  // Enquanto `days` estiver vazio, mostramos placeholders neutros ("—") em vez
  // de datas derivadas de `new Date()` (que divergem entre servidor e cliente).
  const fallbackDays = days.length ? days : ["—", "—", "—", "—", "—", "—", "—"];
  const fallbackValues = values.length ? values : [0, 0, 0, 0, 0, 0, 0];

  const w = 700;
  const h = 240;
  const padX = 28;
  const padY = 18;
  const rawMax = Math.max(...fallbackValues, 1);
  const max = rawMax * 1.15;
  const stepX = (w - padX * 2) / (fallbackValues.length - 1 || 1);
  const points = fallbackValues.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - padY - (v / max) * (h - padY * 2);
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i, arr) => {
      if (i === 0) return `M ${x},${y}`;
      const [px, py] = arr[i - 1];
      const cx = (px + x) / 2;
      return `C ${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(" ");
  const area = `${path} L ${w - padX},${h - padY} L ${padX},${h - padY} Z`;

  const maxIdx = fallbackValues.reduce((best, v, i) => (v > fallbackValues[best] ? i : best), 0);
  const [hx, hy] = points[maxIdx];
  const yLabels = [0, 0.5, 1];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-56 w-full md:h-64"
        aria-hidden
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-magenta)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-magenta)" />
            <stop offset="100%" stopColor="var(--brand-orange)" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((r) => {
          const y = padY + r * (h - padY * 2);
          return (
            <line
              key={r}
              x1={padX}
              x2={w - padX}
              y1={y}
              y2={y}
              stroke="oklch(1 0 0 / 6%)"
              strokeDasharray="3 6"
            />
          );
        })}

        {yLabels.map((r) => {
          const y = padY + (1 - r) * (h - padY * 2);
          const val = max * r;
          const label = val >= 1000 ? `${Math.round(val / 100) / 10}k` : `${Math.round(val)}`;
          return (
            <text
              key={r}
              x={4}
              y={y + 3}
              fill="oklch(0.7 0.02 20 / 70%)"
              fontSize="10"
              fontFamily="Inter Variable, sans-serif"
            >
              {label}
            </text>
          );
        })}

        <path d={area} fill="url(#chart-area)" />
        <path
          d={path}
          fill="none"
          stroke="url(#chart-line)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-glow-warm"
        />

        {fallbackValues[maxIdx] > 0 && (
          <>
            <line
              x1={hx}
              x2={hx}
              y1={hy}
              y2={h - padY}
              stroke="color-mix(in oklab, var(--brand-magenta) 60%, transparent)"
              strokeDasharray="2 4"
            />
            <circle
              cx={hx}
              cy={hy}
              r={12}
              fill="color-mix(in oklab, var(--brand-magenta) 25%, transparent)"
            />
            <circle cx={hx} cy={hy} r={5} fill="var(--brand-magenta)" />
            <circle cx={hx} cy={hy} r={2.2} fill="white" />
          </>
        )}

        {fallbackDays.map((d, i) => (
          <text
            key={d + i}
            x={points[i][0]}
            y={h - 2}
            textAnchor="middle"
            fill="oklch(0.7 0.02 20 / 70%)"
            fontSize="10"
            fontFamily="Inter Variable, sans-serif"
          >
            {d}
          </text>
        ))}
      </svg>

      {fallbackValues[maxIdx] > 0 && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border border-border/70 bg-surface-elevated/90 px-3 py-1.5 text-center text-xs shadow-lg backdrop-blur-xl"
          style={{
            left: `${(hx / w) * 100}%`,
            top: `${(hy / h) * 100}%`,
          }}
        >
          <div className="font-semibold">{brl(fallbackValues[maxIdx])}</div>
          <div className="text-[10px] text-muted-foreground">{fallbackDays[maxIdx]}</div>
        </div>
      )}
    </div>
  );
}

function Sparkline({
  data,
  color,
  className,
}: {
  data: number[];
  color: string;
  className?: string;
}) {
  const w = 300;
  const h = 60;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const stepX = w / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  // useId → id estável entre SSR e cliente (evita hydration mismatch)
  const rid = useId();
  const gid = `spark-${rid.replace(/[:]/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-14 w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 6px color-mix(in oklab, ${color} 65%, transparent))`,
        }}
      />
    </svg>
  );
}
