import logoAsset from "@/assets/mr-sem-limites-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  variant?: "horizontal" | "mark";
}

export function BrandLogo({ className, size, variant = "horizontal" }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)} style={{ width: size, height: size }}>
      <img
        src={logoAsset.url}
        alt="MR SEM LIMITES"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
