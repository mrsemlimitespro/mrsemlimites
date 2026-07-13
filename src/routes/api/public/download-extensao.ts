import { createFileRoute } from "@tanstack/react-router";

const FILENAME = "mr-sem-limites-2.2.3.zip";

export const Route = createFileRoute("/api/public/download-extensao")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const upstream = await fetch(`${url.origin}/${FILENAME}`);
        if (!upstream.ok || !upstream.body) {
          return new Response("Falha ao obter extensão", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${FILENAME}"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
