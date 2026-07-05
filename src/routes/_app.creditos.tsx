import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos — MR Lova" },
      { name: "description", content: "Créditos no MR Lova." },
    ],
  }),
  component: CreditosPage,
});

function CreditosPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Créditos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Envie o print desta tela para eu reconstruí-la fielmente.
      </p>
    </div>
  );
}
