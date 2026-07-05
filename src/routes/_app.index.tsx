import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  DollarSign,
  MessageSquare,
  MoreHorizontal,
  Target,
  UserPlus,
  Users,
  CreditCard,
  MessageCircle,
  FileText,
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
};

const kpis: Kpi[] = [
  {
    label: "Receita Total",
    value: "R$ 98.764,21",
    icon: DollarSign,
    trend: 12.5,
    trendDirection: "up",
    color: "var(--brand-magenta)",
  },
  {
    label: "Novos Clientes",
    value: "1.256",
    icon: Users,
    trend: 8.2,
    trendDirection: "up",
    color: "var(--brand-violet)",
  },
  {
    label: "Conversão",
    value: "24.8%",
    icon: Target,
    trend: 15.3,
    trendDirection: "up",
    color: "var(--brand-violet)",
  },
  {
    label: "Tickets Abertos",
    value: "32",
    icon: MessageSquare,
    trend: 4.1,
    trendDirection: "down",
    color: "var(--brand-violet)",
  },
];

const chartData = [
  { day: "16 Mai", value: 3200 },
  { day: "17 Mai", value: 8400 },
  { day: "18 Mai", value: 5200 },
  { day: "19 Mai", value: 9800 },
  { day: "20 Mai", value: 12430 },
  { day: "21 Mai", value: 10600 },
  { day: "22 Mai", value: 14200 },
];

type Activity = {
  title: string;
  time: string;
  icon: IconType;
  color: string;
};

const activities: Activity[] = [
  { title: "Novo usuário registrado", time: "há 2 min", icon: UserPlus, color: "var(--brand-magenta)" },
  { title: "Pagamento aprovado", time: "há 5 min", icon: CreditCard, color: "var(--brand-violet)" },
  { title: "Novo ticket criado", time: "há 7 min", icon: MessageCircle, color: "var(--brand-orange)" },
  { title: "Relatório gerado", time: "há 10 min", icon: FileText, color: "var(--brand-violet)" },
];

function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      {/* Hero */}
      <section className="pt-2">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Olá, Lucas! <span className="ml-1 align-middle text-3xl md:text-4xl">👋</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Aqui está o que está acontecendo hoje.
        </p>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      {/* Chart + Activity */}
      <section className="grid gap-4 xl:grid-cols-3">
        <PerformanceCard />
        <ActivityCard />
      </section>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const TrendIcon = kpi.trendDirection === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor =
    kpi.trendDirection === "up" ? "text-emerald-400" : "text-red-400";

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {kpi.label}
          </p>
        </div>
        <span
          className="icon-tile size-10 shrink-0"
          style={{ ["--tile-color" as never]: kpi.color }}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>

      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight md:text-[32px]">
          {kpi.value}
        </p>
        <div className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", trendColor)}>
          <TrendIcon className="size-3.5" strokeWidth={2.5} />
          <span>{kpi.trend.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 xl:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Desempenho Geral</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          Últimos 7 dias
          <ChevronDown className="size-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-5 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 24, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="perfStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--brand-magenta)" />
                <stop offset="100%" stopColor="var(--brand-orange)" />
              </linearGradient>
              <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-magenta)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--brand-magenta)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.72 0.03 20)", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.72 0.03 20)", fontSize: 12 }}
              tickFormatter={(v) => (v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`)}
              domain={[0, 15000]}
              ticks={[0, 5000, 10000, 15000]}
              width={44}
            />
            <ChartTooltip content={<PerfTooltip />} cursor={{ stroke: "var(--brand-magenta)", strokeWidth: 1, strokeOpacity: 0.4, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#perfStroke)"
              strokeWidth={2.5}
              fill="url(#perfFill)"
              activeDot={{ r: 5, fill: "var(--brand-magenta)", stroke: "white", strokeWidth: 2 }}
              style={{ filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--brand-magenta) 65%, transparent))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PerfTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-center">
      <p className="text-sm font-semibold tracking-tight">
        R$ {value.toLocaleString("pt-BR")}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Atividade Recente</h2>
      </div>

      <ul className="mt-4 space-y-1.5">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <li
              key={a.title}
              className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-white/5"
            >
              <span
                className="icon-tile size-10 shrink-0"
                style={{ ["--tile-color" as never]: a.color }}
              >
                <Icon className="size-[18px]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
              <button
                type="button"
                aria-label="Mais opções"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
