import { endpointUrl } from "./constants";
import { ensureDeviceId, getSettings, setSettings } from "./storage";
import type { LicenseConfig, LicenseState, LicenseStatus } from "./types";

export const emptyLicenseState = (): LicenseState => ({
  status: "unknown",
  plan: null,
  expiresAt: null,
  boundEmail: null,
  config: null,
  licenseHash: null,
  lastChecked: 0,
  error: null,
});

async function computeLicenseHash(key: string): Promise<string | null> {
  try {
    const enc = new TextEncoder().encode(key);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  } catch {
    return null;
  }
}

export async function persistLicenseState(
  patch: Partial<LicenseState>,
): Promise<LicenseState> {
  const current = (await getSettings()).licenseState ?? emptyLicenseState();
  const next: LicenseState = {
    ...current,
    ...patch,
    lastChecked: Date.now(),
  };
  await setSettings({ licenseState: next });
  return next;
}

export function mapErrorToStatus(
  httpStatus: number,
  errorMsg: string | undefined,
  reason: string | undefined,
): LicenseStatus {
  const r = String(reason || "").toLowerCase();
  if (r === "revoked") return "revoked";
  if (r === "expired") return "expired";
  if (r === "device_mismatch") return "device_mismatch";
  if (r === "post_reset_guard") return "device_mismatch";
  if (r === "transient") return "transient";
  if (r === "invalid_key") return "invalid";

  if (httpStatus >= 500 || httpStatus === 429) return "transient";

  const msg = String(errorMsg || "").toLowerCase();
  if (msg.includes("expirad") || msg.includes("expired")) return "expired";
  if (msg.includes("revogad") || msg.includes("revoked")) return "revoked";
  if (
    msg.includes("dispositivo") ||
    msg.includes("hwid") ||
    msg.includes("device") ||
    msg.includes("resetada recentemente") ||
    msg.includes("resetar")
  ) {
    return "device_mismatch";
  }
  if (httpStatus === 403 || httpStatus === 401) return "invalid";
  return "transient";
}

export async function validateLicense(
  cfg: LicenseConfig,
  key: string,
  email: string | null,
  hwid: string | null,
): Promise<LicenseState> {
  const trimmed = (key || "").trim();
  if (!trimmed) {
    return persistLicenseState({
      ...emptyLicenseState(),
      status: "invalid",
      error: "Chave vazia",
    });
  }

  const url = endpointUrl(cfg, "injectConfig");
  const body: Record<string, unknown> = { key: trimmed };
  if (email) body.email = email;
  if (hwid) body.hwid = hwid;

  let res: Response;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), cfg.timeoutMs);
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
  } catch {
    const cached = (await getSettings()).licenseState ?? emptyLicenseState();
    return {
      ...cached,
      status: cached.status === "valid" ? "valid" : "transient",
      error: "Sem conexão",
    };
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (res.ok && data?.config) {
    return persistLicenseState({
      status: "valid",
      plan: data.license?.plan ?? null,
      expiresAt: data.license?.expires_at ?? null,
      boundEmail: data.license?.bound_email ?? null,
      config: data.config,
      licenseHash: await computeLicenseHash(trimmed),
      error: null,
    });
  }

  const status = mapErrorToStatus(res.status, data?.error || data?.message, data?.reason);
  return persistLicenseState({
    status,
    error: data?.error || data?.message || `HTTP ${res.status}`,
  });
}

export async function getLicenseState(
  cfg: LicenseConfig,
  { force = false }: { force?: boolean } = {},
): Promise<LicenseState> {
  const settings = await getSettings();
  const key = settings.licenseKey;
  if (!key) return emptyLicenseState();

  const cached = settings.licenseState ?? emptyLicenseState();
  const fresh = Date.now() - (cached.lastChecked || 0) < cfg.cacheTtlMs;
  if (!force && fresh && cached.status === "valid") return cached;

  const hwid = await ensureDeviceId();
  return validateLicense(cfg, key, settings.userEmail || null, hwid);
}
