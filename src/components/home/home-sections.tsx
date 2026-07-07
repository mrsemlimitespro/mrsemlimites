/**
 * Seções da Home consumidas do banco (CMS).
 * Cada seção renderiza SOMENTE se houver dados ativos — se estiver vazia,
 * some da tela sem alterar layout base.
 * Todas usam Supabase realtime para refletir alterações do Admin ao vivo.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const brl = (n: number | null | undefined) =>
  n == null ? "" : Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function useLive<T>(table: string, query: () => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const data = await query().catch(() => []);
      if (alive) setRows(data ?? []);
    };
    load();
    const ch = supabase
      .channel(`home-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, load)
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
  return rows;
}

/* ============ PROMOÇÕES ============ */
type Promo = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  banner_desktop_url: string | null;
  banner_mobile_url: string | null;
  botao_texto: string | null;
  link: string | null;
  preco_antigo: number | null;
  preco_atual: number | null;
  desconto_percentual: number | null;
  cor: string | null;
  ordem: number | null;
};

export function PromocoesSection() {
  const items = useLive<Promo>("promocoes", async () => {
    const { data } = await supabase
      .from("promocoes")
      .select(
        "id,titulo,subtitulo,descricao,imagem_url,banner_desktop_url,banner_mobile_url,botao_texto,link,preco_antigo,preco_atual,desconto_percentual,cor,ordem",
      )
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    return (data ?? []) as Promo[];
  });

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
        Promoções ativas
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => {
          const img = p.banner_desktop_url || p.imagem_url;
          const color = p.cor
            ? `var(--brand-${p.cor}, ${p.cor})`
            : "var(--brand-magenta)";
          return (
            <a
              key={p.id}
              href={p.link || "#"}
              onClick={(e) => !p.link && e.preventDefault()}
              className="glass group relative flex flex-col overflow-hidden rounded-2xl transition-transform hover:scale-[1.01]"
              style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 25%, transparent)` }}
            >
              {img && (
                <img
                  src={img}
                  alt={p.titulo}
                  className="h-40 w-full object-cover"
                  draggable={false}
                />
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{p.titulo}</h3>
                    {p.subtitulo && (
                      <p className="text-xs text-muted-foreground">{p.subtitulo}</p>
                    )}
                  </div>
                  {p.desconto_percentual != null && p.desconto_percentual > 0 && (
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-bold text-white"
                      style={{ background: color }}
                    >
                      -{Number(p.desconto_percentual).toFixed(0)}%
                    </span>
                  )}
                </div>
                {p.descricao && (
                  <p className="line-clamp-2 text-xs text-muted-foreground/90">{p.descricao}</p>
                )}
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    {p.preco_antigo != null && (
                      <span className="text-xs text-muted-foreground line-through">
                        {brl(p.preco_antigo)}
                      </span>
                    )}
                    {p.preco_atual != null && (
                      <span className="text-lg font-bold" style={{ color }}>
                        {brl(p.preco_atual)}
                      </span>
                    )}
                  </div>
                  {p.botao_texto && p.link && (
                    <span
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: color }}
                    >
                      {p.botao_texto}
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ============ PLANOS ============ */
type Plano = {
  id: string;
  nome: string;
  preco: number | null;
  creditos_incluidos: number | null;
  duracao_dias: number | null;
  descricao: string | null;
  imagem_url: string | null;
  badge: string | null;
  cor_gradiente: string | null;
  cor: string | null;
  beneficios: unknown;
  botao_texto: string | null;
  link: string | null;
  destaque: boolean | null;
};

export function PlanosSection() {
  const items = useLive<Plano>("planos", async () => {
    const { data } = await supabase
      .from("planos")
      .select(
        "id,nome,preco,creditos_incluidos,duracao_dias,descricao,imagem_url,badge,cor_gradiente,cor,beneficios,botao_texto,link,destaque",
      )
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("preco", { ascending: true });
    return (data ?? []) as Plano[];
  });

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Planos</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => {
          const color = p.cor
            ? `var(--brand-${p.cor}, ${p.cor})`
            : p.cor_gradiente
              ? `var(--brand-${p.cor_gradiente})`
              : "var(--brand-violet)";
          const beneficios = Array.isArray(p.beneficios) ? (p.beneficios as string[]) : [];
          return (
            <div
              key={p.id}
              className="glass relative flex flex-col rounded-2xl p-5"
              style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 30%, transparent)` }}
            >
              {p.badge && (
                <span
                  className="absolute right-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: color }}
                >
                  {p.badge}
                </span>
              )}
              <h3 className="text-base font-semibold">{p.nome}</h3>
              {p.descricao && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.descricao}</p>
              )}
              <p className="mt-3 text-2xl font-bold" style={{ color }}>
                {brl(p.preco)}
              </p>
              {p.duracao_dias != null && (
                <p className="text-xs text-muted-foreground">
                  {p.duracao_dias >= 3650
                    ? "Vitalício"
                    : p.duracao_dias >= 365
                      ? `${Math.round(p.duracao_dias / 365)} ano(s)`
                      : `${p.duracao_dias} dias`}
                </p>
              )}
              {beneficios.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {beneficios.slice(0, 5).map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              )}
              {(p.botao_texto || p.link) && (
                <a
                  href={p.link || "#"}
                  onClick={(e) => !p.link && e.preventDefault()}
                  className="mt-4 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white"
                  style={{ background: color }}
                >
                  {p.botao_texto || "Assinar"}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============ PRODUTOS ============ */
type Produto = {
  id: string;
  nome: string;
  titulo: string | null;
  descricao: string | null;
  categoria: string | null;
  preco: number | null;
  imagem_url: string | null;
  estoque: number | null;
  status: string | null;
  botao_texto: string | null;
  link: string | null;
};

export function ProdutosSection() {
  const items = useLive<Produto>("produtos", async () => {
    const { data } = await supabase
      .from("produtos")
      .select(
        "id,nome,titulo,descricao,categoria,preco,imagem_url,estoque,status,botao_texto,link",
      )
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    return (data ?? []) as Produto[];
  });

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Produtos</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="glass overflow-hidden rounded-2xl">
            {p.imagem_url && (
              <img
                src={p.imagem_url}
                alt={p.titulo || p.nome}
                className="h-40 w-full object-cover"
                draggable={false}
              />
            )}
            <div className="flex flex-col gap-1 p-4">
              {p.categoria && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {p.categoria}
                </span>
              )}
              <h3 className="text-sm font-semibold">{p.titulo || p.nome}</h3>
              {p.descricao && (
                <p className="line-clamp-2 text-xs text-muted-foreground/90">{p.descricao}</p>
              )}
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-lg font-bold">{brl(p.preco)}</span>
                {p.status === "esgotado" ? (
                  <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    ESGOTADO
                  </span>
                ) : p.link ? (
                  <a
                    href={p.link}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    {p.botao_texto || "Ver"}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ PROPAGANDAS ============ */
type Propaganda = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  texto: string | null;
  imagem_url: string | null;
  imagem_desktop_url: string | null;
  imagem_mobile_url: string | null;
  botao_texto: string | null;
  link: string | null;
  posicao: string | null;
};

export function PropagandasSection({ posicao = "home" }: { posicao?: string }) {
  const items = useLive<Propaganda>("propagandas", async () => {
    const { data } = await supabase
      .from("propagandas")
      .select(
        "id,titulo,subtitulo,texto,imagem_url,imagem_desktop_url,imagem_mobile_url,botao_texto,link,posicao",
      )
      .eq("ativo", true)
      .order("ordem", { ascending: true });
    return (data ?? []) as Propaganda[];
  });

  const filtered = items.filter((p) => (p.posicao || "home") === posicao);
  if (filtered.length === 0) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((p) => {
        const img = p.imagem_desktop_url || p.imagem_url;
        return (
          <a
            key={p.id}
            href={p.link || "#"}
            onClick={(e) => !p.link && e.preventDefault()}
            className="glass group relative flex overflow-hidden rounded-2xl"
          >
            {img && (
              <img
                src={img}
                alt={p.titulo}
                className="h-24 w-24 shrink-0 object-cover"
                draggable={false}
              />
            )}
            <div className="flex flex-1 flex-col justify-center gap-0.5 p-3">
              <h4 className="text-sm font-semibold">{p.titulo}</h4>
              {p.subtitulo && (
                <p className="text-xs text-muted-foreground">{p.subtitulo}</p>
              )}
              {p.texto && (
                <p className="line-clamp-2 text-xs text-muted-foreground/80">{p.texto}</p>
              )}
              {p.botao_texto && p.link && (
                <span className="mt-1 inline-block w-fit rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {p.botao_texto}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </section>
  );
}
