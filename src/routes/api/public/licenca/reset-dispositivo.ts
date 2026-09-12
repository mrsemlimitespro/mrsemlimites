import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { normalizeLicenseKey } from "@/lib/licenca/utils";

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("origin");
  return {
    "Access-Control-Allow-Origin":
      origin?.startsWith("chrome-extension://") || origin?.includes("localhost") ? origin! : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "content-type": "application/json",
  };
};

/**
 * Troca de computador: solta o dispositivo atual e prende o que fez a chamada.
 * Regra: um computador por vez, trocas ilimitadas.
 */
export const Route = createFileRoute("/api/public/licenca/reset-dispositivo")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const deny = (error: string) =>
          new Response(JSON.stringify({ ok: false, error }), { status: 200, headers: cors });

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          /* noop */
        }

        const chave = normalizeLicenseKey(
          body?.chave || body?.key || body?.license_key || body?.licenca,
        );
        const device_id = String(body?.device_id ?? body?.hwid ?? "").trim();
        const device_nome = body?.device_nome ? String(body.device_nome).slice(0, 120) : null;
        const extension_id = body?.extension_id ? String(body.extension_id).slice(0, 80) : null;
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null;
        const user_agent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

        if (!chave) return deny("Chave inválida.");
        if (!device_id) return deny("Dispositivo não informado.");

        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data: lic } = await sb
          .from("licencas")
          .select("id, status, expira_em, device_id")
          .eq("chave", chave)
          .maybeSingle();

        // Erro genérico: não revela se a chave existe.
        if (!lic) return deny("Chave inválida.");

        const vencida = lic.expira_em ? new Date(lic.expira_em).getTime() < Date.now() : false;
        if (lic.status !== "ativa" || vencida) {
          return deny("Licença inválida ou expirada.");
        }

        const anterior = lic.device_id ?? null;
        const agora = new Date().toISOString();

        // Solta o vínculo em TODOS os lugares
        await sb.from("licenca_dispositivos").delete().eq("licenca_id", lic.id);
        await sb.from("licenca_dispositivos").insert({
          licenca_id: lic.id,
          device_id,
          device_nome,
          ip,
          user_agent,
        });
        await sb
          .from("licencas")
          .update({ device_id, device_vinculado_em: agora })
          .eq("id", lic.id);

        // Histórico da chave
        try {
          await sb.from("licencas_eventos").insert({
            licenca_id: lic.id,
            tipo: "device_trocado",
            mensagem: `Trocou de computador: saiu ${anterior ?? "nenhum"}, entrou ${device_id}.`,
            device_id,
            ip,
            metadata: {
              device_anterior: anterior,
              device_novo: device_id,
              device_nome,
              extension_id,
            },
          });
        } catch {
          /* histórico é best-effort */
        }

        return new Response(JSON.stringify({ ok: true, device_id, trocado_em: agora }), {
          status: 200,
          headers: cors,
        });
      },
    },
  },
});
