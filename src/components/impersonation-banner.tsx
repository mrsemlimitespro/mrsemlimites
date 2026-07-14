import { useNavigate } from "@tanstack/react-router";
import { Eye, ArrowLeft } from "lucide-react";

import { useImpersonation } from "@/hooks/useImpersonation";
import { clearImpersonation } from "@/lib/impersonation";
import { cn } from "@/lib/utils";

/**
 * Barra fixa no topo mostrada apenas quando o Admin está no
 * "Modo Visualização" (impersonando um Revendedor ou Cliente).
 *
 * Não altera sessão nem role — apenas informa visualmente que a página
 * está sendo vista como somente-leitura e oferece um botão para voltar
 * exatamente para a URL de origem no /admin (com filtros e paginação).
 */
export function ImpersonationBanner() {
  const state = useImpersonation();
  const navigate = useNavigate();

  if (!state) return null;

  const kindLabel = state.kind === "revendedor" ? "Painel do Revendedor" : "Painel do Cliente";

  return (
    <>
      {/* Spacer: empurra o conteúdo para baixo enquanto a barra fixa estiver visível */}
      <div aria-hidden className="h-14 w-full md:h-12" />
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full border-b border-amber-400/30",
        "backdrop-blur-xl",
      )}
      style={{
        background:
          "linear-gradient(90deg, color-mix(in oklab, var(--brand-orange) 30%, transparent), color-mix(in oklab, var(--brand-magenta) 30%, transparent))",
        boxShadow: "0 4px 24px -8px color-mix(in oklab, var(--brand-orange) 60%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs md:text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-black/40 text-amber-200">
            <Eye className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold">
              <span className="uppercase tracking-widest text-[10px] text-amber-200/90">
                Visualizando
              </span>
              <span>{kindLabel}</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-amber-100/80">
                Somente leitura
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px] text-white/90 md:text-xs">
              <span className="font-medium">{state.name || "—"}</span>
              {state.email ? (
                <>
                  <span className="mx-1.5 opacity-50">·</span>
                  <span className="opacity-90">{state.email}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const returnTo = state.returnTo || "/admin";
            clearImpersonation();
            navigate({ to: returnTo });
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/70"
        >
          <ArrowLeft className="size-3.5" /> Voltar para Administração
        </button>
      </div>
    </div>
  );
}
