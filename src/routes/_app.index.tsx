import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  MessageSquare,
  Target,
  Users,
  Store,
  UserCircle2,
  Package,
  Coins,
  Plus,
  BarChart3,
  Link2,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
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
  trend: number;
  trendDirection: "up" | "down";
  color: string;
  sparkline: number[];
};

const kpis: Kpi[] = [
  {
    label: "Receita Total",
    value: "R$ 98.764,21",
    icon: DollarSign,
    trend: 12.5,
    trendDirection: "up",
    color: "var(--brand-magenta)",
    sparkline: [12, 18, 14, 22, 20, 28, 24, 32, 30, 38, 34, 44],
  },
  {
    label: "Novos Clientes",
    value: "1.256",
    icon: Users,
    trend: 8.2,
    trendDirection: "up",
    color: "var(--brand-blue)",
    sparkline: [22, 18, 26, 20, 30, 24, 34, 28, 38, 32, 40, 36],
  },
  {
    label: "Conversão",
    value: "24.8%",
    icon: Target,
    trend: 15.3,
    trendDirection: "up",
    color: "var(--brand-violet)",
    sparkline: [8, 14, 12, 18, 16, 22, 20, 26, 24, 30, 28, 34],
  },
  {
    label: "Tickets Abertos",
    value: "32",
    icon: MessageSquare,
    trend: 4.1,
    trendDirection: "down",
    color: "var(--brand-orange)",
    sparkline: [10, 18, 14, 22, 18, 26, 22, 30, 24, 32, 28, 34],
  },
];

type Quick = { label: string; icon: IconType };
const quickActions: Quick[] = [
  { label: "Criar projeto", icon: Plus },
  { label: "Gerar relatório", icon: BarChart3 },
  { label: "Conectar dados", icon: Link2 },
  { label: "Nova automação", icon: Zap },
];

type MenuItem = { label: string; icon: IconType };
const innerMenu: MenuItem[] = [
  { label: "Loja", icon: Store },
  { label: "Meus Clientes", icon: UserCircle2 },
  { label: "Meu Estoque", icon: Package },
  { label: "Créditos", icon: Coins },
];

function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 pb-32">
      {/* Banner principal */}
      <section className="relative overflow-hidden rounded-3xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 15% 30%, color-mix(in oklab, var(--brand-magenta) 35%, transparent) 0%, transparent 60%), radial-gradient(60% 60% at 85% 50%, color-mix(in oklab, var(--brand-violet) 45%, transparent) 0%, transparent 65%)",
          }}
        />
        <div className="relative flex flex-col-reverse items-start gap-8 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-12">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Olá, Lucas!{" "}
              <span className="ml-1 align-middle text-3xl md:text-4xl">👋</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Aqui está o que está acontecendo no seu universo hoje.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {quickActions.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.label}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-4 py-2 text-sm font-medium text-foreground/85 backdrop-blur-xl transition-all hover:border-primary/40 hover:text-foreground"
                  >
                    <Icon className="size-4" strokeWidth={2} />
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          <OrbVisual />
        </div>
      </section>

      {/* 4 Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      {/* Menu interno flutuante */}
      <InnerPillMenu />
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const trendColor =
    kpi.trendDirection === "up" ? "text-emerald-400" : "text-red-400";
  const arrow = kpi.trendDirection === "up" ? "↗" : "↘";

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
        <span
          className="icon-tile size-10 shrink-0"
          style={{ ["--tile-color" as never]: kpi.color }}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>

      <p className="mt-4 text-[28px] font-semibold tracking-tight md:text-[30px]">
        {kpi.value}
      </p>

      <div className={cn("mt-1 flex items-center gap-1.5 text-xs font-medium", trendColor)}>
        <span>{arrow}</span>
        <span>{kpi.trend.toFixed(1)}%</span>
        <span className="text-muted-foreground/80">vs mês passado</span>
      </div>

      <Sparkline data={kpi.sparkline} color={kpi.color} className="mt-4" />
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
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  const gid = `spark-${Math.random().toString(36).slice(2, 8)}`;

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

function OrbVisual() {
  return (
    <div className="relative size-40 shrink-0 md:size-56">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--brand-violet) 80%, white 10%) 0%, color-mix(in oklab, var(--brand-magenta) 70%, transparent) 45%, color-mix(in oklab, var(--brand-blue) 60%, transparent) 75%, transparent 100%)",
          filter: "blur(0.5px)",
          boxShadow:
            "0 0 60px -4px color-mix(in oklab, var(--brand-violet) 70%, transparent), inset -20px -30px 60px color-mix(in oklab, var(--brand-blue) 60%, transparent), inset 20px 20px 40px color-mix(in oklab, var(--brand-pink) 55%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[8%] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--brand-cyan) 70%, transparent) 30%, color-mix(in oklab, white 60%, transparent) 50%, color-mix(in oklab, var(--brand-magenta) 70%, transparent) 70%, transparent 100%)",
          filter: "blur(2px)",
          boxShadow:
            "0 0 24px color-mix(in oklab, var(--brand-cyan) 60%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-[10%] top-[8%] size-1 rounded-full bg-white"
        style={{ boxShadow: "0 0 8px white" }}
      />
      <div
        aria-hidden
        className="absolute right-[14%] top-[24%] size-1.5 rounded-full bg-white"
        style={{ boxShadow: "0 0 10px white" }}
      />
      <div
        aria-hidden
        className="absolute right-[6%] bottom-[18%] size-1 rounded-full bg-white"
        style={{ boxShadow: "0 0 8px white" }}
      />
    </div>
  );
}

function InnerPillMenu() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <nav
        aria-label="Menu interno do dashboard"
        className="pill-nav pointer-events-auto flex items-center gap-1 px-2 py-2"
      >
        {innerMenu.map((item, idx) => {
          const Icon = item.icon;
          const active = idx === 0;
          return (
            <button
              key={item.label}
              type="button"
              className={cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full gradient-primary"
                  style={{
                    boxShadow:
                      "0 0 24px -2px color-mix(in oklab, var(--primary) 80%, transparent)",
                  }}
                />
              )}
              <Icon className="relative z-10 size-4" strokeWidth={2} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
