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
        // Mesmo se a licença for inválida/expirada, podemos permitir o fluxo de pagamento para renovação
        // Mas a extensão v17 costuma enviar dados de quem está pagando.
        
        return new Response(JSON.stringify({
          ok: true,
          status: "redirect_required",
          checkout_url: "https://mrsemlimites.lovable.app/loja",
          licenca_id: authResult.licenca_id,
          license_key: authResult.license_key,
          message: "Redirecionando para o portal MR Sem Limites para processar o pagamento com segurança."
        }), { status: 200, headers: cors });
      }
    }
  }
});
