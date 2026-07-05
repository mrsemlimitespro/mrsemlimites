import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Coins,
  Flame,
  Lock,
  Package,
  ShoppingCart,
  Sparkles,
  Timer,
  Trophy,
  UserCircle2,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/creditos")({
  head: () => ({
    meta: [
      { title: "Loja — MR sem limites" },
      { name: "description", content: "Loja de chaves e créditos." },
    ],
  }),
  component: LojaPage,
});

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Tab = { id: string; label: string; icon: IconType };
const tabs: Tab[] = [
  { id: "loja", label: "Loja", icon: ShoppingCart },
  { id: "meus-clientes", label: "Meus Clientes", icon: UserCircle2 },
  { id: "meu-estoque", label: "Meu Estoque", icon: Package },
  { id: "creditos", label: "Créditos Lovable", icon: Coins },
];

type ChavePack = {
  qty: number;
  label: string;
  total: number;
  unit: number;
  discount?: number;
};

const chavePacks: ChavePack[] = [
  { qty: 1, label: "chave", total: 34.9, unit: 34.9 },
  { qty: 5, label: "chaves", total: 149.5, unit: 29.9, discount: 14 },
  { qty: 10, label: "chaves", total: 299.0, unit: 29.9, discount: 14 },
];

function LojaPage() {
  const [active, setActive] = useState("loja");

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      {/* Tabs */}
      <div className="glass inline-flex flex-wrap items-center gap-1 rounded-2xl p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl gradient-primary"
                  style={{
                    boxShadow:
                      "0 0 20px -2px color-mix(in oklab, var(--primary) 75%, transparent)",
                  }}
                />
              )}
              <Icon className="relative z-10 size-4" strokeWidth={2} />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {active === "loja" ? (
        <LojaContent />
      ) : (
        <div className="glass rounded-2xl p-14 text-center text-sm text-muted-foreground">
          Envie o print desta aba para eu reconstruí-la fielmente.
        </div>
      )}
    </div>
  );
}

function LojaContent() {
  return (
    <div className="space-y-6">
      <PromoInauguracao />

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ShoppingCart className="size-5 text-primary" strokeWidth={2} />
              Comprar <span className="gradient-text-warm">Chaves</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plano R$ 187 — Acima de 3 chaves, desconto fixo de 5%.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {chavePacks.map((p) => (
            <ChavePackCard key={p.qty} pack={p} />
          ))}

          <BundleCard
            variant="lovable"
            title="Lovable"
            subtitle="300 CRÉDITOS LOVABLE"
            badge="PRO LITE"
            price={89.9}
            gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 100%)"
            buttonColor="#a855f7"
          />

          <BundleCard
            variant="campeao"
            title="É CAMPEÃO!"
            subtitle="300 CRÉDITOS PRO + CHAVE VITALÍCIA"
            badge="ESSE SIM"
            price={149.9}
            gradient="linear-gradient(135deg, #ca8a04 0%, #f59e0b 45%, #fde047 100%)"
            buttonColor="#f59e0b"
            dark
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BundleCard
          variant="conta"
          title="CONTA LOVABLE"
          subtitle="300 CRÉDITOS · 1 ANO"
          badge="PRO"
          price={129.9}
          gradient="linear-gradient(135deg, #831843 0%, #db2777 55%, #f472b6 100%)"
          buttonColor="#ec4899"
          large
        />
        <BundleCard
          variant="manus"
          title="CRÉDITOS MANUS AI"
          subtitle="1000 CRÉDITOS"
          badge="POWER"
          price={39.9}
          gradient="linear-gradient(135deg, #0e7490 0%, #06b6d4 55%, #67e8f9 100%)"
          buttonColor="#06b6d4"
          large
        />
      </section>

      <FlashPromo />
    </div>
  );
}

function PromoInauguracao() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl px-5 py-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--brand-orange) 20%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex flex-wrap items-center gap-4">
        <span
          className="grid size-10 place-items-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--brand-orange) 60%, transparent), color-mix(in oklab, var(--brand-magenta) 30%, transparent))",
            boxShadow:
              "0 0 24px -4px color-mix(in oklab, var(--brand-orange) 70%, transparent)",
          }}
        >
          <Flame className="size-5 text-white" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Promoção de Inauguração
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[9px] tracking-[0.14em] text-muted-foreground">
              ENCERRADA
            </span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold text-foreground">10 chaves por R$ 249,90</span>{" "}
            <span className="text-muted-foreground">
              — oferta de inauguração, válida por 24h
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" strokeWidth={2} />
          Promoção encerrada
        </div>
      </div>
    </div>
  );
}

