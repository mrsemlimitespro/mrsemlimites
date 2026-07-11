import { MessageCircle } from "lucide-react";
import { playSfx } from "@/lib/sfx";

const WHATSAPP_PHONE = "5511956915920";
const WHATSAPP_MESSAGE = "Vim do MR Sem Limites, quero conhecer a Extensão da Lovable";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export function WhatsappZapButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => playSfx("swipe")}
      aria-label="Zap Lovable Sem Limites — falar no WhatsApp"
      className="group fixed bottom-44 right-4 z-50 inline-flex w-[13.5rem] items-center gap-2.5 rounded-full border border-white/15 bg-black/70 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-emerald-300/60 md:bottom-28 md:right-6 md:w-[15rem] md:px-5 md:py-3 md:text-xs"
      style={{
        boxShadow:
          "0 0 0 1px oklch(1 0 0 / 6%), 0 20px 50px -18px oklch(0 0 0 / 80%), 0 0 42px -8px color-mix(in oklab, oklch(0.72 0.19 155) 60%, transparent)",
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, oklch(0.72 0.19 155) 22%, transparent), color-mix(in oklab, oklch(0.68 0.2 250) 14%, transparent))",
      }}
    >
      <span
        aria-hidden
        className="relative grid size-8 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.78 0.19 155), oklch(0.62 0.19 155))",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, oklch(0.78 0.19 155) 55%, transparent), 0 0 22px -4px color-mix(in oklab, oklch(0.78 0.19 155) 80%, transparent)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70 blur-[6px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, oklch(0.78 0.19 155) 70%, transparent) 0%, transparent 70%)",
          }}
        />
        <MessageCircle
          className="relative z-10 size-4 text-black"
          strokeWidth={2.5}
          fill="currentColor"
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full opacity-40"
          style={{ background: "oklch(0.78 0.19 155)" }}
        />
      </span>

      <span className="flex flex-col items-start leading-tight">
        <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-transparent">
          Zap Lovable
        </span>
        <span className="text-[9px] tracking-[0.32em] text-white/60 md:text-[10px]">
          Sem Limites
        </span>
      </span>
    </a>
  );
}
