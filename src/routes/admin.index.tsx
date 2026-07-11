import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resources } from "@/lib/admin/resources";
import { ArrowRight, Star } from "lucide-react";
import { useModules, type SystemModule } from "@/lib/admin/use-modules";
import { ModuleIcon } from "@/components/admin/module-icon";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { modules, loaded, visibleIn } = useModules();

  // Fallback: sem dados ainda → usa apenas resources genéricos como antes
  const cards = loaded
    ? modules.filter((m) => m.ativo && m.mostrar_home && m.rota && m.slug !== "modulos" && m.slug !== "dashboard")
    : resources
        .filter((r) => visibleIn("home", r.key))
        .map(
          (r) =>
            ({
              slug: r.key,
              nome: r.label,
              icone: "Package",
              rota: `/admin/${r.key}`,
              favorito: false,
              cor: null,
              // hint para render legado
              _resourceKey: r.key,
              _table: r.table,
            }) as unknown as SystemModule & { _resourceKey?: string; _table?: string },
        );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="space-y-1">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Painel</div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text-warm">Visão geral</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie tudo do MR Lova em um só lugar. {loaded ? `${cards.length} módulos ativos.` : null}
        </p>
      </header>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {cards.map((m) => (
          <ModuleCard key={m.slug} module={m} />
        ))}
      </div>
    </div>
  );
}

const RESOURCE_TABLES = new Map(resources.map((r) => [r.key, r.table]));

function ModuleCard({ module: m }: { module: SystemModule }) {
  const table = RESOURCE_TABLES.get(m.slug);
  const { data } = useQuery({
    queryKey: ["admin-count", table ?? m.slug],
    enabled: !!table,
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from(table as string)
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });

  const to = m.rota ?? "/admin";

  return (
    <Link
      to={to as never}
      className="glass group relative flex items-center justify-between overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={m.cor ? { boxShadow: `0 0 30px -12px ${m.cor}` } : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5"
          style={m.cor ? { background: `color-mix(in oklab, ${m.cor} 25%, transparent)` } : undefined}
        >
          <ModuleIcon name={m.icone} className="size-5 text-foreground/80" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
            {m.favorito && <Star className="size-3 fill-yellow-400 text-yellow-400" />}
            <span className="truncate">{m.nome}</span>
          </div>
          <div className="text-2xl font-semibold tracking-tight">{table ? (data ?? "—") : ""}</div>
        </div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
