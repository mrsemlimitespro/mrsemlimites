/**
 * Painel de contadores em tempo real — cada card mostra count(*) da tabela.
 * Substitui valores fixos por dados reais do banco. Não altera KPIs existentes,
 * apenas complementa o dashboard.
 */
import { useEffect, useState } from "react";
import {
  Users,
  KeyRound,
  Package,
  Sparkles,
  Percent,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Coins,
  UserCog,
  Megaphone,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { supabase } from "@/integrations/supabase/client";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Counter = {
  label: string;
  table: string;
  icon: IconType;
  color: string;
};

const COUNTERS: Counter[] = [
  { label: "Clientes",     table: "clientes",       icon: Users,      color: "var(--brand-blue)" },
  { label: "Licenças",     table: "licencas",       icon: KeyRound,   color: "var(--brand-emerald)" },
  { label: "Produtos",     table: "produtos",       icon: Package,    color: "var(--brand-orange)" },
  { label: "Planos",       table: "planos",         icon: Sparkles,   color: "var(--brand-violet)" },
  { label: "Promoções",    table: "promocoes",      icon: Percent,    color: "var(--brand-magenta)" },
  { label: "Banners",      table: "banners",        icon: LayoutGrid, color: "var(--brand-cyan)" },
  { label: "Propagandas",  table: "propagandas",    icon: Megaphone,  color: "var(--brand-orange)" },
  { label: "Imagens",      table: "imagens",        icon: ImageIcon,  color: "var(--brand-blue)" },
  { label: "Vídeos",       table: "videos",         icon: Video,      color: "var(--brand-magenta)" },
  { label: "Créditos",     table: "creditos_packs", icon: Coins,      color: "var(--brand-orange)" },
  { label: "Revendedores", table: "revendedores",   icon: UserCog,    color: "var(--brand-violet)" },
];

export function CountersPanel() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const results = await Promise.all(
        COUNTERS.map(async (c) => {
          const { count } = await (supabase as unknown as {
            from: (t: string) => { select: (c: string, o: { count: "exact"; head: true }) => Promise<{ count: number | null }> };
          })
            .from(c.table)
            .select("id", { count: "exact", head: true });
          return [c.table, count ?? 0] as const;
        }),
      );
      if (alive) setCounts(Object.fromEntries(results));
    };
    load();

    const ch = supabase.channel("counters-live");
    COUNTERS.forEach((c) => {
      ch.on("postgres_changes", { event: "*", schema: "public", table: c.table }, load);
    });
    ch.subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
      {COUNTERS.map((c) => {
        const Icon = c.icon;
        const value = counts[c.table];
        return (
          <div key={c.table} className="glass flex items-center gap-3 rounded-2xl p-3">
            <span
              className="icon-tile size-9 shrink-0"
              style={{ ["--tile-color" as never]: c.color }}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-tight">
                {value == null ? "—" : value.toLocaleString("pt-BR")}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
