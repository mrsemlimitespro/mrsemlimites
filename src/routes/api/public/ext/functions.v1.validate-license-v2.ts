import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

/**
 * Compat: /functions/v1/validate-license-v2 — usado pelo sidepanel.
 * body: {license_key, hwid, device_info}
 * ok  : {status:'valid', session_token, days_remaining, hours_remaining, license_id}
 * err : {status:'invalid'|'expired'|'device_mismatch'|'error', message}
 */
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "content-type": "application/json",
};

function signSessionToken(licencaId: string, hwid: string | null): string {
  const secret = process.env.EXT_SESSION_SECRET ?? "dev-secret";
  const payload = `${licencaId}.${hwid ?? ""}.${Date.now()}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

export const Route = createFileRoute("/api/public/ext/functions/v1/validate-license-v2")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          /* noop */
        }
        const key = String(body?.license_key ?? "").trim();
        const hwid = body?.hwid ? String(body.hwid).trim() : null;
        const deviceInfo = body?.device_info ?? null;

        if (!key) {
          return new Response(
            JSON.stringify({ status: "invalid", message: "Licença inválida" }),
            { status: 200, headers: cors },
          );
        }

        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        try {
          await sb.rpc("expirar_trials_vencidos");
        } catch {
          /* noop */
        }

        const { data: lic } = await sb
          .from("licencas")
          .select(
            "id, status, tipo, expira_em, device_id, max_dispositivos, trial_iniciado_em, trial_duracao_minutos, ativada_em",
          )
          .eq("chave", key)
          .maybeSingle();

        if (!lic) {
          return new Response(
            JSON.stringify({ status: "invalid", message: "Licença não encontrada" }),
            { status: 200, headers: cors },
          );
        }

        if (lic.status === "cancelada" || lic.status === "revogada") {
          return new Response(
            JSON.stringify({ status: "invalid", message: "Licença revogada" }),
            { status: 200, headers: cors },
          );
        }

        let expira_em = lic.expira_em;
        if (lic.tipo === "teste" && !lic.trial_iniciado_em) {
          const now = new Date();
          const mins = Number(lic.trial_duracao_minutos ?? 30);
          expira_em = new Date(now.getTime() + mins * 60_000).toISOString();
          await sb
            .from("licencas")
            .update({
              trial_iniciado_em: now.toISOString(),
              expira_em,
              ativada_em: now.toISOString(),
            })
            .eq("id", lic.id);
        }

        if (expira_em && new Date(expira_em).getTime() < Date.now()) {
          await sb.from("licencas").update({ status: "expirada" }).eq("id", lic.id);
          return new Response(
            JSON.stringify({ status: "expired", message: "Licença expirada" }),
            { status: 200, headers: cors },
          );
        }

        // Controle HWID / dispositivos
        if (hwid) {
          const { data: existing } = await sb
            .from("licenca_dispositivos")
            .select("id, device_id")
            .eq("licenca_id", lic.id);
          const already = (existing ?? []).find((d) => d.device_id === hwid);
          if (!already) {
            const maxDev = Number(lic.max_dispositivos ?? 1);
            if (maxDev > 0 && (existing?.length ?? 0) >= maxDev) {
              return new Response(
                JSON.stringify({
                  status: "device_mismatch",
                  message: "Licença já está em uso em outro dispositivo",
                }),
                { status: 200, headers: cors },
              );
            }
            await sb.from("licenca_dispositivos").insert({
              licenca_id: lic.id,
              device_id: hwid,
              device_nome: deviceInfo?.name ?? deviceInfo?.userAgent?.slice(0, 100) ?? null,
              user_agent: deviceInfo?.userAgent?.slice(0, 400) ?? null,
            });
            if (!lic.device_id) {
              await sb.from("licencas").update({ device_id: hwid }).eq("id", lic.id);
            }
          } else {
            await sb
              .from("licenca_dispositivos")
              .update({ ultimo_acesso: new Date().toISOString() })
              .eq("id", already.id);
          }
        }

        await sb
          .from("licencas")
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq("id", lic.id);

        const remainingMs = expira_em ? new Date(expira_em).getTime() - Date.now() : null;
        const days_remaining = remainingMs !== null ? Math.floor(remainingMs / 86400000) : 9999;
        const hours_remaining = remainingMs !== null ? Math.floor(remainingMs / 3600000) : 9999 * 24;

        return new Response(
          JSON.stringify({
            status: "valid",
            session_token: signSessionToken(lic.id, hwid),
            days_remaining,
            hours_remaining,
            license_id: lic.id,
            plan: lic.tipo === "premium" ? "premium" : "trial",
            expires_at: expira_em,
          }),
          { status: 200, headers: cors },
        );
      },
    },
  },
});
