import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/licencas")({
  head: () => ({
    meta: [
      { title: "Licenças — MR Lova" },
      { name: "description", content: "Gestão de licenças no MR Lova." },
    ],
  }),
  component: LicencasPage,
});

function LicencasPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Licenças</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Envie o print desta tela para eu reconstruí-la fielmente.
      </p>
    </div>
  );
}
