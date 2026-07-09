import { Outlet, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopBar } from "@/components/top-bar";
import { FirePromosButton } from "@/components/fire-promos-button";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { WatermarkFooter } from "@/components/watermark-footer";
import { PageBackButton } from "@/components/page-back-button";
import { NetworkStatusWatcher } from "@/components/network-status-watcher";

// Decorativo: canvas de partículas só monta em telas médias+ (evita CPU/bateria no mobile).
const SoftParticles = lazy(() =>
  import("@/components/soft-particles").then((m) => ({ default: m.SoftParticles })),
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Partículas só em telas >= md para preservar performance em mobile */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        <Suspense fallback={null}>
          <SoftParticles />
        </Suspense>
      </div>
      <AppSidebar />
      <div
        className="relative z-10 flex min-h-screen flex-col pl-0 pt-2 md:pl-20 md:pt-4"
        style={{
          paddingTop: "calc(0.5rem + env(safe-area-inset-top))",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <TopBar />
        <main
          className="flex-1 px-3 pt-4 md:px-8 md:pt-6"
          style={{
            paddingBottom:
              "calc(5.5rem + env(safe-area-inset-bottom))" /* espaço p/ bottom nav 56px + safe area */,
          }}
        >
          <div className="mb-3 md:mb-4">
            <PageBackButton />
          </div>
          <Outlet />
        </main>
      <NetworkStatusWatcher />
    </div>
      <FirePromosButton />
      <MobileBottomNav />
      <PwaInstallPrompt />
      <WatermarkFooter />
    </div>
  );
}

