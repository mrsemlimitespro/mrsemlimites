# 📱 MR Sem Limites — App Nativo (Android + iOS)

App nativo construído com **Capacitor 8**, reaproveitando 100% do código web.

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────┐
│  Código-fonte único (src/)               │
│  Rotas, componentes, Supabase, hooks     │
└──────────┬──────────────────┬────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────────┐
    │  WEB / PWA  │    │  APP NATIVO     │
    │  SSR ativo  │    │  Capacitor      │
    │  Cloudflare │    │  Android + iOS  │
    └─────────────┘    └────────┬────────┘
                                │
                    HTTPS → mrsemlimites.lovable.app
                    (mesma Supabase, mesmo Realtime)
```

O app nativo carrega o site publicado dentro de um WebView e **acrescenta**
recursos nativos (push, biometria, câmera, etc). Isso é aceito pelas lojas
porque o app entrega funcionalidades além do navegador — não é um webview puro.

---

## ⚙️ Pré-requisitos (fazer no seu computador local)

O sandbox do Lovable não roda Android Studio nem Xcode. Você precisa clonar
o projeto localmente para os passos abaixo.

- **Node.js** 20+ e **bun** (`npm i -g bun`)
- **Android**: [Android Studio](https://developer.android.com/studio) + JDK 17
- **iOS** (só em macOS): [Xcode](https://developer.apple.com/xcode/) + CocoaPods (`sudo gem install cocoapods`)

---

## 🚀 Primeiro setup (rodar UMA vez)

```bash
# 1. Instalar dependências
bun install

# 2. Adicionar plataforma Android
npx cap add android

# 3. Adicionar plataforma iOS (só em macOS)
npx cap add ios
```

Isso cria as pastas `android/` e `ios/` com os projetos nativos.

---

## 🔨 Fluxo de desenvolvimento

Como o `capacitor.config.ts` está configurado com `server.url` apontando
para `https://mrsemlimites.lovable.app`, o app já busca a versão publicada
— **basta abrir o Android Studio / Xcode**.

```bash
# Abrir projeto Android no Android Studio
bun run cap:android

# Abrir projeto iOS no Xcode (macOS)
bun run cap:ios

# Ou rodar direto num emulador/dispositivo
bun run cap:run:android
bun run cap:run:ios
```

Após qualquer mudança em `capacitor.config.ts` ou nos plugins Capacitor,
sincronize:

```bash
bun run cap:sync
```

---

## 🌐 Como funciona o backend no mobile

- **Supabase**: usa a mesma URL/chave publicáveis do `.env` → RLS, Realtime, Auth funcionam idêntico.
- **Server Functions**: são chamadas via HTTPS no domínio publicado
  (`https://mrsemlimites.lovable.app/_serverFn/*`) porque o app carrega o
  site direto de lá.
- **Webhooks (Cakto / Kiwify / MercadoPago)**: continuam no servidor web —
  o app não precisa deles.

---

## 🔐 Publicação nas lojas

### Google Play Store

1. Em `android/app/build.gradle` ajuste `applicationId`, `versionCode`, `versionName`.
2. Gerar keystore de assinatura:
   ```bash
   keytool -genkey -v -keystore mrsemlimites.keystore -alias mrsemlimites -keyalg RSA -keysize 2048 -validity 10000
   ```
3. No Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**
4. Upload no [Google Play Console](https://play.google.com/console).

### Apple App Store

1. Em Xcode, configure **Bundle Identifier** (`app.lovable.mrsemlimites`) e **Team**.
2. Product → Archive → Distribute App → App Store Connect.
3. Complete a listagem no [App Store Connect](https://appstoreconnect.apple.com).

---

## 📦 Plugins nativos instalados (Fase 1)

| Plugin | Uso |
|---|---|
| `@capacitor/app` | Botão voltar Android, lifecycle |
| `@capacitor/status-bar` | Estilo da barra de status |
| `@capacitor/splash-screen` | Tela de abertura |
| `@capacitor/preferences` | Storage chave-valor seguro |
| `@capacitor/network` | Detecção online/offline |

### Próximas fases (a implementar)

- **Fase 2**: Push notifications (FCM/APNs), biometria, câmera, share, geolocation
- **Fase 3**: Offline parcial + fila de sync via IndexedDB
- **Fase 4**: Ícones, splash screens, deep links, assets das lojas

---

## 🎯 Detecção de plataforma no código

```tsx
import { isNative, isAndroid, isIOS, isWeb } from "@/lib/platform";

// Renderiza câmera nativa no app, <input type="file"> no web
{isNative() ? <NativeCameraButton /> : <WebFileInput />}
```

---

## ❓ Alternar entre modo "online" e "offline empacotado"

Por padrão o app carrega o site publicado. Para gerar um build 100% offline
(bundle embutido no APK/IPA), edite `capacitor.config.ts`:

```ts
server: {
  // url: "https://mrsemlimites.lovable.app",  ← comente esta linha
  androidScheme: "https",
  iosScheme: "https",
}
```

E aponte `webDir` para uma pasta com o bundle SPA. Isso será implementado na
Fase 3 (offline parcial).

---

## 🆘 Suporte

Cada nova feature nativa é implementada em fases. Peça o que precisar:
- "Ativar notificações push"
- "Adicionar login por biometria"
- "Habilitar câmera para upload"
- "Gerar ícones e splash para publicação"
