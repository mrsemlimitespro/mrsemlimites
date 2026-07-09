/**
 * PermissionsService — fachada de permissões nativas.
 *
 * Web/PWA: Web Permissions API quando disponível.
 * Native: delega para o plugin específico de cada recurso (lazy import).
 *
 * Nesta fase, biometric/camera/mic/geo/notifications têm implementação
 * consultiva (check) uniforme; `request` de recursos que exigem plugin
 * ainda não instalado retorna `not_implemented` — será plugado quando o
 * serviço correspondente for implementado (Fase 7+).
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, fail, notImplemented } from "./types";

export type PermissionKind =
  | "notifications"
  | "camera"
  | "photos"
  | "microphone"
  | "geolocation"
  | "biometric"
  | "clipboard-read"
  | "clipboard-write";

export type PermissionState = "granted" | "denied" | "prompt" | "unavailable";

const WEB_PERMISSION_MAP: Partial<Record<PermissionKind, PermissionName>> = {
  notifications: "notifications" as PermissionName,
  camera: "camera" as PermissionName,
  microphone: "microphone" as PermissionName,
  geolocation: "geolocation" as PermissionName,
  "clipboard-read": "clipboard-read" as PermissionName,
  "clipboard-write": "clipboard-write" as PermissionName,
};

async function webCheck(kind: PermissionKind): Promise<PermissionState> {
  if (typeof navigator === "undefined") return "unavailable";
  const name = WEB_PERMISSION_MAP[kind];
  if (!name || !navigator.permissions?.query) return "unavailable";
  try {
    const status = await navigator.permissions.query({ name });
    return status.state as PermissionState;
  } catch {
    return "unavailable";
  }
}

export const PermissionsService = {
  async check(kind: PermissionKind): Promise<NativeResult<PermissionState>> {
    if (!isNative()) {
      return ok(await webCheck(kind));
    }
    // Nativo: cada plugin tem checkPermissions próprio — plugado nas fases
    // dedicadas (Push, Camera, Geolocation, Biometric).
    return notImplemented(`PermissionsService.check(${kind}) nativo`);
  },

  async request(kind: PermissionKind): Promise<NativeResult<PermissionState>> {
    if (!isNative()) {
      if (kind === "notifications" && typeof Notification !== "undefined") {
        try {
          const p = await Notification.requestPermission();
          return ok(
            (p === "granted" ? "granted" : p === "denied" ? "denied" : "prompt") as PermissionState,
          );
        } catch (e) {
          return fail("unknown", "Falha ao solicitar permissão de notificação.", e);
        }
      }
      // Para camera/mic/geo, a permissão web é solicitada ao usar a API
      // (getUserMedia, getCurrentPosition) — não há endpoint de request separado.
      const state = await webCheck(kind);
      return ok(state);
    }
    return notImplemented(`PermissionsService.request(${kind}) nativo`);
  },
};
