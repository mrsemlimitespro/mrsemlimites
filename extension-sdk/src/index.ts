import {
  emptyLicenseState,
  getLicenseState,
  persistLicenseState,
  validateLicense,
} from "./license";
import { ensureDeviceId, getSettings, resetSettings, setSettings } from "./storage";
import type { LicenseConfig, LicenseState } from "./types";

export * from "./types";
export { emptyLicenseState };

/**
 * Fachada pública do SDK. Recebe a configuração central e devolve um objeto
 * com todos os métodos que a extensão precisa. Não altera o funcionamento da
 * extensão MR Sem Limites — replica exatamente o comportamento de lib/license.js.
 */
export function createLicenseSDK(cfg: LicenseConfig) {
  return {
    config: cfg,

    /** Ativa uma chave (teste ou definitiva). */
    async activate(key: string, email?: string): Promise<LicenseState> {
      await setSettings({ licenseKey: key.trim(), userEmail: email ?? "" });
      const hwid = await ensureDeviceId();
      return validateLicense(cfg, key, email ?? null, hwid);
    },

    /** Estado atual (respeita cache). */
    getState: (opts?: { force?: boolean }) => getLicenseState(cfg, opts),

    /** Força revalidação. */
    refresh: () => getLicenseState(cfg, { force: true }),

    /** Limpa tudo (logout). */
    async clear(): Promise<void> {
      await resetSettings();
    },

    /** Utilidades de baixo nível expostas para casos avançados. */
    _internal: {
      getSettings,
      setSettings,
      persistLicenseState,
      validateLicense: (key: string, email?: string, hwid?: string) =>
        validateLicense(cfg, key, email ?? null, hwid ?? null),
    },
  };
}

export type LicenseSDK = ReturnType<typeof createLicenseSDK>;
