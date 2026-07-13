import { SETTINGS_KEY } from "./constants";
import type { LicenseState, Settings } from "./types";

const emptyState: LicenseState = {
  status: "unknown",
  plan: null,
  expiresAt: null,
  boundEmail: null,
  config: null,
  licenseHash: null,
  lastChecked: 0,
  error: null,
};

const DEFAULTS: Settings = {
  enabled: false,
  userEmail: "",
  licenseKey: "",
  deviceId: "",
  licenseState: emptyState,
};

declare const chrome: any;

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return deepMerge(DEFAULTS, stored?.[SETTINGS_KEY] ?? {});
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const merged = deepMerge(current, patch);
  await chrome.storage.local.set({ [SETTINGS_KEY]: merged });
  return merged;
}

export async function resetSettings(): Promise<Settings> {
  await chrome.storage.local.remove(SETTINGS_KEY);
  return getSettings();
}

export async function ensureDeviceId(): Promise<string> {
  const s = await getSettings();
  if (s.deviceId) return s.deviceId;
  const id =
    (globalThis.crypto?.randomUUID?.() as string | undefined) ??
    `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await setSettings({ deviceId: id });
  return id;
}

function deepMerge<A extends Record<string, any>, B extends Record<string, any>>(
  a: A,
  b: B,
): A & B {
  if (b === null || b === undefined) return a as any;
  if (typeof a !== "object" || typeof b !== "object") return b as any;
  if (Array.isArray(b)) return b as any;
  const out: Record<string, unknown> = { ...a };
  for (const k of Object.keys(b)) {
    const v = (b as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge((a as any)[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out as A & B;
}
