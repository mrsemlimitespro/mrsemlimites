import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resources } from "@/lib/admin/resources";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Painel
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text-warm">Visão geral</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie tudo do MR Lova em um só lugar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => (
          <ResourceCard key={r.key} resourceKey={r.key} table={r.table} label={r.label} Icon={r.icon} />
        ))}
      </div>
    </div>
  );
}

function ResourceCard({
  resourceKey,
  table,
  label,
  Icon,
}: {
  resourceKey: string;
  table: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const { data } = useQuery({
    queryKey: ["admin-count", table],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from(table)
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  return (
    <Link
      to="/admin/$resource"
      params={{ resource: resourceKey }}
      className="glass group relative flex items-center justify-between overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white/5">
          <Icon className="size-5 text-foreground/80" strokeWidth={2} />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tracking-tight">{data ?? "—"}</div>
        </div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
