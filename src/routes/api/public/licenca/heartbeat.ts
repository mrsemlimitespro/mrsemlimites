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
    "Access-Control-Allow-Headers": "content-type, authorization",
    "content-type": "application/json",
  };
};

export const Route = createFileRoute("/api/public/licenca/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          /* noop */
        }
        const chave = normalizeLicenseKey(body?.chave || body?.key || body?.license_key || body?.licenca);
        const device_id = body?.device_id ? String(body.device_id).trim() : (body?.hwid ? String(body.hwid).trim() : null);
        // FASE 2 (multi-extensão): leitura opcional de `extension_id`. Reservado para uso futuro.
        // Não passado à RPC `heartbeat_licenca`; comportamento inalterado.
        const extension_id = body?.extension_id ? String(body.extension_id).slice(0, 80) : null;
        void extension_id;

        if (!chave) {
          return new Response(
            JSON.stringify({ ok: false, estado: "REVOKED", error: "missing_chave" }),
            { status: 200, headers: cors },
          );
        }

        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data, error } = await sb.rpc("heartbeat_licenca", {
          _chave: chave,
          _device_id: device_id,
        });

        if (error) {
          return new Response(
            JSON.stringify({ ok: false, estado: "REVOKED", error: "rpc_failed" }),
            { status: 200, headers: cors },
          );
        }
        return new Response(
          JSON.stringify({
            ok: true,
            estado: data?.estado?.toLowerCase() || "ativa",
            expira_em: data?.expira_em || null,
          }), 
          { status: 200, headers: cors }
        );
      },
    },
  },
});
