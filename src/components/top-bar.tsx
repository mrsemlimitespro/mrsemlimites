import { useEffect, useState } from "react";
import { Bell, Settings, Loader2, LogOut, Search, User, Maximize, MessageCircle } from "lucide-react";
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
        return;
      }
      setUserEmail(session.user.email ?? null);
      if (mounted) setIsAdminUser(isAdminEmail(session.user.email));
      
      const nome = (session.user.user_metadata?.nome ?? "").trim();
      if (nome) {
        setFirstName(nome.split(/\s+/)[0]);
      } else {
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
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border/40" : "bg-transparent"
      )}
      style={{
        marginTop: impersonation ? "var(--impersonation-h, 96px)" : undefined,
      }}
    >
      {/* Busca Global (Estilo SaaS Premium) */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar no sistema..."
            className="w-full h-10 pl-10 pr-12 rounded-xl bg-white/5 border border-border/40 text-xs font-medium outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-muted-foreground border border-white/10 uppercase tracking-tighter">Ctrl</kbd>
             <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-muted-foreground border border-white/10 uppercase tracking-tighter">K</kbd>
          </div>
        </div>
      </div>

      {/* Center Branding (Mobile Only) */}
      <div className="flex md:hidden flex-1 items-center justify-center">
        <BrandLogo className="h-8 w-32" />
      </div>

      {/* Actions Hub (Desktop) */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Notificações</span>
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
                  <Bell className="size-8 text-muted-foreground/10 mb-2" />
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Tudo em dia</p>
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
                        {!n.lida_em && <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_var(--primary)]" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate mb-0.5 text-foreground">{n.titulo}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {n.mensagem}
                          </p>
                          <p className="mt-1 text-[8px] font-bold opacity-30 uppercase tracking-tighter">
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

        {/* Mensagens */}
        <button className="hidden sm:grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
          <MessageCircle className="size-5" />
        </button>

        {/* Tela Cheia */}
        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="hidden sm:grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <Maximize className="size-5" />
        </button>

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-border/40" />

        {/* Quick Settings (Admin Only) */}
        {isAdminUser && (
          <button 
            onClick={() => setAdminOpen(true)}
            className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <Settings className="size-5" />
          </button>
        )}

        {/* Avatar/Perfil Small (Mobile Only or additional indicator) */}
        <div className="md:hidden">
          <Link to="/perfil" className="size-10 rounded-xl bg-gradient-primary p-0.5 grid place-items-center overflow-hidden">
             <div className="h-full w-full rounded-[0.5rem] bg-black grid place-items-center">
                <User className="size-5 text-white/80" />
             </div>
          </Link>
        </div>
      </div>

      <AdminPasswordDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </header>
  );
}
