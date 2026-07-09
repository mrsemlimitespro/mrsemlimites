# Plano: MR Sem Limites → App Nativo Android + iOS via Capacitor

Vou transformar o projeto atual em um app nativo mantendo 100% do código web/PWA intacto. A arquitetura será híbrida: mesma base de código, dois modos de build.

## Arquitetura final

```text
┌─────────────────────────────────────────────────┐
│         SRC (código compartilhado 95%)          │
│  rotas, componentes, hooks, integração Supabase │
└──────────────┬──────────────────┬───────────────┘
               │                  │
       ┌───────▼────────┐  ┌──────▼──────────────┐
       │  BUILD: WEB    │  │  BUILD: MOBILE      │
       │  TanStack SSR  │  │  SPA estático       │
       │  Cloudflare    │  │  Capacitor          │
       │  mrsemlimites  │  │  Android + iOS      │
       │  .lovable.app  │  │  .apk / .ipa        │
       └────────────────┘  └─────────┬───────────┘
                                     │
                          Chama Server Functions
                          via HTTPS → domínio web
                          (mesma Supabase, RLS)
```

## Fases de implementação

### Fase 1 — Fundação Capacitor (esta fase)
1. Instalar Capacitor core + CLI + plugins nativos essenciais
2. Criar `capacitor.config.ts` com configuração Android/iOS
3. Criar script de build mobile (`build:mobile`) que gera SPA estático em `dist-mobile/`
4. Adicionar detecção de plataforma (`src/lib/platform.ts`): `isNative()`, `isAndroid()`, `isIOS()`, `isWeb()`
5. Criar `.env.mobile` com URL do backend web publicado
6. Ajustar `src/integrations/supabase/client.ts` para usar URL absoluta no modo mobile
7. Configurar fetch de Server Functions para apontar ao domínio publicado quando rodando no app

### Fase 2 — Recursos nativos (próximas mensagens)
Plugins Capacitor:
- `@capacitor/push-notifications` + FCM (Android) / APNs (iOS) → notificações
- `@capacitor-community/biometric-auth` → login biométrico
- `@capacitor/camera` → foto/galeria
- `@capacitor/filesystem` + `@capacitor/share` → upload/compartilhamento
- `@capacitor/preferences` → armazenamento seguro chave-valor
- `@capacitor/network` → detectar offline/online
- `@capacitor/app` + `@capacitor/status-bar` + `@capacitor/splash-screen` → UX nativa
- `@capacitor/geolocation` → GPS (opcional, sob demanda)

Hooks React que abstraem web ↔ nativo:
- `useNativeAuth()` — biometria + fallback web
- `useNativeCamera()` — camera nativa + fallback `<input type="file">`
- `useNativeShare()` — share sheet nativo + fallback Web Share API
- `useNetworkStatus()` — online/offline unificado
- `usePushNotifications()` — registro de token FCM/APNs

### Fase 3 — Offline parcial + sync
- IndexedDB via `@tanstack/query-persist-client-core` para cache persistente
- Fila de mutations offline com replay automático ao reconectar
- Realtime Supabase reconecta sozinho ao voltar online

### Fase 4 — Publicação
- Gerar ícones e splash screens (todas resoluções Android + iOS)
- Configurar `AndroidManifest.xml` (permissões, deep links)
- Configurar `Info.plist` (permissões, URL schemes)
- Preparar assets para Play Store e App Store
- Documentar processo de build/assinatura em `MOBILE.md`

## O que esta primeira entrega inclui

Apenas a **Fase 1** — fundação técnica funcional:
- Capacitor instalado e configurado
- Projeto Android criado (`android/`)
- Projeto iOS criado (`ios/`)
- Build mobile funcionando (`bun run build:mobile`)
- Detecção de plataforma
- Zero impacto no build web atual (SSR continua igual)

Ao final desta fase, você já poderá:
- Abrir Android Studio e rodar o app no emulador/dispositivo
- Ver o site inteiro rodando dentro do WebView nativo
- Chamar Server Functions do web publicado

## Decisões técnicas importantes

**Backend do app mobile aponta para o domínio publicado.** O app instalado no celular fará requests HTTPS para `https://mrsemlimites.lovable.app/_serverFn/*` e Supabase Realtime. Isso significa:
- ✅ Uma única fonte de verdade (Supabase)
- ✅ Webhooks (Cakto/Kiwify/MP) continuam funcionando no servidor web
- ✅ Sincronização em tempo real automática entre web/PWA/mobile
- ⚠️ App mobile precisa que o site esteja publicado para funcionar (o que já é o caso)

**Build separado (`dist-mobile/`).** O Vite gera um bundle SPA puro para o Capacitor empacotar. O `dist/` web continua com SSR.

**Server Functions via URL absoluta.** No modo mobile, `useServerFn` é interceptado para prefixar a URL do backend.

## Detalhes técnicos (para revisão do usuário)

Arquivos que serão criados/modificados nesta fase:
- ➕ `capacitor.config.ts` (novo)
- ➕ `src/lib/platform.ts` (novo)
- ➕ `src/lib/mobile-fetch.ts` (novo — intercepta chamadas para apontar ao domínio web)
- ➕ `.env.mobile` (novo — `VITE_MOBILE_BACKEND_URL`)
- ➕ `android/` (gerado pelo Capacitor CLI)
- ➕ `ios/` (gerado pelo Capacitor CLI)
- ➕ `MOBILE.md` (documentação)
- 🔧 `package.json` — adiciona scripts `build:mobile`, `cap:sync`, `cap:android`, `cap:ios`
- 🔧 `vite.config.ts` — modo `mobile` gera SPA em `dist-mobile/`
- 🔧 `src/routes/__root.tsx` — inicializa Capacitor plugins quando `isNative()`

**Não** vou modificar: SSR, rotas existentes, componentes, RLS, migrations, webhooks, `.env` atual.

## Próximo passo após sua aprovação

Executo a Fase 1 completa (instalação + configuração + primeiro build mobile funcional). Depois te mostro como testar no Android Studio e confirmamos antes de partir para a Fase 2 (recursos nativos).

**Confirma que posso executar a Fase 1?**
