import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        const ua = request.headers.get("user-agent");

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, valid: false, error: "invalid_payload" }), { status: 400, headers: cors });
        }

        const result = await validateExtensionLicense(body, ip, ua);
        
        if (!result.ok) {
          const status = result.status === "invalid_format" ? 400 : (result.status === "not_found" ? 401 : 403);
          return new Response(JSON.stringify(result), { status, headers: cors });
        }

        return new Response(JSON.stringify(result), { status: 200, headers: cors });
      },
    },
  },
});
