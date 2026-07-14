import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLockup } from "@/components/brand";
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
      email,
      password,
    });
    if (signInError || !data.user) {
      setError(signInError?.message ?? "Falha ao entrar.");
      setLoading(false);
      return;
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    // Revalida cache global antes de navegar (perfil, role, promoções, clientes, permissões).
    await Promise.all([qc.invalidateQueries(), router.invalidate()]);
    console.log("[Revendedores] painel sincronizado após login");

    if (isAdmin) {
      navigate({ to: "/admin" });
      return;
    }

    const { data: rev } = await supabase
      .from("revendedores")
      .select("id, plano_expira_em")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (!rev) {
      await supabase.auth.signOut();
      setError("Perfil não encontrado. Conclua seu cadastro.");
      setLoading(false);
      navigate({ to: "/registro" });
      return;
    }

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
      </form>
    </AuthShell>
  );
}

export const inputCls =
  "w-full rounded-xl border border-border/70 bg-surface/60 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60";

export const primaryBtn =
  "relative w-full rounded-full px-4 py-2.5 text-sm font-semibold text-primary-foreground gradient-primary disabled:opacity-60";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-5 py-10">
        <BrandLockup />
        <div className="glass w-full rounded-2xl p-6">{children}</div>
      </div>
    </div>
  );
}
