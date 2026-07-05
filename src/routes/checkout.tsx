import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, primaryBtn } from "./login";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MR sem limites" },
      { name: "description", content: "Escolha seu plano e forma de pagamento." },
    ],
  }),
  component: CheckoutPage,
});

type Plano = {
  id: string;
  nome: string;
  tipo: string | null;
  preco: number;
  creditos_incluidos: number;
  duracao_dias: number;
  descricao: string | null;
};

type Gateway = { slug: "mercadopago" | "kiwify" | "cakto"; label: string; color: string };

const GATEWAYS: Gateway[] = [
  { slug: "mercadopago", label: "Mercado Pago", color: "var(--brand-blue)" },
  { slug: "kiwify", label: "Kiwify", color: "var(--brand-emerald)" },
  { slug: "cakto", label: "Cakto", color: "var(--brand-magenta)" },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Promo = {
  id: string;
  titulo: string;
  desconto_percentual: number | null;
  plano_id: string | null;
  pack_id: string | null;
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [tipo, setTipo] = useState<"mensal" | "anual">("mensal");
  const [planoId, setPlanoId] = useState<string | null>(null);
  const [gateway, setGateway] = useState<Gateway["slug"]>("mercadopago");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; valor: number } | null>(null);
  const [promo, setPromo] = useState<Promo | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));

    // Lê ?promo=&plano=&pack= da URL
    const url = new URL(window.location.href);
    const promoParam = url.searchParams.get("promo");
    const planoParam = url.searchParams.get("plano");

    if (promoParam) {
      supabase
        .from("promocoes")
        .select("id,titulo,desconto_percentual,plano_id,pack_id")
        .eq("id", promoParam)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPromo(data as Promo);
        });
    }

    supabase
      .from("planos")
      .select("id,nome,tipo,preco,creditos_incluidos,duracao_dias,descricao")
      .eq("ativo", true)
      .order("preco", { ascending: true })
      .then(({ data }) => {
        const list = (data as Plano[]) ?? [];
        setPlanos(list);
        const preselect =
          planoParam ??
          list.find((p) => (p.tipo ?? "").toLowerCase() === "mensal")?.id ??
          list[0]?.id ??
          null;
        if (preselect) setPlanoId(preselect);
      });
  }, []);

  const filtered = planos.filter(
    (p) => (p.tipo ?? "").toLowerCase() === tipo || (!p.tipo && tipo === "mensal"),
  );
  const displayed = filtered.length ? filtered : planos;
  const plano = displayed.find((p) => p.id === planoId) ?? displayed[0];
  const descontoPct = promo && promo.plano_id === plano?.id ? Number(promo.desconto_percentual ?? 0) : 0;
  const valorFinal = plano ? Number(plano.preco) * (1 - descontoPct / 100) : 0;


  async function onConfirm() {
    setMsg(null);
    if (!plano) return;
    if (!authed) {
      navigate({ to: "/registro" });
      return;
    }
    setLoading(true);

    // Garantir revendedor
    const { data: rid } = await supabase.rpc("create_revendedor_profile", {});
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      setMsg("Sessão expirada. Faça login.");
      return;
    }
    const { data: rev } = await supabase
      .from("revendedores")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();
    const revendedor_id = rev?.id ?? rid;
    if (!revendedor_id) {
      setLoading(false);
      setMsg("Não foi possível criar o perfil de revendedor.");
      return;
    }

    const { data: tx, error } = await supabase
      .from("payment_transactions")
      .insert({
        revendedor_id,
        plano_id: plano.id,
        gateway_slug: gateway,
        valor: plano.preco,
        moeda: "BRL",
        status: "pendente",
        metodo: gateway,
      })
      .select("id, valor")
      .single();

    setLoading(false);
    if (error || !tx) {
      setMsg(error?.message ?? "Erro ao iniciar pagamento.");
      return;
    }
    setPending(tx as { id: string; valor: number });
  }

  if (pending) {
    return (
      <AuthShell>
        <h1 className="mb-3 text-lg font-semibold">Pagamento iniciado</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Referência para o pagamento (informe este código na descrição/observação do pagamento no
          {" "}gateway):
        </p>
        <div className="mb-4 rounded-xl border border-border/70 bg-surface/60 p-3 font-mono text-xs break-all">
          {pending.id}
        </div>
        <p className="text-sm">
          Assim que o gateway confirmar o pagamento de <strong>{brl(pending.valor)}</strong>, seu
          plano será liberado automaticamente e você poderá acessar o painel.
        </p>
        <button className={`${primaryBtn} mt-5`} onClick={() => navigate({ to: "/" })}>
          Ir para o painel
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="mb-1 text-lg font-semibold">Escolha seu plano</h1>
      <p className="mb-4 text-xs text-muted-foreground">
        Você pode trocar de plano ou renovar a qualquer momento.
      </p>

      <div className="mb-4 inline-flex rounded-full border border-border/70 bg-surface/60 p-1 text-xs">
        {(["mensal", "anual"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={cn(
              "rounded-full px-3 py-1.5 font-medium capitalize transition",
              tipo === t ? "gradient-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {displayed.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum plano cadastrado.</p>
        )}
        {displayed.map((p) => {
          const active = planoId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlanoId(p.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-3 text-left transition",
                active
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 bg-surface/60 hover:border-primary/40",
              )}
            >
              <div>
                <p className="text-sm font-semibold">{p.nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.creditos_incluidos.toLocaleString("pt-BR")} créditos · {p.duracao_dias} dias
                </p>
              </div>
              <p className="text-sm font-semibold">{brl(Number(p.preco))}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Forma de pagamento</p>
        <div className="grid grid-cols-3 gap-2">
          {GATEWAYS.map((g) => {
            const active = gateway === g.slug;
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => setGateway(g.slug)}
                className={cn(
                  "rounded-xl border p-2.5 text-xs font-medium transition",
                  active
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/70 bg-surface/60 text-muted-foreground hover:text-foreground",
                )}
                style={active ? { boxShadow: `0 0 22px -6px ${g.color}` } : undefined}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {msg && <p className="mt-4 text-xs text-red-400">{msg}</p>}

      <button
        onClick={onConfirm}
        disabled={loading || !plano}
        className={`${primaryBtn} mt-5`}
      >
        {loading ? "Processando..." : plano ? `Continuar — ${brl(Number(plano.preco))}` : "Continuar"}
      </button>

      {authed === false && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Você será direcionado para criar sua conta antes do pagamento.
        </p>
      )}
    </AuthShell>
  );
}
