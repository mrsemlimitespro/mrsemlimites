import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, validateExtensionLicense } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/process-payment")({
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

        const authResult = await validateExtensionLicense(body, null, null, "/process-payment");
        
        // Verificação de resultado simulado vs real
        if (!authResult.license_key) {
           return new Response(JSON.stringify({ ok: false, error: "license_required" }), { status: 400, headers: cors });
        }

        // v17 motor espera redirect_required ou erro explícito
        return new Response(JSON.stringify({
          ok: true,
          status: "redirect_required",
          checkout_url: "https://mrsemlimites.lovable.app/loja",
          licenca_id: authResult.licenca_id,
          license_key: authResult.license_key,
          message: "Redirecionamento para o portal MR Sem Limites para processar o pagamento com segurança."
        }), { status: 200, headers: cors });
      }
    }
  }
});
