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
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BRAND_NAME, BrandMark } from "@/components/brand";

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

const footerItems: (NavItem | { title: string; action: "extension" | "logout"; icon: IconType })[] = [
  { title: "Baixar Extensão", action: "extension", icon: Download },
  { title: "Perfil", url: "/perfil", icon: UserRound },
  { title: "Sair", action: "logout", icon: LogOut },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        aria-label="Navegação principal"
        className={cn(
          "fixed left-3 top-1/2 z-40 -translate-y-1/2",
          "flex flex-col items-center gap-1 rounded-full px-2 py-3",
          "border border-border/70 bg-surface/50 backdrop-blur-xl",
        )}
        style={{
          boxShadow:
            "0 0 0 1px oklch(1 0 0 / 4%), 0 20px 60px -20px oklch(0 0 0 / 70%), 0 0 40px -6px color-mix(in oklab, var(--brand-magenta) 45%, transparent)",
        }}
      >
        <Link
          to="/"
          aria-label={`${BRAND_NAME} — ir para o dashboard`}
          className="mb-2 transition-transform duration-200 hover:scale-105"
        >
          <BrandMark size={38} />
        </Link>

        <div className="mb-1 h-px w-6 bg-border/70" aria-hidden />

        <nav className="flex flex-col gap-1.5">
          {primaryItems.map((item) => (
            <RailButton key={item.title} item={item} active={isActive(item.url)} />
          ))}
        </nav>

        <div className="my-2 h-px w-6 bg-border/70" aria-hidden />

        <div className="flex flex-col gap-1.5">
          {footerItems.map((item) => {
            if ("url" in item) {
              return <RailButton key={item.title} item={item} active={isActive(item.url)} />;
            }
            return (
              <RailAction
                key={item.title}
                title={item.title}
                icon={item.icon}
                variant={item.action === "logout" ? "danger" : "muted"}
              />
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function RailButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.url}
          aria-label={item.title}
          onClick={() => playSfx("click")}
          className={cn(
            "group relative grid size-11 place-items-center rounded-full transition-all duration-200",
            "text-foreground/60 hover:text-foreground",
            active && "text-primary-foreground",
          )}
        >
          {active && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full gradient-primary"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "0 0 0 1px color-mix(in oklab, var(--primary) 60%, transparent), 0 0 24px -2px color-mix(in oklab, var(--primary) 85%, transparent)",
                }}
              />
            </>
          )}
          <Icon className="relative z-10 size-[18px]" strokeWidth={2} />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}

function RailAction({
  title,
  icon: Icon,
  variant = "muted",
}: {
  title: string;
  icon: IconType;
  variant?: "muted" | "danger";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={title}
          className={cn(
            "grid size-11 place-items-center rounded-full transition-all duration-200",
            "text-foreground/55 hover:text-foreground hover:bg-white/5",
            variant === "danger" && "hover:text-destructive hover:bg-destructive/10",
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {title}
      </TooltipContent>
    </Tooltip>
  );
}
