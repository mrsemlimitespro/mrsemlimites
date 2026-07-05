import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MR Lova" },
      { name: "description", content: "Painel principal do MR Lova." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return <PagePlaceholder title="Dashboard" />;
}

function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Envie o print desta tela para eu reconstruí-la fielmente.
      </p>
    </div>
  );
}
