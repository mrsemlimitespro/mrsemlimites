import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { AINovaDashboard } from "@/components/ai-modules/AINovaDashboard";
import { getAINovaStats } from "@/lib/ai-modules/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/packs")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Packs Premium — MR Sem Limites" },
      { name: "description", content: "Coleções premium com acesso vitalício." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PacksPage,
});

function useDisplayName() {
  const [name, setName] = useState<string>("você");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const md = (u.user_metadata ?? {}) as Record<string, unknown>;
      const candidate =
        (md.full_name as string) ||
        (md.name as string) ||
        (md.display_name as string) ||
        (u.email ? u.email.split("@")[0] : "");
      if (candidate) setName(candidate.split(" ")[0]);
    });
  }, []);
  return name;
}

function PacksPage() {
  const [view, setView] = useState<"dashboard" | "library">("dashboard");
  const userName = useDisplayName();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["ai-nova-stats", "packs"],
    queryFn: () => getAINovaStats({ data: { kind: "packs" } }),
    staleTime: 60_000,
  });

  return (
    <div className="w-full px-3 sm:px-6 py-5">
      {view === "dashboard" ? (
        <AINovaDashboard
          theme="packs"
          brand="Packs Premium"
          userName={userName}
          userOrg="MR SEM LIMITES"
          stats={stats}
          loading={isLoading}
          onOpenLibrary={() => setView("library")}
          onCreate={() => setView("library")}
        />
      ) : (
        <div data-ai-theme="packs" className="ai-module mx-auto max-w-[1280px]">
          <button
            onClick={() => setView("dashboard")}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/85 hover:bg-white/[0.08] transition"
          >
            ← Voltar ao Dashboard
          </button>
          <div className="relative overflow-hidden rounded-2xl border border-ai-300/20 bg-gradient-to-br from-ai-500/[0.06] via-black/40 to-ai-400/[0.04] p-10 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ai-500/30 to-ai-400/20 shadow-[0_0_30px_-8px_var(--ai-500)]">
              <Package className="h-7 w-7 text-ai-100" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Biblioteca em preparação</h2>
            <p className="mx-auto max-w-md text-sm text-white/55">
              A biblioteca de Packs Premium (grid, filtros, detalhe, download) será entregue na Fase 3.2 desta migração.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
