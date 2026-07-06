import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_app/packs")({
  head: () => ({
    meta: [
      { title: "Packs — MR Lova" },
      { name: "description", content: "Packs premium do MR Lova." },
    ],
  }),
  component: PacksPage,
});

function PacksPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-32">
      <section className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <span
            className="icon-tile size-12"
            style={{ ["--tile-color" as never]: "var(--brand-magenta)" }}
          >
            <Package className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Packs</h1>
            <p className="text-sm text-muted-foreground">
              Seus packs premium aparecerão aqui em breve.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
