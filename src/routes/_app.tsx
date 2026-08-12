import { Outlet, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { cn } from "@/lib/utils";

import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarRight } from "@/components/app-sidebar-right";
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
    <div className="relative min-h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* 
        AppShell Principal (3 Colunas real via Grid)
        [ SIDEBAR ESQUERDA ] [ CONTEÚDO CENTRAL ] [ SIDEBAR DIREITA ]
      */}
      <div 
        className="grid min-h-screen w-full transition-all duration-300"
        style={{
          gridTemplateColumns: `var(--sidebar-left-width, ${isExpanded ? '16rem' : '5rem'}) 1fr var(--sidebar-right-width, 20rem)`,
        }}
      >
        {/* SIDEBAR ESQUERDA */}
        <AppSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

        {/* CONTEÚDO PRINCIPAL (Central) */}
        <div className="relative flex flex-col min-w-0 h-screen overflow-hidden border-x border-border/40">
          <ImpersonationBanner />
          <MustChangePasswordGuard />
          <TopBar />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
            <BrandWatermark />
            
            {/* Ambient Background */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
              <Suspense fallback={null}>
                <SoftParticles />
              </Suspense>
            </div>

            <div className="content-in h-full relative z-10">
              <Outlet />
            </div>

            <WatermarkFooter />
          </main>
          
          <NetworkStatusWatcher />
          <PushBootstrapper />
        </div>

        {/* SIDEBAR DIREITA (Painel Contextual) */}
        <AppSidebarRight />
      </div>

      <FirePromosButton />
      <WhatsappZapButton />
      <InstagramFollowButton />
      <InnerPillMenu />
      <MobileBottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
