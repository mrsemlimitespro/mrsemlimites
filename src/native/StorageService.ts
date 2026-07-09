/**
 * StorageService — armazenamento chave-valor persistente.
 *
 * Web/PWA: localStorage (síncrono, wrapped em Promise).
 * Native: @capacitor/preferences (SharedPreferences Android / UserDefaults iOS).
 *
 * NOTA: para dados realmente sensíveis (tokens de sessão, chaves privadas)
 * em release futura considerar Keychain (iOS) / EncryptedSharedPreferences
 * (Android) via plugin secure-storage.
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, safeCall } from "./types";

export const StorageService = {
  async get(key: string): Promise<NativeResult<string | null>> {
    if (!isNative()) {
      try {
        return ok(typeof localStorage === "undefined" ? null : localStorage.getItem(key));
      } catch (e) {
        return ok(null);
      }
    }
    return safeCall("Preferences.get", async () => {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value ?? null;
    });
  },

  async set(key: string, value: string): Promise<NativeResult<void>> {
    if (!isNative()) {
      try {
        localStorage.setItem(key, value);
        return ok(undefined);
      } catch (e) {
        return ok(undefined);
      }
    }
    return safeCall("Preferences.set", async () => {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
    });
  },

  async remove(key: string): Promise<NativeResult<void>> {
    if (!isNative()) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        /* noop */
      }
      return ok(undefined);
    }
    return safeCall("Preferences.remove", async () => {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key });
    });
  },

  async clear(): Promise<NativeResult<void>> {
    if (!isNative()) {
      try {
        localStorage.clear();
      } catch (e) {
        /* noop */
      }
      return ok(undefined);
    }
    return safeCall("Preferences.clear", async () => {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.clear();
    });
  },
};
