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
  UserPlus,
  CreditCard,
  MessageCircle,
  FileText,
  MoreHorizontal,
  Layers,
  Smartphone,
  LineChart,
  Cable,
  ChevronDown,
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
    color: "var(--brand-violet)",
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
    color: "var(--brand-magenta)",
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

type Activity = { label: string; time: string; icon: IconType; color: string };
const activities: Activity[] = [
  { label: "Novo usuário registrado", time: "há 2 min", icon: UserPlus, color: "var(--brand-emerald)" },
  { label: "Pagamento aprovado", time: "há 5 min", icon: CreditCard, color: "var(--brand-blue)" },
  { label: "Novo ticket criado", time: "há 7 min", icon: MessageCircle, color: "var(--brand-magenta)" },
  { label: "Relatório gerado", time: "há 10 min", icon: FileText, color: "var(--brand-violet)" },
];

type Project = { label: string; sub: string; icon: IconType; color: string };
const projects: Project[] = [
  { label: "Landing Page Nova", sub: "Atualizado há 2h", icon: Layers, color: "var(--brand-magenta)" },
  { label: "App Mobile v2", sub: "Atualizado há 4h", icon: Smartphone, color: "var(--brand-blue)" },
  { label: "Dashboard Analytics", sub: "Atualizado há 6h", icon: LineChart, color: "var(--brand-emerald)" },
  { label: "Integração API", sub: "Atualizado há 1d", icon: Cable, color: "var(--brand-orange)" },
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
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-32">
      {/* Hero */}
      <section className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            <span className="gradient-text-warm">Olá, Lucas!</span>{" "}
            <span aria-hidden>👋</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Aqui está o que está acontecendo no seu universo hoje.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
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
      </section>

      {/* 4 KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      {/* Bottom 3-column row */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
        <ActivityCard />
        <ChartCard />
        <ProjectsCard />
      </section>

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

function ActivityCard() {
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
      <ul className="space-y-3">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <li key={a.label} className="flex items-center gap-3">
              <span
                className="icon-tile size-9 shrink-0"
                style={{ ["--tile-color" as never]: a.color }}
              >
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProjectsCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Projetos Recentes</h3>
        <button className="rounded-full border border-border/70 bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground/80 hover:text-foreground">
          Ver todos
        </button>
      </div>
      <ul className="space-y-3">
        {projects.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.label} className="flex items-center gap-3">
              <span
                className="icon-tile size-9 shrink-0"
                style={{ ["--tile-color" as never]: p.color }}
              >
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.sub}</p>
              </div>
              <button
                type="button"
                aria-label="Mais"
                className="grid size-7 place-items-center rounded-full text-muted-foreground/70 hover:bg-white/5 hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChartCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Visão Geral</h3>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground/80 hover:text-foreground">
          Últimos 7 dias
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <BigChart />
    </div>
  );
}

function BigChart() {
  const days = ["16 Mai", "17 Mai", "18 Mai", "19 Mai", "20 Mai", "21 Mai", "22 Mai"];
  const values = [4200, 3400, 6800, 5200, 12430, 9600, 13800];
  const w = 700;
  const h = 240;
  const padX = 28;
  const padY = 18;
  const max = 15000;
  const min = 0;
  const stepX = (w - padX * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - padY - ((v - min) / (max - min)) * (h - padY * 2);
    return [x, y] as const;
  });
  // smooth curve
  const path = points
    .map(([x, y], i, arr) => {
      if (i === 0) return `M ${x},${y}`;
      const [px, py] = arr[i - 1];
      const cx = (px + x) / 2;
      return `C ${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(" ");
  const area = `${path} L ${w - padX},${h - padY} L ${padX},${h - padY} Z`;

  const highlightIdx = 4;
  const [hx, hy] = points[highlightIdx];

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

        {/* gridlines */}
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

        {/* y labels */}
        {[
          [0, "0"],
          [0.66, "5k"],
          [0.33, "10k"],
          [0, "15k"],
        ]
          .slice(0, 4)
          .map(([, ]) => null)}
        {[
          { y: h - padY, label: "0" },
          { y: padY + 0.66 * (h - padY * 2), label: "5k" },
          { y: padY + 0.33 * (h - padY * 2), label: "10k" },
          { y: padY, label: "15k" },
        ].map((t) => (
          <text
            key={t.label}
            x={4}
            y={t.y + 3}
            fill="oklch(0.7 0.02 20 / 70%)"
            fontSize="10"
            fontFamily="Inter Variable, sans-serif"
          >
            {t.label}
          </text>
        ))}

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

        {/* highlight point */}
        <line
          x1={hx}
          x2={hx}
          y1={hy}
          y2={h - padY}
          stroke="color-mix(in oklab, var(--brand-magenta) 60%, transparent)"
          strokeDasharray="2 4"
        />
        <circle cx={hx} cy={hy} r={12} fill="color-mix(in oklab, var(--brand-magenta) 25%, transparent)" />
        <circle cx={hx} cy={hy} r={5} fill="var(--brand-magenta)" />
        <circle cx={hx} cy={hy} r={2.2} fill="white" />

        {/* x labels */}
        {days.map((d, i) => (
          <text
            key={d}
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

      {/* Tooltip */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border border-border/70 bg-surface-elevated/90 px-3 py-1.5 text-center text-xs shadow-lg backdrop-blur-xl"
        style={{
          left: `${(hx / w) * 100}%`,
          top: `${(hy / h) * 100}%`,
        }}
      >
        <div className="font-semibold">R$ 12.430</div>
        <div className="text-[10px] text-muted-foreground">20 Maio</div>
      </div>
    </div>
  );
}

function OrbVisual() {
  return (
    <div className="relative size-40 shrink-0 md:size-52">
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
          boxShadow: "0 0 24px color-mix(in oklab, var(--brand-cyan) 60%, transparent)",
        }}
      />
      <div aria-hidden className="absolute left-[10%] top-[8%] size-1 rounded-full bg-white" style={{ boxShadow: "0 0 8px white" }} />
      <div aria-hidden className="absolute right-[14%] top-[24%] size-1.5 rounded-full bg-white" style={{ boxShadow: "0 0 10px white" }} />
      <div aria-hidden className="absolute right-[6%] bottom-[18%] size-1 rounded-full bg-white" style={{ boxShadow: "0 0 8px white" }} />
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
