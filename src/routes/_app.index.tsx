import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  Bot,
  Wand2,
  Package,
  Puzzle,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Headphones,
  Star,
  ChevronDown,
  LayoutDashboard,
  ArrowRight,
  Rocket,
  Brain,
  Megaphone,
  TrendingUp,
  Users,
  Wrench,
  LayoutTemplate,
  Workflow,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { supabase } from "@/integrations/supabase/client";
import { BRAND_LOGO_URL, BRAND_NAME } from "@/components/brand";
import { PromoCarousel } from "@/components/promo-carousel";

import {
  PromocoesSection,
  PlanosSection,
  ProdutosSection,
  ProdutosBannerCarousel,
  PropagandasSection,
  VideosSection,
} from "@/components/home/home-sections";
import { useModules } from "@/lib/admin/use-modules";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "MR Sem Limites — Plataforma completa de revenda digital" },
      {
        name: "description",
        content:
          "Agentes IA, Prompts, Packs, Extensões, Automações, Templates e Comunidade. Compra segura, entrega após confirmação do pagamento e suporte no WhatsApp.",
      },
      { property: "og:title", content: "MR Sem Limites — Revenda Digital Premium" },
      {
        property: "og:description",
        content: "Agentes IA, Prompts, Packs, Extensões, Automações e mais.",
      },
      { property: "og:type", content: "website" },
    ],
  }),

  component: LandingPage,
});

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/* =============================================================
 *  LANDING PAGE — pública, focada em conversão
 * ============================================================= */
function LandingPage() {
  const authed = useIsAuthed();
  const isAdmin = useIsAdmin();
  const { visibleIn, modules } = useModules();

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-10 pb-24 md:space-y-14 md:pb-32">
      <HeroSection authed={!!authed} showDashboard={authed === true} />
      <SearchBar />
      <CategoriasSection />

      {/* Seções dinâmicas gerenciadas via /admin/home ------------- */}
      <DynamicHomeSections visibleIn={visibleIn} modules={modules} />

      <BeneficiosSection />
      <EstatisticasSection />
      <DepoimentosSection />
      <FaqSection />
      <CtaFinalSection />
      <FooterSection />

      {/* Atalho de admin/revendedor para o painel */}
      {authed === true && isAdmin && (
        <Link
          to="/dashboard"
          className="fixed bottom-24 right-4 z-30 hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg transition hover:opacity-90 md:inline-flex"
        >
          <LayoutDashboard className="size-4" />
          Ir ao Painel
        </Link>
      )}
    </div>
  );
}

/* =============================================================
 *  HERO
 * ============================================================= */
function HeroSection({ authed, showDashboard }: { authed: boolean; showDashboard: boolean }) {
  return (
    <section className="relative flex flex-col items-center justify-center gap-5 py-6 text-center md:py-12">
      <div
        className="relative grid place-items-center rounded-[26%] overflow-hidden"
        style={{
          width: "min(160px, 40vw)",
          height: "min(160px, 40vw)",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--brand-magenta) 55%, transparent), 0 0 80px -4px color-mix(in oklab, var(--brand-magenta) 60%, transparent), 0 0 90px -10px color-mix(in oklab, var(--brand-blue) 55%, transparent)",
        }}
      >
        <img
          src={BRAND_LOGO_URL}
          alt={`${BRAND_NAME} logo`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3" /> Plataforma Premium
        </span>
        <h1 className="gradient-text-warm text-3xl font-black tracking-tight md:text-5xl">
          {BRAND_NAME}
        </h1>
        <p className="max-w-2xl px-2 text-sm text-muted-foreground md:text-base">
          Agentes IA, Prompts, Packs, Extensões, Automações, Templates e Comunidade —
          entrega após a confirmação do pagamento, com suporte humano no WhatsApp.
        </p>

      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/packs"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          Comprar Agora <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/agents"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/10"
        >
          Ver Ofertas
        </Link>
        {showDashboard ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            <LayoutDashboard className="size-4" /> Painel
          </Link>
        ) : !authed ? (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            Entrar
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/* =============================================================
 *  BUSCA
 * ============================================================= */
function SearchBar() {
  return (
    <section className="glass mx-auto flex w-full max-w-2xl items-center gap-3 rounded-full px-4 py-3">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        placeholder="Buscar produtos, planos, aplicativos, agentes..."
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const q = (e.target as HTMLInputElement).value.trim();
            if (q) window.location.href = `/packs?q=${encodeURIComponent(q)}`;
          }
        }}
      />
      <button
        type="button"
        className="hidden rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 sm:inline-flex"
        onClick={(e) => {
          const input = (e.currentTarget.previousSibling as HTMLInputElement | null);
          const q = input?.value?.trim();
          if (q) window.location.href = `/packs?q=${encodeURIComponent(q)}`;
        }}
      >
        Buscar
      </button>
    </section>
  );
}

