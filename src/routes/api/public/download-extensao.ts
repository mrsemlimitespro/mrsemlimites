import { createFileRoute } from "@tanstack/react-router";

const ASSET_URL =
  "https://mrsemlimites.lovable.app/__l5e/assets-v1/4c7330de-0beb-4541-9824-ed60b2e56b04/mr-lov-2.2.zip";

export const Route = createFileRoute("/api/public/download-extensao")({
  server: {
    handlers: {
      GET: async () => {
        const upstream = await fetch(ASSET_URL);
        if (!upstream.ok || !upstream.body) {
          return new Response("Falha ao obter extensão", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="mr-lov-2.2.zip"',
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
