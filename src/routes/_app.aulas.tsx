import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/aulas")({
  head: () => ({
    meta: [
      { title: "Aulas — MR Lova" },
      { name: "description", content: "Aulas no MR Lova." },
    ],
  }),
  component: AulasPage,
});

function AulasPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Aulas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Envie o print desta tela para eu reconstruí-la fielmente.
      </p>
    </div>
  );
}
