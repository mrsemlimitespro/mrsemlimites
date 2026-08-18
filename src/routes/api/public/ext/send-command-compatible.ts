import { createFileRoute } from "@tanstack/react-router";
import { normalizeLicenseKey, isValidLicenseFormat } from "@/lib/licenca/utils";

const LOVABLE_API_URL = "https://api.lovable.dev/v1/send-command";

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": (origin?.startsWith("chrome-extension://") || origin?.includes("localhost"))
      ? origin! 
      : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info, x-extension-trace-id",
    "content-type": "application/json",
  };
};

export const Route = createFileRoute("/api/public/ext/send-command-compatible")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ success: false, ok: false, error: "invalid_json" }), { status: 400, headers: cors });
        }

        // 1. Extração e Normalização da Chave
        const rawKey = body?.user_license_key || body?.licenseKey || body?.license_key || body?.key;
        const key = normalizeLicenseKey(rawKey);
        const deviceId = body?.device_id || body?.deviceFingerprint || body?.hwid;

        if (!key) {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "license_invalid: Chave não fornecida" }),
            { status: 401, headers: cors }
          );
        }

        if (!isValidLicenseFormat(key)) {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "license_invalid: Formato de chave inválido" }),
            { status: 401, headers: cors }
          );
        }

        // 2. Validação da Licença no Banco Atual
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        
        // Limpeza de trials vencidos antes da validação
        try {
          await supabaseAdmin.rpc("expirar_trials_vencidos");
        } catch (e) {
          console.error("Erro ao expirar trials:", e);
        }

        const { data: lic, error: licError } = await supabaseAdmin
          .from("licencas")
          .select("id, status, expira_em, device_id, max_dispositivos")
          .eq("chave", key)
          .maybeSingle();

        if (licError || !lic) {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "license_invalid: Licença não encontrada" }),
            { status: 401, headers: cors }
          );
        }

        // Verifica Status
        if (lic.status === "cancelada" || lic.status === "revogada") {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "license_invalid: Licença bloqueada" }),
            { status: 403, headers: cors }
          );
        }

        // Verifica Expiração
        if (lic.expira_em && new Date(lic.expira_em).getTime() < Date.now()) {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "license_invalid: Licença expirada" }),
            { status: 403, headers: cors }
          );
        }

        // Validação de Dispositivo (HWID)
        if (deviceId) {
          const { data: devices } = await supabaseAdmin
            .from("licenca_dispositivos")
            .select("device_id")
            .eq("licenca_id", lic.id);
          
          const isRegistered = devices?.some(d => d.device_id === deviceId);
          if (!isRegistered) {
            const maxDev = Number(lic.max_dispositivos ?? 1);
            if ((devices?.length ?? 0) >= maxDev) {
              return new Response(
                JSON.stringify({ success: false, ok: false, error: "hwid_mismatch: Limite de dispositivos atingido" }),
                { status: 403, headers: cors }
              );
            }
            // Auto-registro do dispositivo se houver vaga
            await supabaseAdmin.from("licenca_dispositivos").insert({
              licenca_id: lic.id,
              device_id: deviceId,
              device_nome: "Extensão Chrome (Auto)"
            });
          }
        }

        // 3. Encaminhamento para o Lovable
        const token = body?.token || body?.token_lovable;
        const projectId = body?.projectId || body?.projeto_id;

        if (!token || !projectId) {
          return new Response(
            JSON.stringify({ success: false, ok: false, error: "missing_lovable_credentials" }),
            { status: 400, headers: cors }
          );
        }

        // Montagem do payload para o Lovable (preservando campos)
        const lovablePayload = {
          message: body.message || body.mensagem,
          projectId: projectId,
          token: token,
          git_sha: body.git_sha,
          browser_session_id: body.browser_session_id || body.lovable_browser_session_id,
          attachments: body.attachments || [],
          fast_ack: body.fast_ack ?? true,
          lastPayload: body.lastPayload || {},
          client_id: body.client_id,
          integration_metadata: body.integration_metadata || {},
        };

        try {
          const startTime = Date.now();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

          const lovableResponse = await fetch(LOVABLE_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(lovablePayload),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          const result = await lovableResponse.json();

          // Atualiza último acesso
          await supabaseAdmin.from("licencas").update({ ultimo_acesso: new Date().toISOString() }).eq("id", lic.id);

          return new Response(JSON.stringify({
            ...result,
            success: true,
            ok: true,
            status: 200,
            cmd_count: result.cmd_count ?? 0
          }), {
            status: 200,
            headers: cors
          });

        } catch (err: any) {
          console.error("Erro no proxy Lovable:", err);
          return new Response(
            JSON.stringify({ 
              success: false, 
              ok: false, 
              error: err.name === 'AbortError' ? "lovable_timeout" : "lovable_proxy_error",
              details: err.message
            }),
            { status: 502, headers: cors }
          );
        }
      },
    },
  },
});