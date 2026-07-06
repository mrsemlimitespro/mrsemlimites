import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_app/prompts")({
  head: () => ({
    meta: [
      { title: "Prompts — MR Lova" },
      { name: "description", content: "Biblioteca de prompts do MR Lova." },
    ],
  }),
  component: PromptsPage,
});

function PromptsPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-32">
      <section className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <span
            className="icon-tile size-12"
            style={{ ["--tile-color" as never]: "var(--brand-violet)" }}
          >
            <MessageSquare className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Prompts</h1>
            <p className="text-sm text-muted-foreground">
              Sua biblioteca de prompts aparecerá aqui em breve.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