/* =============================================================
 *  CATEGORIAS
 * ============================================================= */
type Categoria = {
  titulo: string;
  descricao: string;
  icon: IconType;
  href: string;
  color: string;
};

const CATEGORIAS: Categoria[] = [
  { titulo: "Agentes IA", descricao: "Automação inteligente", icon: Bot, href: "/agents", color: "var(--brand-cyan)" },
  { titulo: "Prompts", descricao: "Modelos prontos", icon: Wand2, href: "/prompts", color: "var(--brand-emerald)" },
  { titulo: "Packs", descricao: "Bibliotecas exclusivas", icon: Package, href: "/packs", color: "var(--brand-magenta)" },
  { titulo: "Extensões", descricao: "Ferramentas de apoio", icon: Puzzle, href: "/agents", color: "var(--brand-violet)" },
  { titulo: "Ferramentas", descricao: "Recursos essenciais", icon: Wrench, href: "/packs", color: "var(--brand-blue)" },
  { titulo: "Automações", descricao: "Fluxos que vendem", icon: Workflow, href: "/packs", color: "var(--brand-orange)" },
  { titulo: "Templates", descricao: "Prontos para usar", icon: LayoutTemplate, href: "/packs", color: "var(--brand-pink)" },
  { titulo: "Comunidade", descricao: "Networking premium", icon: Users, href: "/", color: "var(--brand-violet)" },
  { titulo: "Inteligência Artificial", descricao: "IA aplicada ao negócio", icon: Brain, href: "/agents", color: "var(--brand-cyan)" },
  { titulo: "Marketing Digital", descricao: "Conteúdo e tráfego", icon: Megaphone, href: "/packs", color: "var(--brand-magenta)" },
  { titulo: "Transformação Digital", descricao: "Escale seu negócio", icon: Rocket, href: "/packs", color: "var(--brand-orange)" },
  { titulo: "Vendas", descricao: "Feche mais clientes", icon: TrendingUp, href: "/packs", color: "var(--brand-emerald)" },
];


function CategoriasSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="section-title">
          <span aria-hidden className="section-title-bar" /> Categorias
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CATEGORIAS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.titulo}
              to={c.href}
              className="card-premium card-premium-hover group flex flex-col gap-2 rounded-2xl p-4"
              style={{ ["--tile-color" as never]: c.color }}
            >
              <span className="icon-tile size-11">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.titulo}</p>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">{c.descricao}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* =============================================================
 *  SEÇÕES DINÂMICAS DA HOME (banco → /admin/home)
 * ============================================================= */
function DynamicHomeSections({
  visibleIn,
  modules,
}: {
  visibleIn: (surface: "home", slug: string) => boolean;
  modules: { slug: string; ordem: number; mostrar_home: boolean; ativo: boolean }[];
}) {
  const RENDERERS: Record<string, () => React.ReactElement> = {
    carrossel: () => <PromoCarousel key="carrossel" />,
    propagandas: () => <PropagandasSection key="propagandas" posicao="home" />,
    "loja-produtos": () => <ProdutosBannerCarousel key="loja-produtos" />,
    promocoes: () => <PromocoesSection key="promocoes" />,
    planos: () => <PlanosSection key="planos" />,
    produtos: () => <ProdutosSection key="produtos" />,
    videos: () => <VideosSection key="videos" />,
  };
  const DEFAULT_ORDER = [
    "carrossel",
    "propagandas",
    "loja-produtos",
    "promocoes",
    "planos",
    "produtos",
    "videos",
  ];

  const ordered = (() => {
    const configured = modules
      .filter((m) => m.mostrar_home && m.ativo && RENDERERS[m.slug])
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => m.slug);
    if (configured.length === 0) return DEFAULT_ORDER;
    const missing = DEFAULT_ORDER.filter((s) => !configured.includes(s) && visibleIn("home", s));
    return [...configured, ...missing];
  })();

  return (
    <>
      {ordered.map((slug) => {
        const r = RENDERERS[slug];
        return r ? r() : null;
      })}
    </>
  );
}

