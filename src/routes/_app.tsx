import { Outlet, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Rocket,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { BrandWatermark } from "@/components/brand-watermark";
import { BrandLogo } from "@/components/brand-logo";
import { FirePromosButton } from "@/components/fire-promos-button";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { InnerPillMenu } from "@/components/inner-pill-menu";
import { InstagramFollowButton } from "@/components/instagram-follow-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MustChangePasswordGuard } from "@/components/must-change-password-guard";
import { NetworkStatusWatcher } from "@/components/network-status-watcher";
import { PageBackButton } from "@/components/page-back-button";
import { PushBootstrapper } from "@/components/push-bootstrapper";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { TopBar } from "@/components/top-bar";
import { WatermarkFooter } from "@/components/watermark-footer";
import { WhatsappZapButton } from "@/components/whatsapp-zap-button";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { useUserRole } from "@/hooks/useUserRole";


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
    <div className="relative min-h-screen w-full flex bg-[#03050B] text-[#F3F6FF]">
      <BrandWatermark />
      
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        <Suspense fallback={null}>
          <SoftParticles />
        </Suspense>
      </div>

      {/* Sidebar Esquerda (204px fixa no desktop) */}
      <AppSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Área Central (flexível) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <ImpersonationBanner />
        <MustChangePasswordGuard />
        <TopBar />
        
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none"
          style={{
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="content-in h-full">
            <Outlet />
          </div>
          
          <WatermarkFooter />
        </main>
        
        <NetworkStatusWatcher />
        <PushBootstrapper />
      </div>

      {/* Sidebar Direita Contextual (238px fixa no desktop) */}
      <aside className="hidden xl:flex w-[238px] flex-col border-l border-white/5 bg-[#03050B]/50 backdrop-blur-xl shrink-0 h-screen overflow-y-auto scrollbar-none">
        <RightContextSidebar />
      </aside>

      <FirePromosButton />
      <WhatsappZapButton />
      <InstagramFollowButton />
      <InnerPillMenu />
      <MobileBottomNav />
      <PwaInstallPrompt />
    </div>
  );
}

function RightContextSidebar() {
  const role = useUserRole();
  const authed = useIsAuthed();
  
  return (
    <div className="flex flex-col gap-6 p-4 py-6">
      {/* Perfil Header */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
        <div className="size-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet grid place-items-center text-lg shadow-lg shadow-brand-blue/20">
          MR
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold truncate">MARIO ROGERIO</span>
            <span className="text-brand-yellow">👑</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ultra Administrador</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Conta Administrativa */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-1">Conta Administrativa</h3>
          <div className="glass-strong rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-xl bg-white/5 p-2 overflow-hidden flex items-center justify-center">
               <BrandLogo className="w-full h-full" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold">MR SEM LIMITES</p>
              <p className="text-[10px] text-muted-foreground">Ativo desde 10/09/2024</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20">
               <span className="size-1.5 rounded-full bg-brand-emerald animate-pulse" />
               <span className="text-[10px] font-black text-brand-emerald uppercase">Online</span>
            </div>
          </div>
        </section>

        {/* Saldo de Créditos */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-1">Saldo de Créditos</h3>
          <div className="glass-strong rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-2xl font-black tracking-tight text-white">R$ 30,00</div>
            <button className="w-full h-10 rounded-xl bg-brand-blue text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all">
               <CreditCard className="size-4" /> Comprar Créditos
            </button>
          </div>
        </section>

        {/* Ações Rápidas */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-1">Ações Rápidas</h3>
          <div className="space-y-2">
            {[
              { label: "Gerar Licença", icon: KeyRound, color: "text-brand-cyan" },
              { label: "Minhas Licenças", icon: LayoutDashboard, color: "text-brand-violet" },
              { label: "Vendas", icon: CreditCard, color: "text-brand-red" },
              { label: "Ranking Semanal", icon: BarChart3, color: "text-brand-yellow" },
            ].map((action) => (
              <button key={action.label} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <action.icon className={cn("size-4", action.color)} />
                  <span className="text-xs font-bold">{action.label}</span>
                </div>
                <ChevronRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </section>

        {/* Informações */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-1">Informações</h3>
           <div className="glass-strong rounded-2xl p-4 space-y-3">
              <InfoRow label="Plano Atual" value="Ultra Premium" />
              <InfoRow label="Validade" value="Vitalício" />
              <InfoRow label="Licenças Ativas" value="1.350" />
              <InfoRow label="Limite" value="Ilimitado" />
           </div>
        </section>

        {/* Promo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet p-4 shadow-xl shadow-brand-blue/20">
           <div className="absolute -right-2 -bottom-2 opacity-20 rotate-12">
              <Rocket className="size-20 text-white" />
           </div>
           <div className="relative z-10 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider">Seja um Revendedor</h4>
                <p className="text-[10px] opacity-80 leading-relaxed">Aumente seus ganhos revendendo nossas licenças exclusivas.</p>
              </div>
              <Link 
                to="/quero-ser-revendedor"
                className="w-full h-9 rounded-lg bg-white text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                Quero ser revendedor
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{label}</span>
      <span className="text-[11px] font-bold">{value}</span>
    </div>
  );
}


