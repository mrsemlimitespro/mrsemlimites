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
  LayoutGrid,
  Zap,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  CreditCard,
  History,
  Package,
  Users2,
  FileText,
  Boxes,
  Lock,
  Terminal,
  Activity,
  CreditCard as PaymentIcon,
  Webhook,
  ShoppingCart, 
  TrendingUp, 
  Trophy
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserRole";


import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

// Grupos atualizados conforme referência oficial
const GROUPS = {
  GERAL: "Visão Geral",
  COMERCIAL: "Comercial",
  REVENDA: "Revenda",
  CONTEUDO: "Conteúdo",
  OPERACAO: "Operação",
  SISTEMA: "Sistema",
};

// Mapeamento de itens por permissão
const getAllItems = (role: string | null): NavItem[] => {
  const items: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: GROUPS.GERAL },
  ];

  if (role === "admin" || isPrivilegedRole(role)) {
    items.push(
      { title: "Produtos", url: "/dashboard", icon: Package, group: GROUPS.COMERCIAL },
      { title: "Extensões", url: "/dashboard", icon: Boxes, group: GROUPS.COMERCIAL },
      { title: "Planos", url: "/dashboard", icon: FileText, group: GROUPS.COMERCIAL },
      { title: "Clientes", url: "/clientes", icon: Users2, group: GROUPS.COMERCIAL },
      { title: "Revendedores", url: "/admin/revendedores-gestao", icon: Store, group: GROUPS.COMERCIAL },
      { title: "Licenças", url: "/licencas", icon: KeyRound, group: GROUPS.COMERCIAL },
      { title: "Dispositivos", url: "/dashboard", icon: Terminal, group: GROUPS.COMERCIAL },
      { title: "Pedidos", url: "/dashboard", icon: ShoppingCart, group: GROUPS.COMERCIAL },
      { title: "Vendas", url: "/dashboard", icon: TrendingUp, group: GROUPS.COMERCIAL },
      
      { title: "Créditos", url: "/creditos", icon: Coins, group: GROUPS.REVENDA },
      { title: "Ranking", url: "/dashboard", icon: Trophy, group: GROUPS.REVENDA },
      { title: "API", url: "/admin/api-dashboard", icon: Server, group: GROUPS.REVENDA },

      { title: "Prompts IA", url: "/prompts", icon: Wand2, group: GROUPS.CONTEUDO },
      { title: "Agentes IA", url: "/agents", icon: Bot, group: GROUPS.CONTEUDO },

      { title: "Trials", url: "/licencas", icon: Zap, group: GROUPS.OPERACAO },
      { title: "Downloads", url: "/baixar-extensao", icon: Download, group: GROUPS.OPERACAO },
      { title: "Versões", url: "/dashboard", icon: History, group: GROUPS.OPERACAO },
      { title: "Pagamentos", url: "/dashboard", icon: PaymentIcon, group: GROUPS.OPERACAO },
      { title: "Webhooks", url: "/dashboard", icon: Webhook, group: GROUPS.OPERACAO },
    );
  }

  if (role === "admin") {
    items.push(
      { title: "Segurança", url: "/admin/configuracoes", icon: Lock, group: GROUPS.SISTEMA },
      { title: "Logs", url: "/admin/api-dashboard", icon: Activity, group: GROUPS.SISTEMA },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings, group: GROUPS.SISTEMA },
    );
  }

  // Cliente final
  if (role === "cliente") {
    items.push(
      { title: "Treinamentos", url: "/aulas", icon: GraduationCap, group: GROUPS.GERAL },
      { title: "Downloads", url: "/baixar-extensao", icon: Download, group: GROUPS.OPERACAO },
    );
  }

  return items;
};

