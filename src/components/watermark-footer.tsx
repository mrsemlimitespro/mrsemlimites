const TEXT = "◆ MR SEM LIMITES · PREMIUM ACCESS ◆";

export function WatermarkFooter() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)" }}
    >
      <p
        className="select-none truncate text-center text-[10px] tracking-[0.28em] md:text-xs"
        style={{
          fontFamily:
            '"Courier New", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
          fontWeight: 700,
          color: "color-mix(in oklab, var(--foreground) 32%, transparent)",
          textShadow: "0 0 12px color-mix(in oklab, var(--brand-magenta) 25%, transparent)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderRight: "2px solid color-mix(in oklab, var(--brand-magenta) 60%, transparent)",
          width: "fit-content",
          maxWidth: "100%",
          animation:
            "watermark-type 3.5s steps(28, end) 0.4s 1 normal both, watermark-caret 0.8s step-end infinite",
        }}
      >
        {TEXT}
      </p>
      <style>{`
        @keyframes watermark-type {
          from { width: 0; }
          to { width: 22ch; }
        }
        @keyframes watermark-caret {
          50% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
}