function ChavePackCard({ pack }: { pack: ChavePack }) {
  return (
    <div className="glass relative flex flex-col items-center overflow-hidden rounded-2xl p-5 text-center">
      {pack.discount && (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-primary-foreground"
          style={{
            background: "var(--gradient-primary)",
            boxShadow:
              "0 0 16px -2px color-mix(in oklab, var(--primary) 70%, transparent)",
          }}
        >
          -{pack.discount}%
        </span>
      )}

      <span
        className="mt-2 grid size-11 place-items-center rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--brand-orange) 30%, transparent), color-mix(in oklab, var(--brand-magenta) 25%, transparent))",
          border:
            "1px solid color-mix(in oklab, var(--brand-orange) 45%, transparent)",
          boxShadow:
            "0 0 20px -4px color-mix(in oklab, var(--brand-orange) 55%, transparent)",
        }}
      >
        <Zap className="size-5" style={{ color: "var(--brand-orange)" }} strokeWidth={2.5} />
      </span>

      <p className="mt-3 text-3xl font-semibold tracking-tight">{pack.qty}</p>
      <p className="text-xs text-muted-foreground">{pack.label}</p>

      <div className="mt-4 w-full rounded-xl border border-border/60 bg-white/[0.03] px-3 py-3">
        <p className="gradient-text-warm text-xl font-semibold">
          R$ {pack.total.toFixed(2).replace(".", ",")}
        </p>
        <p className="text-[11px] text-muted-foreground">
          total por {pack.qty} {pack.label}
        </p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        R$ {pack.unit.toFixed(2).replace(".", ",")} por chave/mês
      </p>

      <Button className="mt-4 w-full rounded-xl border border-border/70 bg-white/[0.03] font-medium hover:bg-white/[0.06]" variant="ghost">
        <ShoppingCart className="size-4" strokeWidth={2} />
        Comprar
      </Button>
    </div>
  );
}

function BundleCard({
  title,
  subtitle,
  badge,
  price,
  gradient,
  buttonColor,
  large = false,
  dark = false,
}: {
  variant: string;
  title: string;
  subtitle: string;
  badge: string;
  price: number;
  gradient: string;
  buttonColor: string;
  large?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-0.5",
        large && "min-h-[280px]",
      )}
      style={{
        background: gradient,
        borderColor: "color-mix(in oklab, white 20%, transparent)",
        boxShadow: `0 20px 50px -18px oklch(0 0 0 / 55%), 0 0 40px -8px ${buttonColor}`,
      }}
    >
      {/* Sparkle top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, white 25%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            dark ? "bg-black/70 text-white" : "bg-white/25 text-white backdrop-blur",
          )}
        >
          {badge}
        </span>
        <Sparkles className="size-4 text-white/80" strokeWidth={2} />
      </div>

      <div className="relative mt-4 flex-1">
        <h3 className="text-lg font-bold uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {title}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
          {subtitle}
        </p>

        <div className="mt-4 flex items-baseline gap-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          <span className="text-sm font-semibold">R$</span>
          <span className="text-4xl font-black tracking-tight">
            {Math.floor(price)}
          </span>
          <span className="text-xl font-bold">
            ,{price.toFixed(2).split(".")[1]}
          </span>
        </div>
      </div>

      <Button
        className="relative mt-4 w-full rounded-xl border-0 font-semibold text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${buttonColor} 90%, black), ${buttonColor})`,
          boxShadow: `0 8px 24px -4px ${buttonColor}`,
        }}
      >
        <ShoppingCart className="size-4" strokeWidth={2.5} />
        Comprar por R$ {price.toFixed(2).replace(".", ",")}
      </Button>
    </div>
  );
}

function FlashPromo() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6"
      style={{
        borderColor: "color-mix(in oklab, var(--primary) 55%, transparent)",
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--brand-magenta) 12%, var(--surface)) 0%, color-mix(in oklab, var(--brand-orange) 8%, var(--surface)) 100%)",
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent), 0 0 50px -10px color-mix(in oklab, var(--primary) 60%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-center gap-6">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-full"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-magenta), var(--brand-orange))",
            boxShadow:
              "0 0 24px -4px color-mix(in oklab, var(--brand-magenta) 70%, transparent)",
          }}
        >
          <Trophy className="size-6 text-white" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground"
              style={{
                background: "var(--gradient-primary)",
                boxShadow:
                  "0 0 16px -2px color-mix(in oklab, var(--primary) 70%, transparent)",
              }}
            >
              Promoção Relâmpago
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Validade ∞
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Chave <span className="gradient-text-warm">Vitalícia</span>
          </h3>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            1 chave com validade ilimitada para o cliente final. Venda como produto premium.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="size-3.5 text-primary" strokeWidth={2} />
            Até amanhã às 20h · Termina em{" "}
            <span className="font-mono font-semibold text-foreground">03:52:25</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-muted-foreground line-through">R$ 147,90</span>
          <span className="text-3xl font-bold gradient-text-warm">R$ 79,90</span>
          <span className="text-[11px] text-emerald-400">economize R$ 68,00</span>
        </div>

        <Button
          className="rounded-xl gradient-primary font-semibold text-primary-foreground"
          style={{
            boxShadow:
              "0 8px 24px -4px color-mix(in oklab, var(--primary) 65%, transparent)",
          }}
        >
          <ShoppingCart className="size-4" strokeWidth={2.5} />
          Comprar Vitalícia
        </Button>
      </div>
    </div>
  );
}
