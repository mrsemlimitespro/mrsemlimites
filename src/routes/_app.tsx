import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopBar } from "@/components/top-bar";
import { FirePromosButton } from "@/components/fire-promos-button";
import { SoftParticles } from "@/components/soft-particles";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative min-h-screen w-full">
      <SoftParticles />
      <AppSidebar />
      <div className="relative z-10 flex min-h-screen flex-col pl-0 pt-2 md:pl-20 md:pt-4">
        <TopBar />
        <main
          className="flex-1 px-3 pb-24 pt-4 md:px-8 md:pb-12 md:pt-6"
          style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        >
          <Outlet />
        </main>
      </div>
      <FirePromosButton />
      <MobileBottomNav />
    </div>
  );
}
