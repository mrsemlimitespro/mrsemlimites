import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimInitialAdmin } from "@/lib/admin/admin.functions";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Loader2,
  Settings2,
  Palette,
  ShieldAlert,
  DatabaseBackup,
  UserCircle,
  Store,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resources } from "@/lib/admin/resources";
import {
  AdminPasswordDialog,
  adminGatePassed,
  clearAdminGate,
} from "@/components/admin-password-gate";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel Administrativo — MR Lova" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const pass = adminGatePassed();
    setUnlocked(pass);
    setDialogOpen(!pass);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <>
        <div className="grid min-h-screen place-items-center bg-background px-4">
          <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
            <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe a senha de administrador para desbloquear o painel.
            </p>
            <Button
              className="mt-5 w-full gradient-primary"
              onClick={() => setDialogOpen(true)}
            >
              Informar senha
            </Button>
          </div>
        </div>
        <AdminPasswordDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setUnlocked(adminGatePassed());
          }}
        />
      </>
    );
  }

  return <AdminShell />;
}

type SpecialLink = {
  key: string;
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const specialLinks: SpecialLink[] = [
  { key: "dashboard", to: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { key: "configuracoes", to: "/admin/configuracoes", label: "Configurações Gerais", icon: Settings2 },
  { key: "personalizacao", to: "/admin/personalizacao", label: "Personalização", icon: Palette },
  { key: "usuarios", to: "/admin/usuarios", label: "Usuários", icon: UserCircle },
  { key: "loja", to: "/admin/loja", label: "Loja", icon: Store },
  { key: "pagamentos", to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { key: "seguranca", to: "/admin/seguranca", label: "Segurança", icon: ShieldAlert },
  { key: "backup", to: "/admin/backup", label: "Backup", icon: DatabaseBackup },
];

function AdminShell() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<
    | { kind: "loading" }
    | { kind: "anon" }
    | { kind: "signed"; email: string; isAdmin: boolean }
  >({ kind: "loading" });
  const [signOpen, setSignOpen] = useState(false);
  const claim = useServerFn(claimInitialAdmin);

  async function refreshAuth() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return setAuthState({ kind: "anon" });
    const { data: role } = await (supabase as any)
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    setAuthState({ kind: "signed", email: user.email ?? "", isAdmin: !!role });
  }

  useEffect(() => {
    refreshAuth();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshAuth());
    return () => sub.subscription.unsubscribe();
  }, []);

  const grouped = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    const g = r.group ?? "Outros";
    (acc[g] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-black/30 p-4 md:flex md:flex-col">
          <div className="mb-6 flex items-center gap-2 px-2">
            <span className="grid size-8 place-items-center rounded-lg gradient-primary">
              <ShieldCheck className="size-4 text-white" strokeWidth={2.2} />
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Admin
              </div>
              <div className="text-sm font-semibold">MR Lova</div>
            </div>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="space-y-1">
              {specialLinks.map((l) => (
                <SideLink
                  key={l.key}
                  to={l.to}
                  icon={<l.icon className="size-4" />}
                  exact={l.exact}
                >
                  {l.label}
                </SideLink>
              ))}
            </div>

            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {group}
                </div>
                <div className="space-y-1">
                  {items.map((r) => {
                    const Icon = r.icon;
                    return (
                      <SideLink
                        key={r.key}
                        to="/admin/$resource"
                        params={{ resource: r.key }}
                        icon={<Icon className="size-4" />}
                      >
                        {r.label}
                      </SideLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-6 space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="truncate text-xs text-muted-foreground">Sessão</div>
            <div className="truncate text-sm font-medium">
              {authState.kind === "signed" ? authState.email : "Painel desbloqueado"}
            </div>
            {authState.kind === "signed" && (
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {authState.isAdmin ? "Admin" : "Sem permissão"}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                clearAdminGate();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" /> Bloquear
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          {authState.kind !== "loading" &&
            (authState.kind === "anon" || !authState.isAdmin) && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3 text-sm text-yellow-100/90">
                <div>
                  {authState.kind === "anon"
                    ? "Você está visualizando o painel. Para salvar alterações, faça login como administrador."
                    : "Sua conta não tem permissão de admin. Reivindique para editar."}
                </div>
                <div className="flex gap-2">
                  {authState.kind === "anon" ? (
                    <Button size="sm" className="gradient-primary" onClick={() => setSignOpen(true)}>
                      Entrar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={async () => {
                        try {
                          await claim();
                          toast.success("Você agora é administrador");
                          refreshAuth();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Falha");
                        }
                      }}
                    >
                      Reivindicar admin
                    </Button>
                  )}
                </div>
              </div>
            )}
          <Outlet />
        </main>
      </div>
      {signOpen && <SignInDialog onClose={() => { setSignOpen(false); refreshAuth(); }} />}
    </div>
  );
}

function SignInDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      toast.success("OK");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md space-y-4 rounded-2xl p-6"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conta</div>
          <h2 className="text-xl font-semibold">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h2>
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
        />
        <Button type="submit" className="w-full gradient-primary" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Entrar" : "Criar conta"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Não tem conta? Cadastrar" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}

function SideLink({
  to,
  params,
  icon,
  exact,
  children,
}: {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      activeOptions={{ exact: !!exact }}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground",
      )}
      activeProps={{ className: "bg-white/10 text-foreground" }}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
