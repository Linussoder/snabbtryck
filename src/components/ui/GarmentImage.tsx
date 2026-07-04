"use client";

import { GARMENT_IMAGES, GarmentImg } from "@/lib/garmentImages";
import { GarmentShape as Shape, ViewKey } from "@/lib/garments";
import { GarmentShape as GarmentSvg } from "./GarmentShape";
import { useSettings } from "@/components/settings/SettingsProvider";

// Modellfria Printful-produktbilder (färgsatta ghost/flat-mallar), fram + bak,
// med närmaste-färg-matchning. Ärm-vyn faller tillbaka på SVG-silhuetten.

function rgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function nearestSrc(list: GarmentImg[] | undefined, hex: string): string | null {
  if (!list || !list.length) return null;
  const [r, g, b] = rgb(hex);
  let best = list[0].src;
  let bestD = Infinity;
  for (const item of list) {
    const [r2, g2, b2] = rgb(item.hex);
    const d = 2 * (r - r2) ** 2 + 4 * (g - g2) ** 2 + 3 * (b - b2) ** 2;
    if (d < bestD) {
      bestD = d;
      best = item.src;
    }
  }
  return best;
}

export function GarmentImage({
  shape,
  view = "front",
  color,
  dark,
  className = "",
  fit = "cover",
  alt = "",
}: {
  shape: Shape;
  view?: ViewKey;
  color: string;
  dark: boolean;
  className?: string;
  fit?: "cover" | "contain";
  alt?: string;
}) {
  const { productImages } = useSettings();
  const override = view === "back" ? productImages[shape]?.back : view === "front" ? productImages[shape]?.front : undefined;
  const entry = GARMENT_IMAGES[shape];
  const list = entry ? (view === "back" ? entry.back : view === "front" ? entry.front : undefined) : undefined;
  const src = override ?? nearestSrc(list, color);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        style={{ objectFit: fit, objectPosition: "center top", width: "100%", height: "100%" }}
      />
    );
  }
  // Fallback: vektor-silhuett (bak/ärm-vyer, eller plagg utan foto)
  return <GarmentSvg shape={shape} view={view} color={color} dark={dark} className={className} />;
}
