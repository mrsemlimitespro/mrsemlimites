/**
 * ShareService — compartilhamento nativo de texto/link/arquivo.
 *
 * Web/PWA: navigator.share (Web Share API) quando disponível, fallback clipboard.
 * Native: @capacitor/share (a instalar quando implementarmos).
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, fail, notImplemented } from "./types";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export const ShareService = {
  isAvailable(): boolean {
    if (isNative()) return true;
    return typeof navigator !== "undefined" && typeof (navigator as Navigator & { share?: unknown }).share === "function";
  },

  async share(opts: ShareOptions): Promise<NativeResult<void>> {
    if (!isNative()) {
      const nav = navigator as Navigator & { share?: (d: ShareOptions) => Promise<void> };
      if (typeof nav.share === "function") {
        try {
          await nav.share(opts);
          return ok(undefined);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.toLowerCase().includes("abort")) return fail("cancelled", msg);
          return fail("unknown", msg, e);
        }
      }
      // Fallback: copia URL para o clipboard.
      const payload = opts.url ?? opts.text ?? opts.title ?? "";
      try {
        await navigator.clipboard?.writeText(payload);
        return ok(undefined);
      } catch (e) {
        return fail("unsupported", "Web Share API indisponível.");
      }
    }
    return notImplemented("ShareService.share (nativo, instalar @capacitor/share)");
  },
};
