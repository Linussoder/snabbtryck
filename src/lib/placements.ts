// Standardplaceringar för tryck (DTF). Mått i cm enligt branschstandard för
// vuxenplagg. Presetsen översätts till editorns normaliserade koordinatsystem:
//   el.x, el.y = normaliserat centrum (0..1) av plaggets bounding box
//   el.w       = normaliserad bredd (andel av plaggets bredd)
//   breddCm    = el.w * garment.printRefWidthCm   (samma skala som pris/DPI)
//
// Källor/konvention (typiska mått, vuxen):
//  - Vänster/höger bröst (logga/pocket): ~8–10 cm, oftast max 10×10 cm.
//  - Bröst centrerat: ~20–28 cm brett, högt på bröstet.
//  - Helsida fram: ~28–32 cm brett × ~35–40 cm högt (A3-ish DTF-ark).
//  - Nacke/yoke (övre rygg): ~7–10 cm, högt vid halsringningen.
//  - Rygg helsida: ~30–35 cm brett.
//  - Ärm: ~6–9 cm brett.
// "Vänster/höger" avser den sida du SER i frontvyn (spegelbild av bäraren).

import { Garment, PrintArea, ViewKey } from "./garments";

export interface Placement {
  id: string;
  label: string; // svensk etikett
  view: ViewKey;
  widthCm: number; // önskad tryckbredd (kapas mot tryckytans max)
  heightCm?: number; // nominell höjd, endast för etikett-text
  anchorX: number; // 0..1 inom tryckytans rektangel (elementets centrum)
  anchorY: number; // 0..1 inom tryckytans rektangel
}

/** Plaggformer som räknas som "överdel" med bröst/rygg/ärm-logik. */
const TOP_SHAPES = new Set(["tshirt", "hoodie", "longsleeve", "tank", "jacket"]);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Returnerar tillgängliga placeringar för aktivt plagg + vy. */
export function getPlacements(garment: Garment, view: ViewKey): Placement[] {
  const area = garment.areas.find((a) => a.key === view);
  if (!area) return [];

  if (TOP_SHAPES.has(garment.shape)) {
    if (view === "front") {
      // Bröstplaceringar (logga/pocket-storlek). "Vänster/höger" = sidan du SER.
      const list: Placement[] = [
        { id: "left-chest", label: "Vänster bröst", view, widthCm: 9, heightCm: 9, anchorX: 0.26, anchorY: 0.13 },
        { id: "right-chest", label: "Höger bröst", view, widthCm: 9, heightCm: 9, anchorX: 0.74, anchorY: 0.13 },
      ];
      if (area.maxWcm >= 18) {
        list.push({ id: "center-chest", label: "Bröst centrerat", view, widthCm: Math.min(24, area.maxWcm), heightCm: 14, anchorX: 0.5, anchorY: 0.16 });
        list.push({ id: "lower-front", label: "Nedre fram (mage)", view, widthCm: Math.min(22, area.maxWcm), heightCm: 14, anchorX: 0.5, anchorY: 0.78 });
      }
      if (area.maxWcm >= 24)
        list.push({ id: "full-front", label: "Helsida fram", view, widthCm: Math.min(30, area.maxWcm), heightCm: Math.min(40, area.maxHcm), anchorX: 0.5, anchorY: 0.5 });
      return list;
    }
    if (view === "back") {
      const list: Placement[] = [
        { id: "neck-label", label: "Nacketikett", view, widthCm: 8, heightCm: 6, anchorX: 0.5, anchorY: 0.05 },
      ];
      // Över skulderbladen (yoke / tvärs över övre ryggen) — brett, högt upp.
      if (area.maxWcm >= 22)
        list.push({ id: "upper-back", label: "Övre rygg (axelblad)", view, widthCm: Math.min(30, area.maxWcm), heightCm: 12, anchorX: 0.5, anchorY: 0.2 });
      if (area.maxWcm >= 24) {
        list.push({ id: "full-back", label: "Rygg helsida", view, widthCm: Math.min(34, area.maxWcm), heightCm: Math.min(42, area.maxHcm), anchorX: 0.5, anchorY: 0.48 });
        list.push({ id: "lower-back", label: "Nedre rygg", view, widthCm: Math.min(24, area.maxWcm), heightCm: 14, anchorX: 0.5, anchorY: 0.82 });
      }
      return list;
    }
    if (view === "sleeve") {
      return [
        { id: "sleeve", label: "Ärm", view, widthCm: Math.min(8, area.maxWcm), heightCm: Math.min(10, area.maxHcm), anchorX: 0.5, anchorY: 0.32 },
        { id: "sleeve-long", label: "Ärm (nedåt)", view, widthCm: Math.min(7, area.maxWcm), heightCm: Math.min(24, area.maxHcm), anchorX: 0.5, anchorY: 0.6 },
      ];
    }
  }

  // Accessoarer / underdelar: härled från tryckytan.
  return [
    { id: `${view}-small`, label: `${area.label} litet`, view, widthCm: round1(area.maxWcm * 0.45), anchorX: 0.5, anchorY: 0.5 },
    { id: `${view}-fill`, label: `${area.label} fyll`, view, widthCm: area.maxWcm, heightCm: area.maxHcm, anchorX: 0.5, anchorY: 0.5 },
  ];
}

export interface AppliedPlacement {
  x: number;
  y: number;
  w: number;
  view: ViewKey;
  wcm: number;
  hcm: number;
}

/**
 * Omvandlar en placering till element-patch ({x, y, w}) för ett element med
 * given aspekt (ar = höjd/bredd). Bredd kapas mot tryckytans max-bredd och
 * -höjd så att elementet får plats.
 */
export function applyPlacement(
  p: Placement,
  garment: Garment,
  ar: number
): AppliedPlacement | null {
  const area = garment.areas.find((a) => a.key === p.view);
  if (!area) return null;

  let wcm = Math.min(p.widthCm, area.maxWcm);
  // höjdkapning givet elementets aspekt
  if (ar > 0 && wcm * ar > area.maxHcm) wcm = area.maxHcm / ar;
  const w = wcm / garment.printRefWidthCm;

  const cx = clamp(area.x + p.anchorX * area.w, 0.06, 0.94);
  const cy = clamp(area.y + p.anchorY * area.h, 0.06, 0.94);

  return { x: cx, y: cy, w, view: p.view, wcm, hcm: wcm * ar };
}

/** Etikett-text i Space Mono-stil, t.ex. "30 × 40 cm" eller "9 cm". */
export function placementSpec(p: Placement, area: PrintArea): string {
  const wcm = Math.min(p.widthCm, area.maxWcm);
  if (p.heightCm) {
    const hcm = Math.min(p.heightCm, area.maxHcm);
    return `${round1(wcm)} × ${round1(hcm)} cm`;
  }
  return `${round1(wcm)} cm`;
}

/** True om elementet redan sitter ungefär på placeringen. */
export function isPlacementActive(
  p: Placement,
  garment: Garment,
  el: { x: number; y: number; w: number; ar: number }
): boolean {
  const a = applyPlacement(p, garment, el.ar);
  if (!a) return false;
  return (
    Math.abs(el.x - a.x) < 0.03 &&
    Math.abs(el.y - a.y) < 0.03 &&
    Math.abs(el.w - a.w) < 0.02
  );
}
