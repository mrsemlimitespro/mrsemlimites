import logoAsset from "@/assets/mr-sem-limites-logo.png.asset.json";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "MR Lova";
export const BRAND_TAGLINE = "PREMIUM";
export const BRAND_LOGO_URL = logoAsset.url;

export function BrandMark({
  size = 40,
  className,
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[26%]",
        className,
      )}
      style={{
        width: size,
        height: size,
        boxShadow: glow
          ? "0 0 0 1px color-mix(in oklab, var(--brand-magenta) 55%, transparent), 0 0 22px -2px color-mix(in oklab, var(--brand-magenta) 70%, transparent), 0 0 22px -6px color-mix(in oklab, var(--brand-blue) 55%, transparent)"
          : undefined,
      }}
    >
      <img
        src={BRAND_LOGO_URL}
        alt={`${BRAND_NAME} logo`}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size={36} />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold tracking-[0.14em] text-foreground">
          {BRAND_NAME}
        </p>
        <p
          className="truncate text-[10px] font-medium tracking-[0.35em]"
          style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {BRAND_TAGLINE}
        </p>
      </div>
    </div>
  );
}
