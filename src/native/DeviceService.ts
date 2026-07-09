/**
 * DeviceService — informações do dispositivo (modelo, OS, versão do app).
 *
 * Web/PWA: userAgent + defaults.
 * Native: @capacitor/device (a instalar quando implementarmos).
 */
import { getPlatform } from "@/lib/platform";
import { type NativeResult, ok, notImplemented } from "./types";

export interface DeviceInfo {
  platform: "android" | "ios" | "web";
  model: string;
  osVersion: string;
  appVersion?: string;
  isVirtual?: boolean;
}

export const DeviceService = {
  async getInfo(): Promise<NativeResult<DeviceInfo>> {
    const platform = getPlatform();
    if (platform === "web") {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "web";
      return ok({ platform, model: ua, osVersion: "web", isVirtual: false });
    }
    // Nas plataformas nativas @capacitor/device será usado em fase futura.
    return notImplemented("DeviceService.getInfo (nativo)");
  },
};
