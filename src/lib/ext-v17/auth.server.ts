import { normalizeLicenseKey, isValidLicenseFormat } from "@/lib/licenca/utils";

export const ALLOWED_EXTENSION_IDS = [
  "pbeoifjhgofkbcofabccbcffbpgkpkbk", // ID oficial MR Sem Limites
  "liafammnfabhbhlkolccllamdlmnipno", // nova extensão
];

export const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("origin");
  const isAllowed =
    (!!origin && ALLOWED_EXTENSION_IDS.some((id) => origin === `chrome-extension://${id}`)) ||
    (process.env.NODE_ENV === 'development' && origin?.includes("localhost"));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : `chrome-extension://${ALLOWED_EXTENSION_IDS[0]}`,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "content-type, authorization, x-lovable-project-id, x-extension-trace-id",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
  };
};

function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const masked = { ...data };
  const sensitiveKeys = ['Authorization', 'token', 'key', 'license_key', 'api_key', 'password', 'secret'];
  
  for (const k of Object.keys(masked)) {
    if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk.toLowerCase()))) {
      masked[k] = '[MASKED]';
    } else if (typeof masked[k] === 'object') {
      masked[k] = maskSensitiveData(masked[k]);
    }
  }
  return masked;
}

export type LicenseValidationResult = {
  ok: boolean;
  valid: boolean;
  status: "active" | "expired" | "revoked" | "blocked" | "unknown_product" | "not_found" | "invalid_format" | "hwid_mismatch" | "session_conflict";
  reason?: string;
  license_key: string;
  licenca_id?: string; // UUID from public.licencas
  user_name?: string;
  expires_at?: string;
  session_id?: string;
  device_id?: string;
  error?: string;
};

export async function validateExtensionLicense(
  body: any,
  ip: string | null = null,
  userAgent: string | null = null,
  path: string = "unknown"
): Promise<LicenseValidationResult> {
  const rawKey = body?.license_key || body?.user_license_key || body?.key || body?.licenseKey || body?.license_key_input;
  const hwid = body?.hwid || body?.device_id || body?.deviceId;
  const sessionId = body?.session_id;
  const extensionSlug = body?.extension_id ? String(body.extension_id).trim().slice(0, 80) : null;

  const key = normalizeLicenseKey(rawKey);

  if (!key || !isValidLicenseFormat(key)) {
    return { ok: false, valid: false, status: "invalid_format", license_key: key || "", error: "license_invalid" };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Produto (opcional): só valida quando enviado. Sem extension_id = comportamento antigo.
  let produto: string | null = null;
  if (extensionSlug) {
    const { data: prod } = await supabaseAdmin
      .from("licenca_produtos")
      .select("slug")
      .eq("slug", extensionSlug)
      .eq("ativo", true)
      .maybeSingle();
    if (!prod) {
      return { ok: false, valid: false, status: "unknown_product", license_key: key, error: "unknown_product" };
    }
    produto = prod.slug;
  }

  // Trial expiration lazy check
  try {
    await supabaseAdmin.rpc("expirar_trials_vencidos");
  } catch (e) {
    // console.error("Trial expiration failed:", e);
  }

  const { data: lic, error: licError } = await supabaseAdmin
    .from("licencas")
    .select("id, status, tipo, expira_em, ativada_em, duracao_dias, trial_iniciado_em, trial_duracao_minutos, device_id, max_dispositivos, email")
    .eq("chave", key)
    .maybeSingle();

  if (licError || !lic) {
    return { ok: false, valid: false, status: "not_found", license_key: key, error: "license_not_found" };
  }

  if (lic.status === "cancelada" || lic.status === "revogada") {
    return { ok: false, valid: false, status: "revoked", license_key: key, error: "license_revoked" };
  }

  if (lic.status === "bloqueada" || lic.status === "suspensa") {
    return { ok: false, valid: false, status: "blocked", reason: "blocked", license_key: key, error: "Licença bloqueada." };
  }

  // Ativação na 1ª validação (espelha a rota clássica; só preenche campos nulos)
  let expiraEm: string | null = lic.expira_em;
  const nowIso = new Date().toISOString();
  if (lic.tipo === "teste" && !lic.trial_iniciado_em) {
    const mins = Number(lic.trial_duracao_minutos ?? 30);
    expiraEm = lic.expira_em ?? new Date(Date.now() + mins * 60_000).toISOString();
    await supabaseAdmin
      .from("licencas")
      .update({ trial_iniciado_em: nowIso, expira_em: expiraEm, ativada_em: lic.ativada_em ?? nowIso })
      .eq("id", lic.id);
  } else if (lic.tipo !== "teste" && !lic.expira_em) {
    const dias = Number(lic.duracao_dias ?? 30);
    expiraEm = new Date(Date.now() + dias * 86_400_000).toISOString();
    await supabaseAdmin
      .from("licencas")
      .update({ expira_em: expiraEm, ativada_em: lic.ativada_em ?? nowIso })
      .eq("id", lic.id);
  }

  if (expiraEm && new Date(expiraEm).getTime() < Date.now()) {
    return { ok: false, valid: false, status: "expired", license_key: key, error: "license_expired" };
  }

  // HWID validation
  if (hwid) {
    const { data: devices } = await supabaseAdmin
      .from("licenca_dispositivos")
      .select("device_id")
      .eq("licenca_id", lic.id);

    const isRegistered = devices?.some(d => d.device_id === hwid);
    if (!isRegistered) {
      const maxDev = Number(lic.max_dispositivos ?? 1);
      if (maxDev > 0 && (devices?.length ?? 0) >= maxDev) {
        return { ok: false, valid: false, status: "hwid_mismatch", license_key: key, error: "device_mismatch" };
      }
      
      await supabaseAdmin.from("licenca_dispositivos").insert({
        licenca_id: lic.id,
        device_id: hwid,
        device_nome: "V17.0 Extension",
        ip,
        user_agent: userAgent
      });
    }

    // Vínculo adicional por chave+produto (só raio v17; não substitui a checagem acima)
    try {
      await supabaseAdmin.from("ext_v17_dispositivos").upsert({
        licenca_id: lic.id,
        produto: produto ?? "motor-v17",
        device_id: String(hwid),
        device_nome: "V17.0 Extension",
        ultimo_acesso: nowIso,
      }, { onConflict: "licenca_id,produto,device_id" });
    } catch {
      /* best-effort */
    }
  }

  // Session & Audit
  const finalSessionId = sessionId || `sess_${crypto.randomUUID()}`;
  
  await Promise.all([
    supabaseAdmin.from("licencas").update({ ultimo_acesso: nowIso }).eq("id", lic.id),
    supabaseAdmin.from("ext_v17_sessions").upsert({
      licenca_id: lic.id,
      session_id: finalSessionId,
      device_id: hwid || "unknown",
      last_heartbeat: nowIso,
      ip,
      user_agent: userAgent
    }, { onConflict: 'session_id' }),
    supabaseAdmin.from("ext_v17_requests").insert({
      licenca_id: lic.id,
      path,
      method: "POST",
      payload: maskSensitiveData(body),
      ip,
      produto,
    })
  ]);

  return {
    ok: true,
    valid: true,
    status: "active",
    license_key: key,
    licenca_id: lic.id,
    user_name: lic.email?.split('@')[0] || "Usuário MR",
    expires_at: expiraEm || undefined,
    session_id: finalSessionId,
    device_id: hwid
  };
}
