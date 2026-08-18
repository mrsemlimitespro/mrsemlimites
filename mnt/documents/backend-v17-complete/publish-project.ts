import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, validateExtensionLicense } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/publish-project")({
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

        const authResult = await validateExtensionLicense(body, null, null, "/publish-project");
        if (!authResult.ok) return new Response(JSON.stringify(authResult), { status: 403, headers: cors });

        const { projectId, token } = body;
        if (!projectId || !token) return new Response(JSON.stringify({ ok: false, error: "missing_id" }), { status: 400, headers: cors });

        const resp = await fetch(`https://api.lovable.dev/projects/${projectId}/publish`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
          }
        });

        const data = await resp.json();
        return new Response(JSON.stringify({ ...data, ok: resp.ok }), { status: resp.status, headers: cors });
      }
    }
  }
});
