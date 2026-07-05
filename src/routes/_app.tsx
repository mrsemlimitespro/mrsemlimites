import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
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
      <div className="relative z-10 flex min-h-screen flex-col pt-4 pl-0 md:pl-20">
        <TopBar />
        <main className="flex-1 px-4 pb-10 pt-6 md:px-8 md:pb-12">
          <Outlet />
        </main>
      </div>
      <FirePromosButton />
    </div>
  );
}
