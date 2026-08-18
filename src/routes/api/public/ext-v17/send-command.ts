import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/send-command")({
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

        // Comandos especiais v8 (Edit/Apply)
        // Similar ao send-chat mas com endpoint /chat também ou específico se existir.
        // Mantemos isolado conforme instrução 4.
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "command_proxy_not_implemented",
          reason: "Fluxo de comando especial v8 requer mapeamento de endpoint adicional."
        }), { status: 501, headers: cors });
      }
    }
  }
});
