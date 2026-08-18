import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

/**
 * fix-stream-v1: Alias para compatibilidade de stream
 * Em alguns casos a extensão perde o contexto do stream e tenta reconectar.
 */
export const Route = createFileRoute("/api/public/ext-v17/fix-stream")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), { status: 400, headers: cors });
        }

        const authResult = await validateExtensionLicense(body, null, null, "/fix-stream");
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        // Simula uma resposta de conclusão se o stream original sumiu
        return new Response(JSON.stringify({ 
          ok: true, 
          status: "stream_fixed",
          message: "Stream context restored (simulated)" 
        }), { status: 200, headers: cors });
      }
    }
  }
});
