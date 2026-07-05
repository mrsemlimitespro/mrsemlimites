import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  Coins,
  GraduationCap,
  Download,
  UserRound,
  LogOut,
  Sparkles,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  title: string;
  url: string;
  icon: IconType;
};

const primaryItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Licenças", url: "/licencas", icon: KeyRound },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Créditos", url: "/creditos", icon: Coins },
  { title: "Aulas", url: "/aulas", icon: GraduationCap },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all",
            "hover:bg-sidebar-accent/50",
          )}
        >
          <span className="icon-tile size-9 shrink-0">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight gradient-text">
                MR Lova
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Workspace
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {primaryItems.map((item) => (
                <NavButton key={item.title} item={item} active={isActive(item.url)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Baixar Extensão"
              className="group h-11 rounded-xl text-sm text-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              <Download className="size-[18px]" strokeWidth={2} />
              <span>Baixar Extensão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <NavButton
            item={{ title: "Perfil", url: "/perfil", icon: UserRound }}
            active={isActive("/perfil")}
          />

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              className="group h-11 rounded-xl text-sm text-foreground/70 hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut className="size-[18px]" strokeWidth={2} />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={active}
        className={cn(
          "group relative h-11 rounded-xl px-3 text-sm font-medium transition-all",
          "text-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground",
          "data-[active=true]:text-foreground data-[active=true]:bg-transparent",
        )}
      >
        <Link to={item.url}>
          {active && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl gradient-primary opacity-90 -z-10"
            />
          )}
          {active && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl glow-primary -z-10"
            />
          )}
          <Icon
            className={cn(
              "size-[18px] shrink-0 transition-colors",
              active ? "text-primary-foreground" : "text-foreground/70 group-hover:text-foreground",
            )}
            strokeWidth={2}
          />
          <span className={cn(active && "text-primary-foreground")}>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
