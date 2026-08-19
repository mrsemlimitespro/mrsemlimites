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
        
        const motorPayload = body.lastPayload ?? body.payload ?? body;

        if (!projectId || !token || !motorPayload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_params", details: "projectId, token or payload missing" }), { status: 400, headers: cors });
        }

        try {
          // Mapeamento dinâmico baseado no contrato v17 real do motor
          let endpoint = "chat";
          const type = motorPayload.type;
          
          if (type === "publish") endpoint = "publish";
          else if (type === "deploy") endpoint = "deploy";
          else if (type === "preview") endpoint = "preview";
          else if (type === "reset") endpoint = "reset";
          else if (type === "undo") endpoint = "undo";
          else if (type === "redo") endpoint = "redo";
          else if (type === "terminal_command") endpoint = "terminal";
          else if (type === "file_content") endpoint = "files";
          else if (type === "project_config") endpoint = "config";
          
          // Chamada ÚNICA ao upstream preservando motorPayload integralmente
          const lovableResp = await proxyLovableCommand(projectId, token, motorPayload, endpoint);
          
          const respHeaders = new Headers();
          Object.entries(cors).forEach(([k, v]) => respHeaders.set(k, v));
          
          const lovContentType = lovableResp.headers.get("content-type");
          if (lovContentType) respHeaders.set("Content-Type", lovContentType);

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
