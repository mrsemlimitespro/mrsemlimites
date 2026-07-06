import { useEffect, useState } from "react";
import { Bell, Search, Settings, Loader2, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/brand";
import { AdminPasswordDialog } from "@/components/admin-password-gate";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notif = {
  id: string;
  titulo: string;
  mensagem: string | null;
  tipo: string | null;
  categoria: string | null;
  link: string | null;
  lida_em: string | null;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function TopBar() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSignedIn(!!s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function reload() {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("notificacoes")
      .select("id, titulo, mensagem, tipo, categoria, link, lida_em, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifs((data ?? []) as Notif[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!signedIn) {
      setNotifs([]);
      return;
    }
    reload();
    const ch = supabase
      .channel("notif-topbar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        () => reload(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [signedIn]);

  const unread = notifs.filter((n) => !n.lida_em).length;

  async function markAllRead() {
    const ids = notifs.filter((n) => !n.lida_em).map((n) => n.id);
    if (ids.length === 0) return;
    await (supabase as any)
      .from("notificacoes")
      .update({ lida_em: new Date().toISOString() })
      .in("id", ids);
    reload();
  }

  async function markOne(id: string) {
    await (supabase as any)
      .from("notificacoes")
      .update({ lida_em: new Date().toISOString() })
      .eq("id", id);
    reload();
  }

  return (
    <header className="sticky top-2 z-30 mx-auto flex w-full max-w-[1400px] items-center gap-2 px-3 md:top-4 md:gap-3 md:px-6">
      {/* Spacer for the floating rail on md+ */}
      <div className="hidden md:block md:w-16 shrink-0" aria-hidden />

      <div className="flex min-w-0 flex-1 justify-center">
        <label className="relative flex h-10 w-full max-w-[560px] items-center rounded-full border border-border/70 bg-surface/60 pl-9 pr-3 backdrop-blur-xl transition-colors focus-within:border-primary/50 md:h-12 md:pl-11 md:pr-14">
          <Search
            className="absolute left-3 size-4 text-muted-foreground md:left-4"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar..."
            className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="absolute right-3 hidden items-center gap-1 rounded-md border border-border/60 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘ K
          </kbd>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Notificações"
              className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-surface/60 text-foreground/80 backdrop-blur-xl transition-colors hover:text-foreground md:size-11"
            >
              <Bell className="size-4 md:size-[18px]" strokeWidth={2} />
              {unread > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold text-white"
                  style={{
                    background: "var(--brand-magenta)",
                    boxShadow:
                      "0 0 8px color-mix(in oklab, var(--brand-magenta) 80%, transparent)",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="glass-strong w-[360px] p-0"
            sideOffset={10}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h4 className="text-sm font-semibold">Notificações</h4>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CheckCheck className="size-3.5" strokeWidth={2} />
                  Marcar todas
                </button>
              ) : null}
            </div>
            <div className="max-h-[420px] overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" /> Carregando...
                </div>
              ) : notifs.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma notificação.
                </p>
              ) : (
                <ul>
                  {notifs.map((n) => {
                    const body = (
                      <div
                        className={
                          "flex items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.03]"
                        }
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full"
                          style={{
                            background: n.lida_em
                              ? "transparent"
                              : "var(--brand-magenta)",
                            boxShadow: n.lida_em
                              ? undefined
                              : "0 0 8px color-mix(in oklab, var(--brand-magenta) 80%, transparent)",
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {n.titulo}
                          </p>
                          {n.mensagem ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {n.mensagem}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-muted-foreground/80">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {n.link ? (
                          <Link
                            to={n.link}
                            onClick={() => markOne(n.id)}
                            className="block"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markOne(n.id)}
                            className="block w-full"
                          >
                            {body}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <IconBadge
          dot
          aria-label="Painel administrativo"
          onClick={() => setAdminOpen(true)}
        >
          <Settings className="size-4 md:size-[18px]" strokeWidth={2} />
        </IconBadge>
        <button
          type="button"
          aria-label="Perfil"
          className="grid size-9 place-items-center overflow-hidden rounded-full border border-border/70 bg-surface/60 backdrop-blur-xl md:size-11"
        >
          <BrandMark size={32} glow={false} className="rounded-full md:!size-10" />
        </button>
      </div>

      <AdminPasswordDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </header>
  );
}

function IconBadge({
  children,
  dot = false,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  dot?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-surface/60 text-foreground/80 backdrop-blur-xl transition-colors hover:text-foreground md:size-11"
    >
      {children}
      {dot && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 size-1.5 rounded-full md:right-2.5 md:top-2.5 md:size-2"
          style={{
            background: "var(--brand-magenta)",
            boxShadow: "0 0 8px color-mix(in oklab, var(--brand-magenta) 80%, transparent)",
          }}
        />
      )}
    </button>
  );
}
