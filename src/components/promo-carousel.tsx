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

  if (items.length === 0) return null;

  // duplicamos para criar loop infinito visual
  const track = [...items, ...items];
  // duração proporcional à quantidade (~4s por item)
  const duration = Math.max(20, items.length * 4);

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
          const inner = (
            <div className="group relative flex h-24 w-56 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-[color:var(--brand-violet)]/12 via-transparent to-[color:var(--brand-magenta)]/12 transition-transform hover:scale-[1.03]">
              {b.imagem_url ? (
                <img
                  src={b.imagem_url}
                  alt={b.titulo}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="px-3 text-center text-xs font-semibold text-muted-foreground">
                  {b.titulo}
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, color-mix(in oklab, var(--brand-cyan) 25%, transparent) 50%, transparent 70%)",
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
