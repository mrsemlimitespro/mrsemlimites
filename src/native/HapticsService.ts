/**
 * HapticsService — feedback tátil (vibração curta).
 *
 * Web/PWA: navigator.vibrate() quando disponível, senão no-op.
 * Native: @capacitor/haptics (a instalar quando implementarmos).
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, notImplemented } from "./types";

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

const WEB_VIBRATION: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [15, 40, 15],
  warning: [20, 60, 20],
  error: [40, 60, 40, 60, 40],
};

export const HapticsService = {
  async impact(style: HapticStyle = "light"): Promise<NativeResult<void>> {
    if (!isNative()) {
      try {
        (navigator as unknown as { vibrate?: (p: number | number[]) => boolean })
          .vibrate?.(WEB_VIBRATION[style]);
      } catch {
        /* noop */
      }
      return ok(undefined);
    }
    return notImplemented("HapticsService.impact (nativo, instalar @capacitor/haptics)");
  },
};
