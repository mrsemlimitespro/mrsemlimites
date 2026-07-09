import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Coins,
  Percent,
  Boxes,
  LayoutGrid,
  Megaphone,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/loja")({
  component: LojaPage,
});

const shortcuts = [
  {
    to: "produtos",
    label: "Produtos",
    icon: Package,
    desc: "Cadastrar, editar e excluir produtos.",
  },
  { to: "estoque", label: "Estoque", icon: Boxes, desc: "Controle quantidades e itens." },
  {
    to: "creditos",
    label: "Pacotes de Créditos",
    icon: Coins,
    desc: "Cards de créditos: nome, preço, imagem e cor.",
  },
  {
    to: "planos",
    label: "Planos",
    icon: Sparkles,
    desc: "Assinaturas e vitalício: nome, preço, imagem e cor.",
  },
  { to: "promocoes", label: "Promoções", icon: Percent, desc: "Ofertas, descontos e cupons." },
  { to: "banners", label: "Banners", icon: LayoutGrid, desc: "Imagens de destaque na loja." },
  {
    to: "propagandas",
    label: "Propagandas",
    icon: Megaphone,
    desc: "Campanhas e anúncios internos.",
  },
];

function LojaPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Comércio
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text-warm">Loja</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Painel central da loja — atalhos para gerenciar todo o comercial.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((s) => (
          <Link
            key={s.to}
            to="/admin/$resource"
            params={{ resource: s.to }}
            className="glass group flex items-start justify-between gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl gradient-primary">
                <s.icon className="size-5 text-white" strokeWidth={2} />
              </span>
              <div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
