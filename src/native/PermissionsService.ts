/**
 * PermissionsService — verificação/solicitação de permissões nativas.
 *
 * Cada plugin do Capacitor tem seu próprio `checkPermissions()` /
 * `requestPermissions()`. Aqui uniformizamos em um só ponto para que
 * consumidores nunca importem plugins diretamente.
 */
import { type NativeResult, notImplemented } from "./types";

export type PermissionKind =
  | "notifications"
  | "camera"
  | "photos"
  | "microphone"
  | "geolocation"
  | "biometric";

export type PermissionState = "granted" | "denied" | "prompt" | "unavailable";

export const PermissionsService = {
  async check(kind: PermissionKind): Promise<NativeResult<PermissionState>> {
    return notImplemented(`PermissionsService.check(${kind})`);
  },

  async request(kind: PermissionKind): Promise<NativeResult<PermissionState>> {
    return notImplemented(`PermissionsService.request(${kind})`);
  },
};
