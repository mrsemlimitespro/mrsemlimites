import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/download-extensao")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = `${url.origin}/mr-sem-limites-2.2.zip`;
        const upstream = await fetch(target);
        if (!upstream.ok || !upstream.body) {
          return new Response("Falha ao obter extensão", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="mr-sem-limites-2.2.zip"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
