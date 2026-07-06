import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSfx } from "@/lib/sfx";

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
      onMouseEnter={() => playSfx("coin", 1500)}
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
          const neons = [
            { grad: "from-fuchsia-500 via-pink-500 to-orange-400", glow: "255,60,180" },
            { grad: "from-violet-500 via-blue-500 to-cyan-400", glow: "80,120,255" },
            { grad: "from-emerald-400 via-teal-400 to-cyan-400", glow: "40,240,200" },
            { grad: "from-amber-400 via-orange-500 to-red-500", glow: "255,140,40" },
            { grad: "from-indigo-500 via-purple-500 to-pink-500", glow: "200,80,255" },
            { grad: "from-lime-400 via-emerald-400 to-teal-400", glow: "120,255,120" },
          ];
          const n = neons[i % neons.length];
          const inner = (
            <div
              className={`neon-card group relative flex h-24 w-56 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${n.grad} transition-transform hover:scale-[1.08]`}
              style={{
                ["--neon" as never]: n.glow,
                boxShadow: `0 0 0 1px rgba(${n.glow},0.5), 0 0 8px rgba(${n.glow},0.35), 0 0 18px rgba(${n.glow},0.2), inset 0 0 12px rgba(255,255,255,0.08)`,
                animation: `neon-pulse 2.4s ease-in-out ${i * 0.15}s infinite`,
              }}
            >
              {b.imagem_url ? (
                <img
                  src={b.imagem_url}
                  alt={b.titulo}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="px-3 text-center text-sm font-extrabold uppercase tracking-wide text-white [text-shadow:0_0_8px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.5)]">
                  {b.titulo}
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
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
        @keyframes neon-pulse {
          0%, 100% {
            filter: brightness(0.92) saturate(1);
          }
          50% {
            filter: brightness(1.05) saturate(1.15);
          }
        }
      `}</style>
    </section>
  );
}
