import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";
import { proxyLovableStream } from "@/lib/ext-v17/lovable.server";

export const Route = createFileRoute("/api/public/ext-v17/fix-stream")({
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

        const authResult = await validateExtensionLicense(body, ip, request.headers.get("user-agent"), "/fix-stream");
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        const motorPayload = body.lastPayload ?? body.payload ?? body;
        const projectId = body.projectId || body.project_id;
        const token = body.token || body.Authorization || request.headers.get("Authorization");

        if (!projectId || !token || !motorPayload) {
          return new Response(JSON.stringify({ ok: false, error: "insufficient_context_for_fix" }), { status: 400, headers: cors });
        }

        try {
          // Implementação REAL: tenta reestabelecer a conexão com o Lovable
          const lovableResp = await proxyLovableStream(projectId, token, motorPayload, "chat");
          
          if (!lovableResp.ok) {
            const errorText = await lovableResp.text();
            return new Response(errorText, { status: lovableResp.status, headers: cors });
          }

          const respHeaders = { ...cors };
          const lovContentType = lovableResp.headers.get("content-type");
          if (lovContentType) respHeaders["Content-Type"] = lovContentType;

          // Repassa o stream real
          return new Response(lovableResp.body, { 
            status: lovableResp.status, 
            headers: respHeaders 
          });

        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "fix_stream_failed", details: err.message }), { status: 502, headers: cors });
        }
      }
    }
  }
});
