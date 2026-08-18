import { createFileRoute } from "@tanstack/react-router";
import { normalizeLicenseKey, isValidLicenseFormat } from "@/lib/licenca/utils";

const LOVABLE_BASE_URL = "https://api.lovable.dev";

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

        // Montagem do payload original para o motor do Lovable
        const chatUrl = `${LOVABLE_BASE_URL}/projects/${projectId}/chat`;
        const rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;

        // 3. Montagem do payload seguro para o motor do Lovable
        const motorPayload = body.lastPayload && typeof body.lastPayload === "object"
          ? { ...body.lastPayload }
          : {};

        const chatPayload = {
          ...motorPayload,
          id: motorPayload.id || `umsg_${crypto.randomUUID()}`,
          message: motorPayload.message || body.message || body.mensagem || "",
          files: motorPayload.files ?? [],
          selected_elements: motorPayload.selected_elements ?? [],
          chat_only: motorPayload.chat_only ?? false,
          view: motorPayload.view ?? "preview",
          view_description: motorPayload.view_description ?? "The user is currently viewing the preview.",
          optimisticImageUrls: motorPayload.optimisticImageUrls ?? [],
          ai_message_id: motorPayload.ai_message_id || `aimsg_${crypto.randomUUID()}`,
          thread_id: motorPayload.thread_id || body.thread_id || "main",
          current_page: motorPayload.current_page ?? "/",
          current_viewport_width: motorPayload.current_viewport_width ?? 648,
          current_viewport_height: motorPayload.current_viewport_height ?? 549,
          current_viewport_dpr: motorPayload.current_viewport_dpr ?? 1,
          model: motorPayload.model ?? null,
          session_replay: motorPayload.session_replay ?? "[]",
        };

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const lovableResponse = await fetch(chatUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${rawToken}`,
              "Accept": "*/*",
              "Origin": "https://lovable.dev",
              "Referer": "https://lovable.dev/",
              "x-lovable-project-id": projectId,
              "User-Agent": "Mozilla/5.0 Chrome Extension",
            },
            body: JSON.stringify(chatPayload),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          const status = lovableResponse.status;
          const isSuccess = status >= 200 && status < 300;
          
          let resultText = "";
          try {
            resultText = await lovableResponse.text();
          } catch (e) {
            resultText = "No response body";
          }

          let resultJson: any = null;
          try {
            resultJson = JSON.parse(resultText);
          } catch (e) {
            // Not JSON
          }

          // Atualiza último acesso se a chamada ao Lovable não falhou miseravelmente (ex: 502/timeout)
          await supabaseAdmin.from("licencas").update({ ultimo_acesso: new Date().toISOString() }).eq("id", lic.id);

          return new Response(JSON.stringify({
            ...(resultJson || { message: resultText }),
            success: isSuccess,
            ok: isSuccess,
            status: status,
            proxy: "mr-central"
          }), {
            status: status,
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