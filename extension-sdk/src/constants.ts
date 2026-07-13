import type { LicenseConfig } from "./types";

export const SETTINGS_KEY = "settings";

/** URL completa de um endpoint da API. */
export function endpointUrl(
  cfg: LicenseConfig,
  key: keyof LicenseConfig["endpoints"],
): string {
  const path = cfg.endpoints[key];
  // heartbeat/renovar/etc. ficam sob /api/public — remove o sufixo /ext se preciso.
  if (path.startsWith("/licenca/") || path.startsWith("/validar-licenca")) {
    return cfg.apiBaseUrl.replace(/\/ext$/, "") + path;
  }
  return cfg.apiBaseUrl + path;
}