// ShoppingCart, TrendingUp, Trophy já importados acima

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
  const [userName, setUserName] = useState<string | null>(null);
  const authed = useIsAuthed();
  const role = useUserRole();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setUserName(data.user?.user_metadata?.nome ?? null);
    });
  }, []);

  const navItems = getAllItems(role as UserRole);

  // Group items
  const groupedItems = navItems.reduce((acc, item) => {
    const group = item.group || GROUPS.GERAL;
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        aria-label="Navegação principal"
        className={cn(
          "relative z-40 flex flex-col transition-all duration-300 ease-in-out shrink-0 bg-background/95 backdrop-blur-xl",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        {/* Header & Logo Premium */}
        <div className={cn("flex items-center px-4 pt-8 mb-8 overflow-hidden transition-all duration-300", isExpanded ? "h-20" : "h-16 justify-center")}>
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo 
              className={cn("transition-all duration-300 drop-shadow-[0_0_15px_rgba(0,107,255,0.3)]", isExpanded ? "w-40 h-10" : "w-10 h-10")} 
            />
          </Link>
        </div>

        {/* User Profile Summary (topo da sidebar conforme referência) */}
        <div className={cn("px-4 mb-8 transition-all duration-300", !isExpanded && "px-2")}>
           <div className={cn(
             "flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-border/40 overflow-hidden transition-all duration-300",
             !isExpanded && "justify-center border-transparent bg-transparent"
           )}>
              <div className="shrink-0 size-10 rounded-xl bg-gradient-primary p-0.5 shadow-lg shadow-primary/20">
                 <div className="h-full w-full rounded-[0.6rem] bg-black grid place-items-center">
                    <UserRound className="size-5 text-white/80" />
                 </div>
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0 animate-in fade-in duration-500">
                   <span className="text-xs font-bold text-foreground truncate">{userName?.split(' ')[0] || "Usuário"}</span>
                   <span className="text-[10px] text-muted-foreground/80 truncate">{role === 'admin' ? 'Administrador' : 'Parceiro'}</span>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-tighter">Online</span>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-6 pb-8 scrollbar-none">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="space-y-1">
              {isExpanded && (
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
                  {group}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <NavItemLink 
                    key={item.title + item.url} 
                    item={item} 
                    active={isActive(item.url)} 
                    isExpanded={isExpanded} 
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer (Conforme referência) */}
        <div className="mt-auto border-t border-border/40 p-3 space-y-2 bg-black/20">
           {isExpanded && (
             <div className="flex items-center gap-3 px-3 py-4 mb-2">
                <div className="size-8 rounded-lg overflow-hidden shrink-0">
                  <BrandLogo className="w-full h-full opacity-60" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black tracking-widest text-foreground/40 italic">MR SEM LIMITES</span>
                   <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-tighter">Version 2.3.4 Build 882</span>
                </div>
             </div>
           )}

           <button
             onClick={() => setLogoutOpen(true)}
             className={cn(
               "flex w-full items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-red-400/60 hover:text-red-400 hover:bg-red-500/5",
               !isExpanded && "justify-center"
             )}
           >
             <LogOut className="size-5" />
             {isExpanded && <span className="text-sm font-bold">Sair do Sistema</span>}
           </button>

           <button
             onClick={() => setIsExpanded(!isExpanded)}
             className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-all"
           >
             {isExpanded ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
             {isExpanded && <span className="text-sm font-medium">Recolher</span>}
           </button>
        </div>
      </aside>

      <LogoutIncentiveDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </TooltipProvider>
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
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative",
        active 
          ? "bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(0,107,255,0.1)] border border-primary/20" 
          : "text-muted-foreground/70 hover:text-foreground hover:bg-white/5 border border-transparent"
      )}
    >
      <div className={cn(
        "shrink-0 size-9 grid place-items-center rounded-lg transition-all duration-300",
        active 
          ? "bg-primary text-white shadow-[0_0_15px_rgba(0,107,255,0.4)]" 
          : "bg-surface/50 text-muted-foreground/60 group-hover:bg-surface group-hover:text-foreground"
      )}>
        <Icon className={cn("size-5 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
      </div>
      
      {isExpanded && (
        <span className={cn(
          "text-sm font-bold tracking-tight transition-all duration-300 animate-in fade-in slide-in-from-left-2",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {item.title}
        </span>
      )}

      {active && isExpanded && (
        <div className="ml-auto">
          <ChevronRight className="size-3 opacity-50" />
        </div>
      )}
    </Link>
  );

  if (isExpanded) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="bg-primary border-primary text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xl shadow-primary/20">
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}
