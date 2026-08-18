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

        const projectId = body.projectId || body.project_id;
        const token = body.token || body.Authorization || request.headers.get("Authorization");
        
        // Priority mandatory: motorPayload = body.lastPayload ?? body.payload ?? body
        const motorPayload = body.lastPayload ?? body.payload ?? body;

        if (!projectId || !token || !motorPayload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_params", details: "projectId, token or payload missing" }), { status: 400, headers: cors });
        }

        try {
          // Encaminha uma única requisição real para o Lovable
          // v17 costuma usar /chat para a maioria dos comandos
          const lovableResp = await proxyLovableCommand(projectId, token, motorPayload, "chat");
          
          // Repassa headers relevantes (especialmente content-type para streams se houver)
          const respHeaders = { ...cors };
          const lovContentType = lovableResp.headers.get("content-type");
          if (lovContentType) respHeaders["Content-Type"] = lovContentType;

          // Se for stream, repassa o body diretamente
          if (lovContentType?.includes("text/event-stream")) {
            return new Response(lovableResp.body, { 
              status: lovableResp.status, 
              headers: respHeaders 
            });
          }

          const resultText = await lovableResp.text();
          return new Response(resultText, { 
            status: lovableResp.status, 
            headers: respHeaders 
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "command_proxy_failed", details: err.message }), { status: 502, headers: cors });
        }
      }
    }
  }
});
