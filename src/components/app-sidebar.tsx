import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  Coins,
  GraduationCap,
  Download,
  UserRound,
  LogOut,
  LogIn,
  Bot,
  Wand2,
  Store,
  Server,
  Settings,
  ChevronRight,
  ChevronLeft,
  Search,
  LayoutGrid,
  Zap,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  CreditCard,
  History,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BRAND_NAME } from "@/components/brand";
import { BrandLogo } from "@/components/brand-logo";

import { LogoutIncentiveDialog } from "@/components/logout-incentive-dialog";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { useUserRole, isPrivilegedRole } from "@/hooks/useUserRole";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  title: string;
  url: string;
  icon: IconType;
  group?: string;
};

// Groups
const GROUPS = {
  VISAO_GERAL: "VISÃO GERAL",
  COMERCIAL: "COMERCIAL",
  REVENDA: "REVENDA",
  CONTEUDO: "CONTEÚDO",
  OPERACAO: "OPERAÇÃO",
  SISTEMA: "SISTEMA",
};

// Itens base (Admin e Revendedores)
const baseItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: GROUPS.VISAO_GERAL },
  { title: "Minhas Licenças", url: "/licencas", icon: KeyRound, group: GROUPS.COMERCIAL },
  { title: "Vincular Cliente", url: "/clientes", icon: Users, group: GROUPS.COMERCIAL },
  { title: "Quero Revender", url: "/revendedor", icon: Store, group: GROUPS.REVENDA },
  { title: "Saldo & Créditos", url: "/creditos", icon: Coins, group: GROUPS.REVENDA },
  { title: "Treinamentos", url: "/aulas", icon: GraduationCap, group: GROUPS.CONTEUDO },
  { title: "Biblioteca Pro", url: "/prompts", icon: Wand2, group: GROUPS.CONTEUDO },
  { title: "Histórico", url: "/historico", icon: History, group: GROUPS.OPERACAO },
];

// Admin Only
const adminItems: NavItem[] = [
  { title: "Infraestrutura", url: "/admin", icon: Server, group: GROUPS.SISTEMA },
  { title: "Gestão Global", url: "/admin/revendedores-gestao", icon: ShieldCheck, group: GROUPS.SISTEMA },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings, group: GROUPS.SISTEMA },
];

// Cliente (Simplified)
const clienteItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: GROUPS.VISAO_GERAL },
  { title: "Treinamentos", url: "/aulas", icon: GraduationCap, group: GROUPS.CONTEUDO },
];

type FooterItem = NavItem | { title: string; action: "logout"; icon: IconType };

const authedFooterItems: FooterItem[] = [
  { title: "Downloads", url: "/baixar-extensao", icon: Download },
  { title: "Minha Conta", url: "/perfil", icon: UserRound },
  { title: "Encerrar Sessão", action: "logout", icon: LogOut },
];

const anonFooterItems: FooterItem[] = [{ title: "Acessar Conta", url: "/login", icon: LogIn }];

