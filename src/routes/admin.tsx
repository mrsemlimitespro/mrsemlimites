import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { resources } from "@/lib/admin/resources";
import { claimInitialAdmin } from "@/lib/admin/admin.functions";

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

type AdminState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "not_admin"; email: string }
  | { status: "admin"; email: string };

function AdminLayout() {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return setState({ status: "signed_out" });
    const { data: role } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    setState(
      role
        ? { status: "admin", email: user.email ?? "" }
        : { status: "not_admin", email: user.email ?? "" },
    );
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        refresh();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.status === "signed_out") return <AdminLogin />;
  if (state.status === "not_admin") return <NotAdmin email={state.email} onRefresh={refresh} />;

  return <AdminShell email={state.email} />;
}

function AdminShell({ email }: { email: string }) {
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

          <nav className="flex-1 space-y-1">
            <SideLink to="/admin" icon={<LayoutDashboard className="size-4" />} exact>
              Painel
            </SideLink>
            {resources.map((r) => {
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
          </nav>

          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="truncate text-xs text-muted-foreground">Logado como</div>
            <div className="truncate text-sm font-medium">{email}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
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

function AdminLogin() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Conta criada. Verifique seu e-mail se solicitado.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao autenticar.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl gradient-primary">
            <ShieldCheck className="size-5 text-white" strokeWidth={2.2} />
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              MR Lova
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Painel <span className="gradient-text-warm">Administrativo</span>
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full gradient-primary" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <button className="hover:text-foreground" onClick={() => setMode("signup")}>
              Não tem conta? <span className="underline">Cadastre-se</span>
            </button>
          ) : (
            <button className="hover:text-foreground" onClick={() => setMode("signin")}>
              Já tem conta? <span className="underline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotAdmin({ email, onRefresh }: { email: string; onRefresh: () => void }) {
  const router = useRouter();
  const claim = useServerFn(claimInitialAdmin);
  const [busy, setBusy] = useState(false);

  async function handleClaim() {
    setBusy(true);
    try {
      await claim();
      toast.success("Você agora é administrador!");
      await onRefresh();
      router.invalidate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível reivindicar admin.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta <span className="text-foreground">{email}</span> não tem permissão de administrador.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Se você é o dono do sistema e ainda não há admin cadastrado, clique abaixo para se tornar o primeiro:
        </p>
        <Button onClick={handleClaim} disabled={busy} className="mt-4 w-full gradient-primary">
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Reivindicar admin (setup inicial)"}
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full text-muted-foreground"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
