import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/upload")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        
        // Em um ambiente de Worker, uploads complexos de FormData precisam ser lidos com request.formData()
        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_form_data" }), { status: 400, headers: cors });
        }

        // Validação básica de licença via campos no FormData
        const licenseKey = formData.get("license_key") as string;
        const hwid = formData.get("hwid") as string;

        const authResult = await validateExtensionLicense({ license_key: licenseKey, hwid });
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        // Para este projeto, o upload deve ser encaminhado para o Lovable ou armazenado temporariamente.
        // Como não temos a API de upload do Lovable documentada no prompt para proxying direto,
        // retornamos um erro explícito de "não implementado com segurança" conforme solicitado se houver risco.
        // No entanto, podemos tentar simular o contrato se o motor espera uma URL.
        
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "upload_not_implemented", 
          reason: "Proxying de upload para o Lovable exige segredos de infraestrutura não disponíveis neste ambiente seguro." 
        }), { status: 501, headers: cors });
      },
    },
  },
});
