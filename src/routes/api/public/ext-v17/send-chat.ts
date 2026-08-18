import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";
import { proxyLovableChat } from "@/lib/ext-v17/lovable.server";

export const Route = createFileRoute("/api/public/ext-v17/send-chat")({
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

        // 1. Validar Licença
        const licenseResult = await validateExtensionLicense(body);
        if (!licenseResult.ok) {
          return new Response(JSON.stringify(licenseResult), { status: 403, headers: cors });
        }

        // 2. Extrair dados do Lovable
        const { projectId, token, lastPayload } = body;
        
        if (!projectId || !token || !lastPayload) {
          return new Response(JSON.stringify({ ok: false, error: "missing_lovable_params" }), { status: 400, headers: cors });
        }

        // 3. Regra estrita ai_message_id
        if (lastPayload.ai_message_id === undefined) {
          // A instrução diz que se for exigido e não existir, retorna 400.
          // O motor original costuma enviar, mas se vier vazio bloqueamos para evitar erro no Lovable.
          return new Response(JSON.stringify({ ok: false, error: "missing_original_ai_message_id" }), { status: 400, headers: cors });
        }

        // 4. Proxying
        try {
          const lovableResp = await proxyLovableChat(projectId, token, lastPayload);
          const status = lovableResp.status;
          const resultText = await lovableResp.text();
          
          let resultJson: any;
          try {
            resultJson = JSON.parse(resultText);
          } catch {
            resultJson = { message: resultText };
          }

          return new Response(JSON.stringify({
            ...resultJson,
            ok: status >= 200 && status < 300,
            status: status
          }), { status, headers: cors });

        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "proxy_error", details: err.message }), { status: 502, headers: cors });
        }
      },
    },
  },
});
