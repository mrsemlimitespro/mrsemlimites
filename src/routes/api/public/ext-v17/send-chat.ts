import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";
import { proxyLovableChat } from "@/lib/ext-v17/lovable.server";

export const Route = createFileRoute("/api/public/ext-v17/send-chat")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), { status: 400, headers: cors });
        }

        const licenseResult = await validateExtensionLicense(body, ip, request.headers.get("user-agent"), "/send-chat");
        if (!licenseResult.ok) {
          return new Response(JSON.stringify(licenseResult), { 
            status: licenseResult.status === "hwid_mismatch" ? 403 : 401, 
            headers: cors 
          });
        }

        const motorPayload = body.lastPayload ?? body.payload ?? body;
        const projectId = body.projectId || body.project_id;
        const token = body.token || body.Authorization || request.headers.get("Authorization");
        
        if (!projectId || !token || !motorPayload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_lovable_params" }), { status: 400, headers: cors });
        }

        try {
          const lovableResp = await proxyLovableChat(projectId, token, motorPayload);
          
          const respHeaders = new Headers();
          Object.entries(cors).forEach(([k, v]) => respHeaders.set(k, v));
          
          const contentType = lovableResp.headers.get("content-type");
          if (contentType) respHeaders.set("Content-Type", contentType);

          if (contentType?.includes("text/event-stream")) {
            respHeaders.set("Cache-Control", "no-cache");
            respHeaders.set("Connection", "keep-alive");
            return new Response(lovableResp.body, {
              status: lovableResp.status,
              headers: respHeaders
            });
          }

          const resultText = await lovableResp.text();
          return new Response(resultText, { status: lovableResp.status, headers: respHeaders });

        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "lovable_proxy_failed", details: err.message }), { status: 502, headers: cors });
        }
      },
    },
  },
});
