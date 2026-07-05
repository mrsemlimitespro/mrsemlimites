import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — MR Lova" },
      { name: "description", content: "Gestão de clientes no MR Lova." },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Clientes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Envie o print desta tela para eu reconstruí-la fielmente.
      </p>
    </div>
  );
}
