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
        if (!authResult.ok) return new Response(JSON.stringify(authResult), { status: 403, headers: cors });

        // No MR Sem Limites, pagamentos são via checkout externo ou Kiwify.
        // Aqui apenas sinalizamos para a extensão onde ela deve ir.
        return new Response(JSON.stringify({
          ok: true,
          checkout_url: "https://mrsemlimites.lovable.app/loja",
          message: "Redirecionando para o portal MR Sem Limites."
        }), { status: 200, headers: cors });
      }
    }
  }
});
