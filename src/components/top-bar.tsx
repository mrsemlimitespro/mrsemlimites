import { useEffect, useState } from "react";
import { Bell, Settings, Loader2, CheckCheck, LogOut, Search, User, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand-logo";
import { AdminPasswordDialog } from "@/components/admin-password-gate";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { useImpersonation } from "@/hooks/useImpersonation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isAdminEmail } from "@/hooks/useIsAdmin";

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
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isRevendedor, setIsRevendedor] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function check(session: any) {
      if (!mounted) return;
      setSignedIn(!!session);
      if (!session?.user) {
        setIsAdminUser(false);
        setUserEmail(null);
        setFirstName(null);
        setIsRevendedor(false);
        return;
      }
      setUserEmail(session.user.email ?? null);
      if (mounted) setIsAdminUser(isAdminEmail(session.user.email));
      
      try {
        const { data: rev } = await (supabase as any)
          .from("revendedores")
          .select("nome")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();
        if (!mounted) return;
        const nome = (rev?.nome ?? session.user.user_metadata?.nome ?? "").trim();
        if (nome) {
          setFirstName(nome.split(/\s+/)[0]);
          setIsRevendedor(!!rev?.nome);
        } else {
          setFirstName(null);
          setIsRevendedor(false);
        }
      } catch {
        setFirstName(null);
      }
    }
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s));
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
      .limit(10);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "notificacoes" }, () =>
        reload(),
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

  const impersonation = useImpersonation();
  const authed = useIsAuthed();
  const role = useUserRole();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40" : "bg-transparent"
      )}
      style={{
        marginTop: impersonation ? "var(--impersonation-h, 96px)" : undefined,
      }}
    >
      {/* Mobile Branding */}
      <div className="flex items-center gap-2 md:hidden">
        <BrandLogo className="h-8 w-32" />
      </div>

      {/* Center Logo Signature (Desktop) */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
        <BrandLogo className="h-7 w-28 opacity-60 hover:opacity-100 transition-opacity" />
      </div>


      {/* Page Context / Welcome */}
      <div className="hidden md:flex flex-col">
        {signedIn && firstName && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium opacity-60">Olá,</span>
            <span className="text-sm font-bold">{firstName}</span>
            {isRevendedor && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20">
                Parceiro
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions Hub */}
      <div className="flex items-center gap-2">
        {/* Search Trigger (UX refinement: direct button if no global search yet) */}
        <button className="hidden sm:grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          <Search className="size-5" />
        </button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all active:scale-95"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="glass-strong w-80 p-0 overflow-hidden" sideOffset={12}>
            <div className="flex items-center justify-between border-b border-border/40 bg-surface/30 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alertas</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline">
                  Limpar tudo
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-none">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <Bell className="size-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground">Nada novo por aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markOne(n.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-white/5",
                        !n.lida_em && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!n.lida_em && <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate mb-0.5">{n.titulo}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {n.mensagem}
                          </p>
                          <p className="mt-1 text-[9px] font-bold opacity-40 uppercase tracking-tighter">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Settings (Admin Only) */}
        {isAdminUser && (
          <button 
            onClick={() => setAdminOpen(true)}
            className="hidden sm:grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <Settings className="size-5" />
          </button>
        )}

        <div className="mx-1 h-4 w-px bg-border/40" />

        {/* User Menu */}
        {signedIn === false ? (
          <Link
            to="/login"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
          >
            Acessar
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1 pr-3 border border-border/40 bg-surface/30 hover:bg-surface/50 transition-colors active:scale-95">
                <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center">
                  <User className="size-4 text-white" />
                </div>
                <div className="hidden sm:flex flex-col items-start min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Conta</span>
                  <span className="text-xs font-bold truncate max-w-[80px]">{firstName || "Perfil"}</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="glass-strong w-64 p-2 overflow-hidden" sideOffset={12}>
              <div className="px-3 py-3 border-b border-border/40 bg-surface/30 mb-1 rounded-t-lg">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Email</p>
                <p className="text-xs font-bold truncate text-foreground">{userEmail}</p>
              </div>
              <div className="space-y-1">
                <Link to="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">
                  <User className="size-4" /> Ver Perfil
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="size-4" /> Sair do Sistema
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <AdminPasswordDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </header>
  );
}