/* =============================================================
 *  BENEFÍCIOS
 * ============================================================= */
const BENEFICIOS = [
  { icon: ShieldCheck, titulo: "Compra Segura", descricao: "Gateway certificado com criptografia total", color: "var(--brand-emerald)" },
  { icon: Zap, titulo: "Entrega Após Pagamento", descricao: "Acesso liberado após a confirmação do pagamento", color: "var(--brand-orange)" },
  { icon: Headphones, titulo: "Suporte no WhatsApp", descricao: "Atendimento humano com nossa equipe", color: "var(--brand-blue)" },
  { icon: Sparkles, titulo: "Conteúdo Premium", descricao: "Curadoria exclusiva de Agentes, Prompts e Packs", color: "var(--brand-magenta)" },
];


function BeneficiosSection() {
  return (
    <section className="space-y-3">
      <h2 className="section-title">
        <span aria-hidden className="section-title-bar" /> Por que a {BRAND_NAME}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {BENEFICIOS.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.titulo}
              className="card-premium card-premium-hover flex flex-col gap-3 rounded-2xl p-5"
              style={{ ["--tile-color" as never]: b.color }}
            >
              <span className="icon-tile size-12">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-base font-semibold">{b.titulo}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.descricao}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =============================================================
 *  ESTATÍSTICAS (contadores reais)
 * ============================================================= */
function EstatisticasSection() {
  const [stats, setStats] = useState({ clientes: 0, licencas: 0, produtos: 0, satisfacao: 98 });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [c, l, p] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("licencas").select("id", { count: "exact", head: true }),
        supabase.from("produtos").select("id", { count: "exact", head: true }).eq("ativo", true),
      ]);
      if (!alive) return;
      setStats({
        clientes: c.count ?? 0,
        licencas: l.count ?? 0,
        produtos: p.count ?? 0,
        satisfacao: 98,
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items = [
    { label: "Clientes ativos", value: stats.clientes.toLocaleString("pt-BR"), color: "var(--brand-violet)" },
    { label: "Acessos entregues", value: stats.licencas.toLocaleString("pt-BR"), color: "var(--brand-blue)" },
    { label: "Produtos no catálogo", value: stats.produtos.toLocaleString("pt-BR"), color: "var(--brand-magenta)" },
    { label: "Satisfação", value: `${stats.satisfacao}%`, color: "var(--brand-emerald)" },
  ];


  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="card-premium relative overflow-hidden rounded-2xl p-5 text-center"
          style={{ ["--tile-color" as never]: it.color }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {it.label}
          </p>
          <p className="mt-2 text-3xl font-black" style={{ color: it.color }}>
            {it.value}
          </p>
        </div>
      ))}
    </section>
  );
}

/* =============================================================
 *  DEPOIMENTOS
 * ============================================================= */
const DEPOIMENTOS = [
  {
    nome: "Carlos M.",
    cargo: "Revendedor há 3 anos",
    texto: "Os Agentes e Packs da MR Sem Limites me ajudaram a escalar sem dor de cabeça.",
  },
  {
    nome: "Ana L.",
    cargo: "Empreendedora digital",
    texto: "Suporte no WhatsApp é excelente. Sempre respondem em minutos, mesmo de madrugada.",
  },
  {
    nome: "Rafael S.",
    cargo: "Top revendedor 2025",
    texto: "Prompts, Automações e Templates de qualidade. Curadoria séria, recomendo demais.",
  },
];


