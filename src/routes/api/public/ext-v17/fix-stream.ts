import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

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

        const authResult = await validateExtensionLicense(body);
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        return new Response(JSON.stringify({ 
          ok: false, 
          error: "fix_stream_not_implemented",
          reason: "Correção de stream v1 requer integração direta com o estado da sessão Lovable."
        }), { status: 501, headers: cors });
      }
    }
  }
});
