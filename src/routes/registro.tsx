import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field, inputCls, primaryBtn } from "./login";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Criar conta — MR sem limites" },
      { name: "description", content: "Crie sua conta de revendedor." },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);

    const emailRedirectTo = window.location.origin;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { nome, telefone },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Se auto-confirm desativado o usuário pode não ter sessão. Tenta login.
    if (!data.session) {
      const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
      if (siErr) {
        setLoading(false);
        setError("Cadastro criado. Confirme o e-mail e faça login.");
        return;
      }
    }

    const { error: rpcErr } = await supabase.rpc("create_revendedor_profile", {
      _nome: nome,
      _telefone: telefone,
    });
    if (rpcErr) {
      setError(rpcErr.message);
      setLoading(false);
      return;
    }

    // Se já possui plano ativo, entra direto. Senão, checkout.
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: rev } = await supabase
        .from("revendedores")
        .select("plano_expira_em")
        .eq("auth_user_id", u.user.id)
        .maybeSingle();
      const ativo = rev?.plano_expira_em && new Date(rev.plano_expira_em) > new Date();
      navigate({ to: ativo ? "/" : "/checkout" });
      return;
    }
    navigate({ to: "/checkout" });
  }

  return (
    <AuthShell>
      <h1 className="mb-4 text-lg font-semibold">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3.5">
        <Field label="Nome">
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
        </Field>
        <Field label="E-mail">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>
        <Field label="Telefone">
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={inputCls}
            inputMode="tel"
          />
        </Field>
        <Field label="Senha">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar senha">
          <input
            required
            type="password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </Field>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-foreground underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
