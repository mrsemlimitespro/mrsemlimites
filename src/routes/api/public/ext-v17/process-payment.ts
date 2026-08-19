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
        
        // v17 motor espera erro 403 se a licença for inválida/expirada
        if (!authResult.ok) {
           return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }
        
        // Implementação do Checkout Real MR Sem Limites com licença validada.
        return new Response(JSON.stringify({
          ok: true,
          status: "redirect_required",
          checkout_url: `https://mrsemlimites.lovable.app/checkout?licenca_id=${authResult.licenca_id}&key=${authResult.license_key}`,
          licenca_id: authResult.licenca_id,
          license_key: authResult.license_key,
          message: "Redirecionamento para o Checkout Seguro MR Sem Limites."
        }), { status: 200, headers: cors });
      }
    }
  }
});
