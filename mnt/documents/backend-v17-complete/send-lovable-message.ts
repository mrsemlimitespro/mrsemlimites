import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, validateExtensionLicense } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/send-lovable-message")({
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

        const authResult = await validateExtensionLicense(body, null, null, "/send-lovable-message");
        if (!authResult.ok) return new Response(JSON.stringify(authResult), { status: 403, headers: cors });

        const { projectId, token, lastPayload } = body;
        const { proxyLovableChat } = await import("@/lib/ext-v17/lovable.server");
        const resp = await proxyLovableChat(projectId, token, lastPayload || body);
        const data = await resp.json();

        return new Response(JSON.stringify({ ...data, ok: resp.ok }), { status: resp.status, headers: cors });
      }
    }
  }
});
