import { Outlet, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { cn } from "@/lib/utils";

import { AppSidebar } from "@/components/app-sidebar";
import { InnerPillMenu } from "@/components/inner-pill-menu";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopBar } from "@/components/top-bar";
import { FirePromosButton } from "@/components/fire-promos-button";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { WatermarkFooter } from "@/components/watermark-footer";
import { BrandWatermark } from "@/components/brand-watermark";
import { PageBackButton } from "@/components/page-back-button";

import { NetworkStatusWatcher } from "@/components/network-status-watcher";
import { PushBootstrapper } from "@/components/push-bootstrapper";
import { WhatsappZapButton } from "@/components/whatsapp-zap-button";
import { InstagramFollowButton } from "@/components/instagram-follow-button";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { MustChangePasswordGuard } from "@/components/must-change-password-guard";

// Decorativo: canvas de partículas só monta em telas médias+ (evita CPU/bateria no mobile).
const SoftParticles = lazy(() =>
  import("@/components/soft-particles").then((m) => ({ default: m.SoftParticles })),
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="relative min-h-screen w-full flex bg-background">
      <BrandWatermark />
      
      {/* Partículas só em telas >= md para preservar performance em mobile */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        <Suspense fallback={null}>
          <SoftParticles />
        </Suspense>
      </div>

      <AppSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <ImpersonationBanner />
        <MustChangePasswordGuard />
        <TopBar />
        
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          style={{
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="content-in h-full">
            <Outlet />
          </div>
        </main>
        
        <NetworkStatusWatcher />
        <PushBootstrapper />
      </div>

      <FirePromosButton />
      <WhatsappZapButton />
      <InstagramFollowButton />
      <InnerPillMenu />
      <MobileBottomNav />
      <PwaInstallPrompt />
      <WatermarkFooter />
    </div>
  );
}

