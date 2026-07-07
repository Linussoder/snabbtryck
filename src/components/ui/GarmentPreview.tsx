"use client";

import { DesignSnapshot } from "@/lib/store";
import { getGarment, ViewKey } from "@/lib/garments";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { ElementVisual } from "@/components/editor/ElementVisual";

/**
 * Skrivskyddad förhandsvisning av en design — renderar exakt som editorns
 * canvas (riktigt plaggfoto + element i samma normaliserade koordinatsystem),
 * så mockup-bilder matchar det kunden faktiskt designade.
 *
 * Containern måste vara kvadratisk (parent sätter aspect-square eller fast
 * h/w) eftersom koordinaterna antar en kvadratisk yta, precis som DesignCanvas.
 */
export function GarmentPreview({
  design,
  view,
  className = "",
}: {
  design: DesignSnapshot;
  view?: ViewKey;
  className?: string;
}) {
  const g = getGarment(design.garmentId);
  const color = g.colors[design.colorIndex] ?? g.colors[0];

  // Välj vy: given, annars vyn med flest element, annars första vyn.
  let v: ViewKey = view ?? g.views[0];
  if (!view) {
    const counts: Record<string, number> = {};
    design.elements.forEach((e) => (counts[e.view] = (counts[e.view] ?? 0) + 1));
    v =
      (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as ViewKey) ??
      g.views[0];
  }
  const els = design.elements.filter((e) => e.view === v);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <GarmentImage
        shape={g.shape}
        view={v}
        color={color.hex}
        dark={color.dark}
        fit="contain"
        className="absolute inset-0 h-full w-full"
      />
      {els.map((el) => (
        <div
          key={el.id}
          className="pointer-events-none absolute"
          style={{
            left: `${el.x * 100}%`,
            top: `${el.y * 100}%`,
            width: `${el.w * 100}%`,
            height: `${el.w * el.ar * 100}%`,
            transform: `translate(-50%,-50%) rotate(${el.rotation}deg)`,
          }}
        >
          <ElementVisual el={el} />
        </div>
      ))}
    </div>
  );
}
