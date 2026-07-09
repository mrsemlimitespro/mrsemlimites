/**
 * ClipboardService — leitura e escrita da área de transferência.
 *
 * Web/PWA: navigator.clipboard.
 * Native: @capacitor/clipboard (a instalar quando implementarmos).
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, fail, notImplemented } from "./types";

export const ClipboardService = {
  async write(text: string): Promise<NativeResult<void>> {
    if (!isNative()) {
      try {
        await navigator.clipboard.writeText(text);
        return ok(undefined);
      } catch (e) {
        return fail("not_available", "Clipboard indisponível.", e);
      }
    }
    return notImplemented("ClipboardService.write (nativo)");
  },

  async read(): Promise<NativeResult<string>> {
    if (!isNative()) {
      try {
        return ok(await navigator.clipboard.readText());
      } catch (e) {
        return fail("permission_denied", "Sem permissão de leitura do clipboard.", e);
      }
    }
    return notImplemented("ClipboardService.read (nativo)");
  },
};
