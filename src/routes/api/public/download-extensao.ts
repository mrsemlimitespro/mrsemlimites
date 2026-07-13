import { createFileRoute } from "@tanstack/react-router";
import latestExtensionAsset from "../../../../public/mr-sem-limites-2.2.2-runtime-fix.zip.asset.json";

export const Route = createFileRoute("/api/public/download-extensao")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = `${url.origin}${latestExtensionAsset.url}`;
        const upstream = await fetch(target);
        if (!upstream.ok || !upstream.body) {
          return new Response("Falha ao obter extensão", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="mr-sem-limites-2.2.2-runtime-fix.zip"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
