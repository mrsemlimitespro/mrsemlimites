/**
 * BiometricService — autenticação por Touch ID / Face ID / Fingerprint.
 *
 * Fase atual: apenas contrato. Implementação usará
 * @capacitor-community/biometric-auth (ou equivalente aprovado).
 */
import { type NativeResult, notImplemented } from "./types";

export type BiometricType = "fingerprint" | "face" | "iris" | "none";

export interface BiometricAvailability {
  available: boolean;
  type: BiometricType;
}

export interface BiometricPromptOptions {
  reason: string;
  title?: string;
  cancelLabel?: string;
}

export const BiometricService = {
  async isAvailable(): Promise<NativeResult<BiometricAvailability>> {
    return notImplemented("BiometricService.isAvailable");
  },
  async authenticate(_opts: BiometricPromptOptions): Promise<NativeResult<void>> {
    return notImplemented("BiometricService.authenticate");
  },
};
