import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";
import { proxyLovableCommand } from "@/lib/ext-v17/lovable.server";

export const Route = createFileRoute("/api/public/ext-v17/send-command")({
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

        const authResult = await validateExtensionLicense(body, ip, request.headers.get("user-agent"), "/send-command");
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        const { projectId, token, payload } = body;
        if (!projectId || !token || !payload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_params" }), { status: 400, headers: cors });
        }

        try {
          // send-command-v8 geralmente é um alias para operações de edição no endpoint /chat
          const lovableResp = await proxyLovableCommand(projectId, token, payload);
          const resultText = await lovableResp.text();
          
          let resultJson: any;
          try {
            resultJson = JSON.parse(resultText);
          } catch {
            resultJson = { message: resultText };
          }

          return new Response(JSON.stringify({
            ...resultJson,
            ok: lovableResp.ok,
            status: lovableResp.status
          }), { status: lovableResp.status, headers: cors });
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "command_proxy_failed", details: err.message }), { status: 502, headers: cors });
        }
      }
    }
  }
});
