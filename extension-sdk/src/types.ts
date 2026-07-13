export type LicenseStatus =
  | "unknown"
  | "valid"
  | "invalid"
  | "expired"
  | "revoked"
  | "device_mismatch"
  | "transient"
  | "outdated";

export type LicensePlan = "trial" | "premium" | null;

export interface LicenseState {
  status: LicenseStatus;
  plan: LicensePlan;
  expiresAt: string | null;
  boundEmail: string | null;
  config: Record<string, unknown> | null;
  licenseHash: string | null;
  lastChecked: number;
  error: string | null;
}

export interface LicenseEndpoints {
  injectConfig: string;
  validateV2: string;
  heartbeat: string;
  renovar: string;
  revogar: string;
  resetHwid: string;
  config: string;
  consulta: string;
}

export interface LicenseConfig {
  extensionName: string;
  extensionId: string;
  version: string;
  productName: string;
  logoUrl: string;

  apiBaseUrl: string;
  panelUrl: string;
  anonKey: string;
  timeoutMs: number;
  cacheTtlMs: number;

  trialMinutes: number;
  paidDays: number;

  endpoints: LicenseEndpoints;
}

export interface Settings {
  enabled: boolean;
  userEmail: string;
  licenseKey: string;
  deviceId: string;
  licenseState: LicenseState;
  [k: string]: unknown;
}
