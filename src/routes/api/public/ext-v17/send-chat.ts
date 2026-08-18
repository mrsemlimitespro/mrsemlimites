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

        // 1. Validar Licença e Sessão
        const licenseResult = await validateExtensionLicense(body, ip, request.headers.get("user-agent"), "/send-chat");
        if (!licenseResult.ok) {
          return new Response(JSON.stringify(licenseResult), { 
            status: licenseResult.status === "hwid_mismatch" ? 403 : 401, 
            headers: cors 
          });
        }

        // 2. Extrair dados do Lovable
        const { projectId, token, lastPayload } = body;
        
        if (!projectId || !token || !lastPayload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_lovable_params" }), { status: 400, headers: cors });
        }

        // 3. Regra estrita ai_message_id (conforme contrato 2.5/2.6)
        if (lastPayload.ai_message_id === undefined) {
           return new Response(JSON.stringify({ ok: false, error: "ai_message_id_required" }), { status: 400, headers: cors });
        }

        // 4. Proxying real
        try {
          const lovableResp = await proxyLovableChat(projectId, token, lastPayload);
          
          // Preservar Stream ou Resposta JSON
          const contentType = lovableResp.headers.get("content-type");
          if (contentType?.includes("text/event-stream")) {
            return new Response(lovableResp.body, {
              status: lovableResp.status,
              headers: {
                ...cors,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
              }
            });
          }

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
          return new Response(JSON.stringify({ ok: false, error: "lovable_proxy_failed", details: err.message }), { status: 502, headers: cors });
        }
      },
    },
  },
});
