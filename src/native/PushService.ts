/**
 * PushService — Push Notifications (FCM Android / APNs iOS).
 *
 * Fase atual: apenas a estrutura. Implementação real usará
 * @capacitor/push-notifications + edge function para registrar o token no backend.
 */
import { type NativeResult, notImplemented } from "./types";

export interface PushRegistration {
  token: string;
  platform: "android" | "ios";
}

export interface PushMessage {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

type Unsubscribe = () => void;

export const PushService = {
  async register(): Promise<NativeResult<PushRegistration>> {
    return notImplemented("PushService.register");
  },
  async unregister(): Promise<NativeResult<void>> {
    return notImplemented("PushService.unregister");
  },
  onMessage(_cb: (msg: PushMessage) => void): Unsubscribe {
    return () => {};
  },
  onTap(_cb: (msg: PushMessage) => void): Unsubscribe {
    return () => {};
  },
};
