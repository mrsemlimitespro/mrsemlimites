import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  Coins,
  GraduationCap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const items: { title: string; url: string; icon: IconType }[] = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "Licenças", url: "/licencas", icon: KeyRound },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Créditos", url: "/creditos", icon: Coins },
  { title: "Aulas", url: "/aulas", icon: GraduationCap },
];

export function MobileBottomNav() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <nav
      aria-label="Navegação inferior"
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 md:hidden",
        "flex items-center justify-between gap-1 rounded-full px-2 py-2",
        "border border-border/70 bg-surface/70 backdrop-blur-xl",
      )}
      style={{
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
        boxShadow:
          "0 0 0 1px oklch(1 0 0 / 4%), 0 20px 60px -20px oklch(0 0 0 / 70%), 0 0 40px -6px color-mix(in oklab, var(--brand-magenta) 45%, transparent)",
      }}
    >
      {items.map((item) => {
        const active = isActive(item.url);
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            to={item.url}
            onClick={() => playSfx("swipe")}
            aria-label={item.title}
            className={cn(
              "relative grid flex-1 place-items-center gap-0.5 rounded-full px-2 py-1.5 transition-all",
              "text-foreground/60",
              active && "text-primary-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full gradient-primary"
                style={{
                  boxShadow:
                    "0 0 24px -2px color-mix(in oklab, var(--primary) 85%, transparent)",
                }}
              />
            )}
            <Icon className="relative z-10 size-[18px]" strokeWidth={2} />
            <span className="relative z-10 text-[10px] font-medium leading-none">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
