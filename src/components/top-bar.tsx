import { Bell, Search, Settings } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-4 z-30 mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 md:px-6">
      {/* Spacer for the floating rail on md+ */}
      <div className="hidden md:block md:w-16 shrink-0" aria-hidden />

      <div className="flex-1 flex justify-center">
        <label className="relative flex h-12 w-full max-w-[560px] items-center rounded-full border border-border/70 bg-surface/60 pl-11 pr-14 backdrop-blur-xl transition-colors focus-within:border-primary/50">
          <Search
            className="absolute left-4 size-4 text-muted-foreground"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar ou digitar comando..."
            className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="absolute right-3 hidden items-center gap-1 rounded-md border border-border/60 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘ K
          </kbd>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <IconBadge dot>
          <Bell className="size-[18px]" strokeWidth={2} />
        </IconBadge>
        <IconBadge dot>
          <Settings className="size-[18px]" strokeWidth={2} />
        </IconBadge>
        <button
          type="button"
          aria-label="Perfil"
          className="grid size-11 place-items-center overflow-hidden rounded-full border border-border/70 bg-surface/60 backdrop-blur-xl"
        >
          <BrandMark size={40} glow={false} className="rounded-full" />
        </button>
      </div>
    </header>
  );
}

function IconBadge({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <button
      type="button"
      className="relative grid size-11 place-items-center rounded-full border border-border/70 bg-surface/60 text-foreground/80 backdrop-blur-xl transition-colors hover:text-foreground"
    >
      {children}
      {dot && (
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 size-2 rounded-full"
          style={{
            background: "var(--brand-magenta)",
            boxShadow: "0 0 8px color-mix(in oklab, var(--brand-magenta) 80%, transparent)",
          }}
        />
      )}
    </button>
  );
}
