/**
 * NetworkService — estado da conexão (online/offline, tipo).
 *
 * Web/PWA: navigator.onLine + eventos online/offline.
 * Native: @capacitor/network.
 */
import { isNative } from "@/lib/platform";
import { type NativeResult, ok, safeCall } from "./types";

export type ConnectionType = "wifi" | "cellular" | "none" | "unknown";

export interface NetworkStatus {
  connected: boolean;
  connectionType: ConnectionType;
}

type Unsubscribe = () => void;

export const NetworkService = {
  async getStatus(): Promise<NativeResult<NetworkStatus>> {
    if (!isNative()) {
      const connected = typeof navigator !== "undefined" ? navigator.onLine : true;
      return ok({ connected, connectionType: connected ? "unknown" : "none" });
    }
    return safeCall("Network.getStatus", async () => {
      const { Network } = await import("@capacitor/network");
      const s = await Network.getStatus();
      return {
        connected: s.connected,
        connectionType: (s.connectionType ?? "unknown") as ConnectionType,
      };
    });
  },

  onChange(cb: (status: NetworkStatus) => void): Unsubscribe {
    if (!isNative()) {
      if (typeof window === "undefined") return () => {};
      const emit = () =>
        cb({
          connected: navigator.onLine,
          connectionType: navigator.onLine ? "unknown" : "none",
        });
      window.addEventListener("online", emit);
      window.addEventListener("offline", emit);
      return () => {
        window.removeEventListener("online", emit);
        window.removeEventListener("offline", emit);
      };
    }
    let handle: { remove: () => Promise<void> } | null = null;
    void import("@capacitor/network").then(({ Network }) => {
      Network.addListener("networkStatusChange", (s) => {
        cb({
          connected: s.connected,
          connectionType: (s.connectionType ?? "unknown") as ConnectionType,
        });
      }).then((h) => {
        handle = h;
      });
    });
    return () => {
      void handle?.remove();
    };
  },
};
