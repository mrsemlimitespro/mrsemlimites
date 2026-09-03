import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput, SocialSignIn } from "@/components/auth-extras";
import { NativeService } from "@/native/NativeService";
import {
  enableBiometric,
  getBiometricHint,
  isBiometricEnabled,
  unlockWithBiometric,
} from "@/lib/biometric-session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — MR sem limites" },
      { name: "description", content: "Acesse sua conta MR sem limites." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioReady, setBioReady] = useState(false);
  const [bioLabel, setBioLabel] = useState("biometria");
  const [bioHint, setBioHint] = useState<string | null>(null);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!NativeService.platform.isNative()) return;
      const enabled = await isBiometricEnabled();
      if (!enabled) return;
      const avail = await NativeService.biometric.isAvailable();
      if (!avail.ok || !avail.data.available || !avail.data.enrolled) return;
      // Só oferece biometria se ainda existir sessão Supabase válida neste dispositivo.
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      if (!alive) return;
      setBioReady(true);
      setBioHint(await getBiometricHint());
      if (avail.data.type === "face") setBioLabel("Face ID");
      else if (avail.data.type === "fingerprint") setBioLabel("impressão digital");
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleBiometricUnlock() {
    setBioLoading(true);
    setError(null);
    const r = await unlockWithBiometric("Entre no MR sem limites com sua biometria.");
    setBioLoading(false);
    if (!r.ok) {
      if (r.code !== "cancelled") setError(r.message);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setError("Sessão expirada. Entre com seu e-mail e senha.");
      return;
    }
    navigate({ to: "/" });
  }

  async function offerBiometricEnrollment(userHint: string) {
    if (!NativeService.platform.isNative()) return;
    if (await isBiometricEnabled()) return;
    const avail = await NativeService.biometric.isAvailable();
    if (!avail.ok || !avail.data.available || !avail.data.enrolled) return;
    // Confirma vontade do usuário com o próprio prompt do sistema.
    const r = await NativeService.biometric.authenticate({
      reason: "Ative a biometria para entrar mais rápido nas próximas vezes.",
      title: "Ativar biometria",
    });
    if (r.ok) await enableBiometric(userHint);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mr_remember_me", remember ? "1" : "0");
      }
    } catch {}

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError || !data.user) {
      const msg = signInError?.message ?? "";
      setError(
        /invalid login credentials/i.test(msg)
          ? "E-mail ou senha incorretos. Use “Esqueci minha senha” para redefinir."
          : /email not confirmed/i.test(msg)
            ? "E-mail ainda não confirmado."
            : msg || "Falha ao entrar.",
      );
      setLoading(false);
      return;
    }

    // Admin: e-mail oficial sempre entra no painel, mesmo se a checagem de role falhar.
    let isAdmin = isAdminEmail(data.user.email);
    if (!isAdmin) {
      try {
        const { data: roleOk } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });
        isAdmin = roleOk === true;
      } catch {
        isAdmin = false;
      }
    }

    // Revalida cache global antes de navegar (perfil, role, promoções, clientes, permissões).
    try {
      await Promise.all([qc.invalidateQueries(), router.invalidate()]);
    } catch {}

    if (isAdmin) {
      navigate({ to: "/admin" });
      return;
    }

    // Revendedor → painel de revenda (/). Cliente final → também Home,
    // mas sem itens de revenda na sidebar (filtrado por useUserRole).
    let rev: { id: string } | null = null;
    try {
      const res = await supabase
        .from("revendedores")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();
      rev = res.data ?? null;
    } catch {}


    console.log(
      "[Auth] login concluído como",
      rev ? "revendedor" : "cliente",
      "— redirecionando para Home",
    );

    // Oferece habilitar biometria após login bem-sucedido (só native, só 1x).
    await offerBiometricEnrollment(email);

    navigate({ to: "/" });
  }


  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="E-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>
        <Field label="Senha">
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 select-none text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-border/70 bg-surface/60 accent-primary"
            />
            Manter conectado
          </label>
          <Link to="/esqueci-senha" className="text-foreground/80 underline hover:text-foreground">
            Esqueci minha senha
          </Link>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {bioReady && (
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={bioLoading}
            className="w-full rounded-full border border-border/70 bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface/80 disabled:opacity-60"
          >
            {bioLoading
              ? "Verificando..."
              : bioHint
                ? `Entrar com ${bioLabel} (${bioHint})`
                : `Entrar com ${bioLabel}`}
          </button>
        )}

        <SocialSignIn mode="signin" />

        <p className="text-center text-xs text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link to="/registro" className="text-foreground underline">
            Criar conta
          </Link>
        </p>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-surface/60 px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Link
          to="/quero-ser-revendedor"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-primary/10"
        >
          🏪 Quero ser revendedor
        </Link>
      </form>
    </AuthShell>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 transition-all";

export const primaryBtn =
  "relative w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-brand-blue shadow-xl shadow-brand-blue/30 active:scale-[0.98] transition-all disabled:opacity-60";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 ml-1">{label}</span>
      {children}
    </label>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#03050B] overflow-hidden">
       {/* Ambient glow backgrounds */}
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(20,91,255,0.08)_0%,transparent_50%)]" />
       
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-10 px-6 py-12">
        <BrandLogo className="h-16 w-48 mb-2" />
        <div className="w-full rounded-[2.5rem] border border-white/5 bg-[#070D1B]/80 backdrop-blur-2xl p-8 lg:p-10 shadow-2xl shadow-black/80">
          <div className="space-y-1 mb-8 text-center">
             <h2 className="text-xl font-black text-white uppercase tracking-tight">Portal <span className="text-brand-cyan">Membro</span></h2>
             <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Automação • Produtividade • Resultados</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

