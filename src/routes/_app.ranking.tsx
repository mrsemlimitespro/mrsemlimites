import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, Medal, Trophy } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking semanal — MR Sem Limites" },
      { name: "description", content: "Ranking semanal real de vendas dos revendedores MR Sem Limites." },
      { property: "og:title", content: "Ranking semanal — MR Sem Limites" },
      { property: "og:description", content: "Desempenho semanal de vendas dos revendedores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RankingPage,
});

type RankingRow = {
  posicao: number;
  revendedor_id: string;
  nome: string;
  vendas: number;
  receita: number;
};

function RankingPage() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["ranking-revendedores-semanal"],
    queryFn: async () => {
      const { data: rows, error: queryError } = await (supabase as any).rpc(
        "ranking_revendedores_semanal",
      );
      if (queryError) throw queryError;
      return (rows ?? []) as RankingRow[];
    },
  });

  return (
    <PageContainer className="space-y-6 pb-32">
      <header>
        <div className="flex items-center gap-2">
          <div className="section-title-bar" />
          <h1 className="text-2xl font-black uppercase text-foreground">
            Ranking <span className="text-brand-yellow">semanal</span>
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Resultado das vendas aprovadas desde o início desta semana.
        </p>
      </header>

      <section className="glass-strong overflow-hidden rounded-2xl border border-border/50">
        {isLoading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">
            Não foi possível carregar o ranking.
          </div>
        ) : data.length === 0 ? (
          <div className="grid min-h-52 place-items-center px-6 text-center">
            <div>
              <BarChart3 className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-semibold">Nenhuma venda aprovada nesta semana.</p>
              <p className="mt-1 text-sm text-muted-foreground">O ranking será atualizado após a primeira venda.</p>
            </div>
          </div>
        ) : (
          <ol className="divide-y divide-border/50">
            {data.map((row) => (
              <li key={row.revendedor_id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-4 md:px-6">
                <div className={cn("grid size-9 place-items-center rounded-lg font-black", row.posicao <= 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                  {row.posicao === 1 ? <Trophy className="size-4" /> : row.posicao <= 3 ? <Medal className="size-4" /> : row.posicao}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{row.nome}</p>
                  <p className="text-xs text-muted-foreground">{row.vendas} venda(s) aprovada(s)</p>
                </div>
                <p className="text-right font-bold tabular-nums text-brand-emerald">
                  {Number(row.receita).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </PageContainer>
  );
}