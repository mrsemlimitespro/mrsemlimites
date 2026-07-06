import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({
    meta: [
      { title: "Agents — MR Lova" },
      { name: "description", content: "Agentes de IA do MR Lova." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-32">
      <section className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <span
            className="icon-tile size-12"
            style={{ ["--tile-color" as never]: "var(--brand-blue)" }}
          >
            <Bot className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground">
              Seus agentes de IA aparecerão aqui em breve.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
