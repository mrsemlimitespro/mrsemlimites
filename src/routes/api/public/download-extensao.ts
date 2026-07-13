import { createFileRoute } from "@tanstack/react-router";

const ASSET_URL =
  "https://mrsemlimites.lovable.app/__l5e/assets-v1/7b13cd6c-397e-47a9-8022-5073493966ac/mr-lov-2.2.zip";

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
