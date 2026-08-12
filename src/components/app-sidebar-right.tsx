import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { 
  User, 
  Wallet, 
  Zap, 
  KeyRound, 
  ShoppingCart, 
  Trophy,
  Crown,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Package
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AppSidebarRight() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const authed = useIsAuthed();
  const role = useUserRole();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setUserName(data.user?.user_metadata?.nome ?? null);
    });
  }, []);

  const roleLabel = (() => {
    if (role === "admin") return "Ultra Administrador";
    if (role === "revendedor") return "Revendedor Parceiro";
    return "Cliente Premium";
  })();

  const isAdmin = role === "admin";

  return (
    <aside className="hidden lg:flex flex-col w-[20rem] h-screen bg-surface/30 backdrop-blur-xl border-l border-border/40 overflow-y-auto scrollbar-none p-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Perfil & Identidade */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="size-20 rounded-[1.5rem] bg-gradient-primary p-0.5 shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full rounded-[1.4rem] bg-black grid place-items-center overflow-hidden">
               <User className="size-10 text-white/80" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 size-6 rounded-lg bg-emerald-500 border-4 border-background grid place-items-center shadow-lg" title="Online">
             <div className="size-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight flex items-center justify-center gap-2">
            {userName?.split(' ')[0] || "Usuário"} {isAdmin && <Crown className="size-4 text-amber-400" />}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">{roleLabel}</p>
        </div>
      </div>

      {/* Identificação Administrativa */}
      {isAdmin && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-black border border-border/40 p-2 overflow-hidden">
                <BrandLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Operação</span>
                <span className="text-xs font-bold">MR SEM LIMITES</span>
              </div>
           </div>
           <div className="flex items-center justify-between pt-2 border-t border-primary/10">
              <span className="text-[10px] text-muted-foreground">Status do Sistema</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Online</span>
           </div>
        </div>
      )}

      {/* Saldo de Créditos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Saldo de Créditos</h4>
          <Wallet className="size-3 text-muted-foreground/40" />
        </div>
        <div className="rounded-2xl border border-border/40 bg-surface-elevated/50 p-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground/60">Disponível para uso</span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight">R$ 0,00</span>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
            <ShoppingCart className="size-3.5" />
            Comprar Créditos
          </button>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ações Rápidas</h4>
        <div className="grid gap-2">
          <QuickActionLink icon={KeyRound} label="Gerar Licença" to="/licencas" />
          <QuickActionLink icon={Package} label="Minhas Licenças" to="/licencas" />
          <QuickActionLink icon={TrendingUp} label="Vendas" to="/dashboard" />
          <QuickActionLink icon={Trophy} label="Ranking Semanal" to="/dashboard" />
        </div>
      </div>

      {/* Informações */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Informações da Conta</h4>
        <div className="space-y-3">
          <InfoRow label="Plano Atual" value="Ultra Premium" />
          <InfoRow label="Validade" value="Vitalício" />
          <InfoRow label="Licenças Ativas" value="0" />
          <InfoRow label="Limite de Licenças" value="Ilimitado" />
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center space-y-3">
           <Zap className="size-6 text-primary mx-auto" />
           <div className="space-y-1">
             <p className="text-xs font-bold text-foreground">Seja um Revendedor</p>
             <p className="text-[10px] text-muted-foreground">Aumente seus ganhos revendendo nossas licenças.</p>
           </div>
           <button className="w-full py-2 rounded-lg bg-surface border border-primary/30 text-primary text-[10px] font-bold hover:bg-primary/5 transition-colors">
              Quero ser revendedor
           </button>
        </div>
      </div>
    </aside>
  );
}

function QuickActionLink({ icon: Icon, label, to }: { icon: any, label: string, to: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-primary/20 hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      </div>
      <ChevronRight className="size-3 text-muted-foreground/40 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-bold text-foreground/80">{value}</span>
    </div>
  );
}
