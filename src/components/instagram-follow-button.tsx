import { Instagram } from "lucide-react";
import { playSfx } from "@/lib/sfx";

const INSTAGRAM_HANDLE = "linkmrstore";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export function InstagramFollowButton() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => playSfx("swipe")}
      aria-label="Segue a @linkmrstore no Instagram — descontos exclusivos"
      title="Segue a @linkmrstore e ganha descontos exclusivos na comunidade e nos packs"
      className="group fixed bottom-40 right-4 z-50 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/70 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-pink-300/60 md:bottom-24 md:right-6 md:px-5 md:py-3 md:text-xs"
      style={{
        boxShadow:
          "0 0 0 1px oklch(1 0 0 / 6%), 0 20px 50px -18px oklch(0 0 0 / 80%), 0 0 42px -8px color-mix(in oklab, oklch(0.68 0.28 340) 60%, transparent)",
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, oklch(0.68 0.28 340) 22%, transparent), color-mix(in oklab, oklch(0.75 0.19 55) 14%, transparent))",
      }}
    >
      <span
        aria-hidden
        className="relative grid size-8 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.75 0.19 55) 0%, oklch(0.68 0.28 340) 50%, oklch(0.62 0.24 295) 100%)",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, oklch(0.68 0.28 340) 55%, transparent), 0 0 22px -4px color-mix(in oklab, oklch(0.68 0.28 340) 80%, transparent)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70 blur-[6px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, oklch(0.68 0.28 340) 70%, transparent) 0%, transparent 70%)",
          }}
        />
        <Instagram className="relative z-10 size-4 text-white" strokeWidth={2.5} />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full opacity-40"
          style={{ background: "oklch(0.68 0.28 340)" }}
        />
      </span>

      <span className="flex flex-col items-start leading-tight">
        <span className="bg-gradient-to-r from-pink-200 via-white to-orange-100 bg-clip-text text-transparent">
          Segue @linkmrstore
        </span>
        <span className="text-[9px] tracking-[0.32em] text-white/60 md:text-[10px]">
          Descontos exclusivos
        </span>
      </span>
    </a>
  );
}
