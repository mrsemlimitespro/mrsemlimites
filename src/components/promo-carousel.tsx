import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Banner = {
  id: string;
  titulo: string;
  imagem_url: string | null;
  link: string | null;
};

/**
 * Marquee infinita colorida — tipo esteira de logos.
 * Puxa da tabela `banners` (apenas ativos, ordenados por `ordem`).
 * Cada item pode ter link (abre em nova aba).
 */
export function PromoCarousel() {
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("banners")
        .select("id,titulo,imagem_url,link")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      if (alive) setItems((data as Banner[]) ?? []);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fallback demo colorido quando não há banners cadastrados
  const demo: Banner[] = [
    { id: "d1", titulo: "🔥 Promoção Relâmpago", imagem_url: null, link: null },
    { id: "d2", titulo: "⚡ Créditos com 20% OFF", imagem_url: null, link: null },
    { id: "d3", titulo: "🎬 Novos Apps IPTV", imagem_url: null, link: null },
    { id: "d4", titulo: "💎 Plano Premium", imagem_url: null, link: null },
    { id: "d5", titulo: "🚀 Ativação Instantânea", imagem_url: null, link: null },
    { id: "d6", titulo: "🎁 Bônus na 1ª compra", imagem_url: null, link: null },
  ];
  const source = items.length > 0 ? items : demo;

  // duplicamos 2x para garantir loop infinito visual sem gap
  const track = [...source, ...source];
  const duration = Math.max(20, source.length * 5);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/40 py-4"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div
        className="flex gap-6 whitespace-nowrap"
        style={{
          animation: `promo-marquee ${duration}s linear infinite`,
          width: "max-content",
        }}
      >
        {track.map((b, i) => {
          const gradients = [
            "from-fuchsia-500/40 via-pink-500/30 to-orange-500/40",
            "from-violet-500/40 via-blue-500/30 to-cyan-500/40",
            "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
            "from-amber-500/40 via-orange-500/30 to-red-500/40",
            "from-indigo-500/40 via-purple-500/30 to-pink-500/40",
            "from-lime-500/40 via-emerald-500/30 to-teal-500/40",
          ];
          const grad = gradients[i % gradients.length];
          const inner = (
            <div className={`group relative flex h-24 w-56 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${grad} shadow-lg transition-transform hover:scale-[1.05]`}>
              {b.imagem_url ? (
                <img
                  src={b.imagem_url}
                  alt={b.titulo}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="px-3 text-center text-sm font-bold text-white drop-shadow-lg">
                  {b.titulo}
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
                }}
              />
            </div>
          );
          return b.link ? (
            <a
              key={`${b.id}-${i}`}
              href={b.link}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0"
              aria-label={b.titulo}
            >
              {inner}
            </a>
          ) : (
            <div key={`${b.id}-${i}`} className="shrink-0">
              {inner}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes promo-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
