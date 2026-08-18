import { normalizeLicenseKey, isValidLicenseFormat } from "@/lib/licenca/utils";

export const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("origin");
  const isAllowed = origin?.startsWith("chrome-extension://") || origin?.includes("localhost");
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "content-type, authorization, x-lovable-project-id, x-extension-trace-id",
    "Access-Control-Max-Age": "86400",
  };
};

export type LicenseValidationResult = {
  ok: boolean;
  valid: boolean;
  status: "active" | "expired" | "revoked" | "not_found" | "invalid_format" | "hwid_mismatch";
  license_key: string;
  user_name?: string;
  expires_at?: string;
  session_id?: string;
  device_id?: string;
  error?: string;
};

export async function validateExtensionLicense(
  body: any,
  ip: string | null = null,
  userAgent: string | null = null
): Promise<LicenseValidationResult> {
  const rawKey = body?.license_key || body?.user_license_key || body?.key || body?.licenseKey;
  const hwid = body?.hwid || body?.device_id || body?.deviceId;
  const sessionId = body?.session_id;

  const key = normalizeLicenseKey(rawKey);

  if (!key || !isValidLicenseFormat(key)) {
    return { ok: false, valid: false, status: "invalid_format", license_key: key || "", error: "license_invalid" };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Lazy expiration
  try {
    await supabaseAdmin.rpc("expirar_trials_vencidos");
  } catch (e) {
    console.error("Trial expiration failed:", e);
  }

  const { data: lic, error: licError } = await supabaseAdmin
    .from("licencas")
    .select("id, status, expira_em, device_id, max_dispositivos, email")
    .eq("chave", key)
    .maybeSingle();

  if (licError || !lic) {
    return { ok: false, valid: false, status: "not_found", license_key: key, error: "license_not_found" };
  }

  if (lic.status === "cancelada" || lic.status === "revogada") {
    return { ok: false, valid: false, status: "revoked", license_key: key, error: "license_revoked" };
  }

  if (lic.expira_em && new Date(lic.expira_em).getTime() < Date.now()) {
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
      
      // Auto-registration
      await supabaseAdmin.from("licenca_dispositivos").insert({
        licenca_id: lic.id,
        device_id: hwid,
        device_nome: "V17.0 Auto-Register",
        ip,
        user_agent: userAgent
      });
    }
  }

  // Log access
  await supabaseAdmin.from("licencas").update({ ultimo_acesso: new Date().toISOString() }).eq("id", lic.id);

  return {
    ok: true,
    valid: true,
    status: "active",
    license_key: key,
    user_name: lic.email?.split('@')[0] || "Usuário MR",
    expires_at: lic.expira_em || undefined,
    session_id: sessionId || `sess_${crypto.randomUUID()}`,
    device_id: hwid
  };
}
