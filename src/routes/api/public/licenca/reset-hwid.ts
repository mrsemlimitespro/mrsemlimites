import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { normalizeLicenseKey } from "@/lib/licenca/utils";

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": (origin?.startsWith("chrome-extension://") || origin?.includes("localhost"))
      ? origin! 
      : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "content-type": "application/json",
  };
};

/**
 * Fluxo em duas etapas: a extensão registra a solicitação e o admin aprova em
 * `/admin/licencas` (usa a função existente `resetar_device_licenca`).
 */
export const Route = createFileRoute("/api/public/licenca/reset-hwid")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const corsHeaders = getCorsHeaders(request);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          /* noop */
        }
        const chave = normalizeLicenseKey(body?.chave || body?.license_key);
        const motivo = body?.motivo ? String(body.motivo).slice(0, 300) : null;
        if (!chave) {
          return new Response(JSON.stringify({ ok: false, error: "missing_chave" }), {
            status: 200,
            headers: corsHeaders,
          });
        }
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data: lic } = await sb
          .from("licencas")
          .select("id")
          .eq("chave", chave)
          .maybeSingle();
        if (!lic) {
          return new Response(JSON.stringify({ ok: false, error: "not_found" }), {
            status: 200,
            headers: corsHeaders,
          });
        }

        await sb
          .from("licencas")
          .update({
            reset_hwid_solicitado_em: new Date().toISOString(),
            reset_hwid_motivo: motivo,
          })
          .eq("id", lic.id);

        await sb.from("licencas_eventos").insert({
          licenca_id: lic.id,
          tipo: "reset_solicitado",
          mensagem: "Solicitação de reset de HWID pela extensão",
          metadata: { motivo },
        });

        return new Response(
          JSON.stringify({
            ok: true,
            estado: "PENDING",
            mensagem: "Solicitação registrada. Aguarde aprovação do administrador.",
          }),
          { status: 200, headers: corsHeaders },
        );
      },
    },
  },
});
