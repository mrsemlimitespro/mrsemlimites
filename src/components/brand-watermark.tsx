import logoAsset from "@/assets/mr-sem-limites-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1] flex items-center justify-center overflow-hidden select-none"
    >
      <img
        src={logoAsset.url}
        alt=""
        className="w-[80vw] max-w-[1000px] opacity-[0.03] object-contain"
        draggable={false}
      />
    </div>
  );
}
