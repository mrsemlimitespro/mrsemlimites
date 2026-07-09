/**
 * Inicialização de plugins nativos Capacitor.
 *
 * Chamado uma única vez no `__root.tsx` dentro de `useEffect` — só executa
 * quando o app está rodando dentro do WebView do Capacitor. No navegador
 * web/PWA é no-op.
 */
import { isNative, isAndroid } from "@/lib/platform";

let initialized = false;

export async function initNativePlatform(): Promise<void> {
  if (initialized) return;
  if (!isNative()) return;
  initialized = true;

  try {
    // Splash screen — esconde após o app hidratar
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    console.warn("[native] splash screen falhou:", err);
  }

  try {
    // Status bar — cor e estilo consistente com o tema dark
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: "#0a0a0f" });
    }
  } catch (err) {
    console.warn("[native] status bar falhou:", err);
  }

  try {
    // Handler do botão "voltar" do Android — evita fechar o app sem querer
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn("[native] app listener falhou:", err);
  }
}
