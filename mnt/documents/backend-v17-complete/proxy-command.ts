import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, validateExtensionLicense } from "@/lib/ext-v17/auth.server";

// Rota genérica para comandos de proxy extras do motor v17.0
export const Route = createFileRoute("/api/public/ext-v17/proxy-command")({
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

        const authResult = await validateExtensionLicense(body, null, null, "/proxy-command");
        if (!authResult.ok) return new Response(JSON.stringify(authResult), { status: 403, headers: cors });

        // Implementação pass-through para o chat do Lovable (uso comum no v17)
        const { projectId, token, lastPayload } = body;
        if (!projectId || !token) return new Response(JSON.stringify({ ok: false, error: "missing_auth" }), { status: 400, headers: cors });

        const { proxyLovableChat } = await import("@/lib/ext-v17/lovable.server");
        const resp = await proxyLovableChat(projectId, token, lastPayload || body);
        const data = await resp.json();

        return new Response(JSON.stringify({ ...data, ok: resp.ok }), { status: resp.status, headers: cors });
      }
    }
  }
});