export function AppSidebar({ 
  isExpanded, 
  setIsExpanded 
}: { 
  isExpanded: boolean; 
  setIsExpanded: (v: boolean) => void 
}) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);
  
  
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const authed = useIsAuthed();
  const role = useUserRole();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setUserEmail(s?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const navItems: NavItem[] = (() => {
    if (!authed) return [];
    if (role === "admin") return [...baseItems, ...adminItems];
    if (role === "revendedor") return baseItems;
    if (role === "cliente") return clienteItems;
    return [];
  })();

  const footerItems: FooterItem[] = authed === true ? authedFooterItems : anonFooterItems;

  // Group items
  const groupedItems = navItems.reduce((acc, item) => {
    const group = item.group || GROUPS.VISAO_GERAL;
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <aside
          aria-label="Navegação principal"
          className={cn(
            "relative z-40 hidden md:flex flex-col transition-all duration-300 ease-in-out shrink-0",
            "border-r border-white/5 bg-[#03050B]",
            isExpanded ? "w-[204px]" : "w-20"
          )}
        >
          {/* Header & Logo */}
          <div className="flex h-16 items-center px-4 mb-2 overflow-hidden">
            <Link to="/" className="flex items-center gap-3 w-full">
              <BrandLogo 
                className={cn("transition-all duration-300", isExpanded ? "w-40 h-10" : "w-12 h-10")} 
              />
            </Link>
          </div>


          {/* User Badge / Role Indicator */}
          <div className="px-3 mb-6">
            <PanelBadge authed={authed} role={role} isExpanded={isExpanded} />
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2 scrollbar-none">
            {Object.entries(groupedItems).map(([group, items]) => (
              <div key={group} className="space-y-1">
                {isExpanded && (
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E99B5]/60 mb-2">
                    {group}
                  </h3>
                )}
                <div className="space-y-1">
                  {items.map((item) => (
                    <NavItemLink 
                      key={item.url} 
                      item={item} 
                      active={isActive(item.url)} 
                      isExpanded={isExpanded} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Items */}
          <div className="mt-auto border-t border-border/40 p-3 space-y-1 bg-surface/30">
            {footerItems.map((item) => {
              if ("url" in item) {
                return (
                  <NavItemLink 
                    key={item.url} 
                    item={item} 
                    active={isActive(item.url)} 
                    isExpanded={isExpanded} 
                  />
                );
              }
              return (
                <ActionLink 
                  key={item.title} 
                  item={item} 
                  isExpanded={isExpanded}
                  onClick={() => setLogoutOpen(true)}
                  userEmail={userEmail}
                />
              );
            })}

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mt-2"
            >
              {isExpanded ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
              {isExpanded && <span className="text-sm font-medium">Recolher menu</span>}
            </button>
          </div>
        </aside>
      </TooltipProvider>
      <LogoutIncentiveDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}

function NavItemLink({ item, active, isExpanded }: { item: NavItem; active: boolean; isExpanded: boolean }) {
  const Icon = item.icon;
  const content = (
    <Link
      to={item.url}
      aria-label={item.title}
      onClick={() => playSfx("swipe")}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
        active 
          ? "bg-gradient-to-r from-brand-blue to-brand-violet text-white neon-glow-blue" 
          : "text-[#8E99B5] hover:text-white hover:bg-white/5"
      )}
    >
      <div className={cn(
        "shrink-0 size-9 grid place-items-center rounded-lg transition-all duration-300",
        active ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-surface text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground"
      )}>
        <Icon className="size-5" />
      </div>
      
      <span className={cn(
        "text-sm font-medium whitespace-nowrap transition-all duration-300",
        !isExpanded && "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        {item.title}
      </span>

      {active && (
        <span className="absolute right-0 top-0 h-full w-1 bg-primary rounded-l-full shadow-[0_0_12px_var(--primary)]" />
      )}
    </Link>
  );

  if (isExpanded) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="font-medium">
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}

function ActionLink({ item, isExpanded, onClick, userEmail }: { item: any, isExpanded: boolean, onClick: () => void, userEmail?: string | null }) {
  const Icon = item.icon;
  const isLogout = item.action === "logout";

  const content = (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        isLogout 
          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <div className={cn(
        "shrink-0 size-9 grid place-items-center rounded-lg transition-all duration-300",
        isLogout ? "bg-red-500/10" : "bg-surface"
      )}>
        <Icon className="size-5" />
      </div>
      
      <span className={cn(
        "text-sm font-medium whitespace-nowrap transition-all duration-300",
        !isExpanded && "opacity-0 -translate-x-4 pointer-events-none"
      )}>
        {item.title}
      </span>
    </button>
  );

  if (isExpanded) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="flex flex-col gap-0.5">
        <span className="font-medium">{item.title}</span>
        {isLogout && userEmail && <span className="text-[10px] opacity-60 font-normal">{userEmail}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

function PanelBadge({ authed, role, isExpanded }: { authed: boolean | null, role: string | null, isExpanded: boolean }) {
  const cfg = (() => {
    if (authed !== true) return { emoji: "🌐", label: "Visitante", color: "gray" as const };
    if (role === "admin") return { emoji: "⭐", label: "Ultra Administrador", color: "amber" as const };
    if (role === "revendedor") return { emoji: "🏪", label: "Revendedor", color: "blue" as const };
    if (role === "cliente") return { emoji: "👤", label: "Cliente", color: "emerald" as const };
    return { emoji: "•", label: "Conectando...", color: "gray" as const };
  })();

  const colors = {
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const activeColorClass = colors[cfg.color];

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-3 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300",
      !isExpanded && "px-2 py-2 justify-center border-transparent bg-transparent"
    )}>
      <div className={cn(
        "shrink-0 size-10 grid place-items-center rounded-full text-lg shadow-lg",
        activeColorClass,
        cfg.color === 'amber' && "bg-gradient-to-br from-brand-yellow to-brand-orange text-white border-transparent"
      )}>
        {cfg.emoji === '⭐' ? <div className="text-xl">👤</div> : cfg.emoji}
      </div>
      <div className={cn(
        "flex flex-col min-w-0 transition-all duration-300",
        !isExpanded && "opacity-0 w-0 pointer-events-none"
      )}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E99B5]">MARIO ROGERIO</span>
        <span className="text-xs font-bold truncate flex items-center gap-1">
          {cfg.label}
          {cfg.color === 'amber' && <span className="text-brand-yellow">👑</span>}
        </span>
      </div>
    </div>
  );
}