function DepoimentosSection() {
  return (
    <section className="space-y-3">
      <h2 className="section-title">
        <span aria-hidden className="section-title-bar" /> O que dizem nossos clientes
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {DEPOIMENTOS.map((d, i) => (
          <div key={i} className="glass flex flex-col gap-3 rounded-2xl p-5">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm italic text-muted-foreground">"{d.texto}"</p>
            <div className="mt-auto">
              <p className="text-sm font-semibold">{d.nome}</p>
              <p className="text-[11px] text-muted-foreground">{d.cargo}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
 *  FAQ
 * ============================================================= */
const FAQ = [
  {
    q: "Como funciona a ativação?",
    a: "Após a aprovação do pagamento, os créditos ou licenças são liberados automaticamente no seu painel em segundos.",
  },
  {
    q: "Posso testar antes de comprar?",
    a: "Sim, oferecemos garantia de 7 dias. Se você não ficar satisfeito, devolvemos 100% do valor pago.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "PIX, cartão de crédito e débito. Todas as transações são processadas com segurança e criptografia.",
  },
  {
    q: "Tem suporte?",
    a: "Sim, oferecemos suporte 24/7 via WhatsApp. Nossa equipe está sempre pronta para ajudar.",
  },
  {
    q: "Preciso ter conhecimento técnico?",
    a: "Não. A plataforma foi desenhada para ser simples e intuitiva. Ainda oferecemos aulas gratuitas.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="space-y-3">
      <h2 className="section-title">
        <span aria-hidden className="section-title-bar" /> Perguntas Frequentes
      </h2>
      <div className="glass divide-y divide-white/5 rounded-2xl">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.02]"
            >
              <ChevronDown
                className={cn(
                  "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180 text-primary",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.q}</p>
                {isOpen && (
                  <p className="mt-2 text-xs text-muted-foreground">{item.a}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* =============================================================
 *  CTA FINAL
 * ============================================================= */
function CtaFinalSection() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-8 text-center md:p-14"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--brand-magenta) 25%, transparent), color-mix(in oklab, var(--brand-blue) 25%, transparent))",
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--brand-magenta) 40%, transparent), 0 0 80px -10px color-mix(in oklab, var(--brand-blue) 40%, transparent)",
      }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3" /> Pronto para começar?
      </span>
      <h2 className="mt-4 text-2xl font-black tracking-tight md:text-4xl">
        Comece agora e ative seu primeiro cliente em minutos
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
        Ambiente pronto, pagamento aprovado, licença entregue. Zero fricção.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/packs"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          Adquirir Agora <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/planos"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-foreground transition hover:bg-white/10"
        >
          Ver Planos Premium
        </Link>
      </div>
    </section>
  );
}

/* =============================================================
 *  FOOTER
 * ============================================================= */
function FooterSection() {
  return (
    <footer className="mt-6 border-t border-white/5 pt-8 text-sm text-muted-foreground">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="space-y-2">
          <p className="gradient-text-warm text-lg font-black">{BRAND_NAME}</p>
          <p className="text-xs">Plataforma completa de revenda digital.</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Catálogo
          </p>
          <ul className="space-y-1 text-xs">
            <li><Link to="/packs" className="hover:text-foreground">Packs Premium</Link></li>
            <li><Link to="/agents" className="hover:text-foreground">Agentes IA</Link></li>
            <li><Link to="/prompts" className="hover:text-foreground">Prompts IA</Link></li>
            <li><Link to="/creditos" className="hover:text-foreground">Créditos</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Suporte
          </p>
          <ul className="space-y-1 text-xs">
            <li><Link to="/aulas" className="hover:text-foreground">Aulas</Link></li>
            <li><Link to="/perfil" className="hover:text-foreground">Meu Perfil</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Entrar</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Confiança
          </p>
          <ul className="space-y-1 text-xs">
            <li>✓ Pagamento seguro</li>
            <li>✓ Garantia 7 dias</li>
            <li>✓ Suporte 24/7</li>
            <li>✓ Entrega automática</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-white/5 pt-4 text-center text-[11px]">
        © {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
