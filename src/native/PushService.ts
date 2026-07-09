/**
 * PushService — Notificações push (FCM/APNs) via @capacitor/push-notifications.
 *
 * Regras da arquitetura:
 *   - Nenhum componente React importa o plugin diretamente.
 *   - Todos os métodos retornam `NativeResult<T>` — sem throw.
 *   - Plugin carregado via `await import()` (lazy).
 *   - Web/PWA: `register` retorna `unsupported`; listeners retornam no-op.
 *
 * Fluxos cobertos:
 *   - Solicitar permissão + registrar dispositivo (register)
 *   - Obter token e reagir a rotações (onTokenChange)
 *   - Receber notificações em foreground (onMessage)
 *   - Reagir ao toque do usuário (onTap)
 *   - Cold-start via toque (getInitialNotification)
 *   - Erros de registro (onRegistrationError)
 *   - Remoção do registro (unregister + removeAllListeners)
 */
import { getPlatform, isNative } from "@/lib/platform";
import {
  fail,
  ok,
  type NativeResult,
  unsupported,
  type Platform,
} from "./types";

export interface PushRegistration {
  token: string;
  platform: Exclude<Platform, "web">;
}

export interface PushMessage {
  id: string;
  title?: string;
  body?: string;
  /** Payload de dados personalizado (route, slug, categoria, ...). */
  data?: Record<string, unknown>;
}

export interface PushRegistrationError {
  message: string;
  cause?: unknown;
}

export type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

type Unsubscribe = () => void;

/** Cache dos handles do plugin para permitir unsubscribe individual. */
let pluginRef: typeof import("@capacitor/push-notifications") | null = null;
async function loadPlugin() {
  if (!pluginRef) {
    pluginRef = await import("@capacitor/push-notifications");
  }
  return pluginRef;
}

async function addListener<T>(
  event:
    | "registration"
    | "registrationError"
    | "pushNotificationReceived"
    | "pushNotificationActionPerformed",
  cb: (payload: T) => void,
): Promise<Unsubscribe> {
  const { PushNotifications } = await loadPlugin();
  // O plugin retorna um `PluginListenerHandle` (Promise<{ remove() }>).
  const handle = await (PushNotifications as unknown as {
    addListener: (
      e: string,
      c: (p: T) => void,
    ) => Promise<{ remove: () => Promise<void> } | { remove: () => Promise<void> }>;
  }).addListener(event, cb);
  return () => {
    void (handle as { remove: () => Promise<void> }).remove();
  };
}

function toMessage(raw: unknown): PushMessage {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = (r.data ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === "string" ? r.id : crypto.randomUUID(),
    title: typeof r.title === "string" ? r.title : undefined,
    body: typeof r.body === "string" ? r.body : undefined,
    data,
  };
}

export const PushService = {
  /** Estado atual da permissão sem solicitar. */
  async checkPermission(): Promise<NativeResult<PermissionState>> {
    if (!isNative()) return ok<PermissionState>("unsupported");
    try {
      const { PushNotifications } = await loadPlugin();
      const r = await PushNotifications.checkPermissions();
      return ok<PermissionState>(r.receive as PermissionState);
    } catch (cause) {
      return fail("not_available", "Falha ao consultar permissão de push.", cause);
    }
  },

  /**
   * Solicita permissão + registra o dispositivo. Retorna o token quando pronto.
   * Em web/PWA retorna `unsupported` sem quebrar o fluxo.
   */
  async register(): Promise<NativeResult<PushRegistration>> {
    if (!isNative()) return unsupported("PushService.register", getPlatform());
    try {
      const { PushNotifications } = await loadPlugin();
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") {
        return fail("permission_denied", "Permissão de notificações negada.");
      }

      // Aguarda o primeiro `registration` OU `registrationError`.
      const platform = getPlatform() as Exclude<Platform, "web">;
      const tokenPromise = new Promise<NativeResult<PushRegistration>>((resolve) => {
        let done = false;
        const cleanup: Array<() => void> = [];
        const finish = (r: NativeResult<PushRegistration>) => {
          if (done) return;
          done = true;
          for (const fn of cleanup) fn();
          resolve(r);
        };
        void addListener<{ value: string }>("registration", (t) => {
          finish(ok({ token: t.value, platform }));
        }).then((u) => cleanup.push(u));
        void addListener<{ error: string }>("registrationError", (e) => {
          finish(fail("not_available", `Falha ao registrar: ${e.error}`, e));
        }).then((u) => cleanup.push(u));
        // safety timeout — não trava indefinidamente
        setTimeout(() => finish(fail("unknown", "Tempo esgotado ao registrar push.")), 15000);
      });

      await PushNotifications.register();
      return await tokenPromise;
    } catch (cause) {
      return fail("unknown", "Erro ao registrar push.", cause);
    }
  },

  /** Cancela registro local e limpa listeners (o token no backend é removido em nível de app). */
  async unregister(): Promise<NativeResult<void>> {
    if (!isNative()) return unsupported("PushService.unregister", getPlatform());
    try {
      const { PushNotifications } = await loadPlugin();
      await PushNotifications.removeAllListeners();
      // O plugin não tem "unregister" oficial; o app precisa apagar o token no backend.
      return ok(undefined);
    } catch (cause) {
      return fail("unknown", "Falha ao remover listeners de push.", cause);
    }
  },

  /** Rotação de token do FCM/APNs. */
  onTokenChange(cb: (reg: PushRegistration) => void): Unsubscribe {
    if (!isNative()) return () => {};
    const platform = getPlatform() as Exclude<Platform, "web">;
    let inner: Unsubscribe | null = null;
    void addListener<{ value: string }>("registration", (t) => {
      cb({ token: t.value, platform });
    }).then((u) => (inner = u));
    return () => {
      inner?.();
    };
  },

  /** Erro assíncrono de registro (ex.: rede caiu, Play Services indisponível). */
  onRegistrationError(cb: (err: PushRegistrationError) => void): Unsubscribe {
    if (!isNative()) return () => {};
    let inner: Unsubscribe | null = null;
    void addListener<{ error: string }>("registrationError", (e) => {
      cb({ message: e.error, cause: e });
    }).then((u) => (inner = u));
    return () => {
      inner?.();
    };
  },

  /** Notificação recebida com o app em foreground. */
  onMessage(cb: (msg: PushMessage) => void): Unsubscribe {
    if (!isNative()) return () => {};
    let inner: Unsubscribe | null = null;
    void addListener("pushNotificationReceived", (raw) => cb(toMessage(raw))).then(
      (u) => (inner = u),
    );
    return () => {
      inner?.();
    };
  },

  /**
   * Usuário tocou na notificação (background ou tray). Também é disparado
   * quando o app foi aberto pelo toque a partir de estado morto (o plugin
   * entrega o evento após a inicialização).
   */
  onTap(cb: (msg: PushMessage) => void): Unsubscribe {
    if (!isNative()) return () => {};
    let inner: Unsubscribe | null = null;
    void addListener("pushNotificationActionPerformed", (raw: unknown) => {
      const r = (raw ?? {}) as { notification?: unknown };
      cb(toMessage(r.notification ?? r));
    }).then((u) => (inner = u));
    return () => {
      inner?.();
    };
  },

  /** Limpa todas as notificações da bandeja (útil ao abrir o app). */
  async clearAll(): Promise<NativeResult<void>> {
    if (!isNative()) return unsupported("PushService.clearAll", getPlatform());
    try {
      const { PushNotifications } = await loadPlugin();
      await PushNotifications.removeAllDeliveredNotifications();
      return ok(undefined);
    } catch (cause) {
      return fail("unknown", "Falha ao limpar notificações.", cause);
    }
  },
};
