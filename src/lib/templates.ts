import { DesignSnapshot, DesignElement } from "./store";
import { getGarment } from "./garments";
import { clampToArea, maxWidthInArea } from "./placements";

// Färdiga designmallar — text/emoji-baserade (inga bildassets → renderar överallt).
// Laddas in i editorn via /designa?template=<id>.
// Koordinaterna ligger inom respektive plaggs tryckyta (t-shirt front:
// x 0.348–0.660, y 0.175–0.518 · hoodie front: x 0.369–0.627, y 0.286–0.489)
// och getTemplate() klipper dessutom in allt som säkerhetsnät.

export interface Template {
  id: string;
  name: string;
  category: string;
  garmentId: string;
  colorIndex: number;
  elements: DesignElement[];
}

let n = 0;
const uid = () => `tpl_${n++}`;

function txt(text: string, y: number, w: number, color = "#ffffff", extra: Partial<DesignElement> = {}): DesignElement {
  return {
    id: uid(),
    type: "text",
    view: "front",
    x: 0.5,
    y,
    w,
    ar: 0.32,
    rotation: 0,
    text,
    font: "Anton",
    color,
    stroke: "#0a0a0a",
    strokeW: 0,
    curve: 0,
    lineHeight: 1.02,
    ...extra,
  } as DesignElement;
}
function emo(char: string, y: number, w: number): DesignElement {
  return { id: uid(), type: "emoji", view: "front", x: 0.5, y, w, ar: 1, rotation: 0, char } as DesignElement;
}

export const TEMPLATES: Template[] = [
  { id: "lag-namn", name: "Lagnamn + nummer", category: "Lag & förening", garmentId: "tshirt", colorIndex: 0,
    elements: [txt("DITT LAG", 0.26, 0.3), txt("07", 0.38, 0.2, "#FFDA00")] },
  { id: "forening", name: "Föreningen", category: "Lag & förening", garmentId: "hoodie", colorIndex: 3,
    elements: [emo("⚽", 0.34, 0.1), txt("FÖRENINGEN", 0.435, 0.25)] },
  { id: "svensexa", name: "Svensexa", category: "Fest & event", garmentId: "tshirt", colorIndex: 0,
    elements: [txt("SVENSEXA", 0.26, 0.3), txt("2026", 0.35, 0.18, "#00AEEF"), emo("🎉", 0.44, 0.12)] },
  { id: "mohippa", name: "Möhippa", category: "Fest & event", garmentId: "tshirt", colorIndex: 4,
    elements: [emo("👑", 0.235, 0.1), txt("MÖHIPPA", 0.33, 0.28, "#ffffff")] },
  { id: "student", name: "Student -26", category: "Fest & event", garmentId: "tshirt", colorIndex: 1,
    elements: [txt("STUDENT", 0.26, 0.3, "#141414"), txt("-26", 0.345, 0.16, "#b3122b"), emo("🎓", 0.43, 0.1)] },
  { id: "foretag", name: "Företag – text här", category: "Företag", garmentId: "tshirt", colorIndex: 2,
    elements: [txt("DITT FÖRETAG", 0.28, 0.3), txt("EST. 2026", 0.365, 0.18, "#FFDA00", { ar: 0.24 })] },
  { id: "team", name: "Team 2026", category: "Företag", garmentId: "hoodie", colorIndex: 0,
    elements: [txt("TEAM", 0.33, 0.22), txt("2026", 0.42, 0.25, "#00AEEF")] },
  { id: "chefen", name: "Chefen", category: "Kul", garmentId: "tshirt", colorIndex: 0,
    elements: [txt("CHEFEN", 0.34, 0.3, "#FFDA00")] },
  { id: "bast-fore", name: "Bäst före", category: "Kul", garmentId: "tshirt", colorIndex: 7,
    elements: [txt("BÄST FÖRE", 0.27, 0.3, "#141414"), txt("1990", 0.37, 0.22, "#141414")] },
  { id: "hjarta", name: "Kärlek", category: "Kul", garmentId: "tshirt", colorIndex: 1,
    elements: [emo("❤️", 0.34, 0.24)] },
];

export function getTemplate(id: string): DesignSnapshot | null {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) return null;
  // Säkerhetsnät: klipp in alla element i plaggets tryckyta.
  const g = getGarment(t.garmentId);
  const elements = (JSON.parse(JSON.stringify(t.elements)) as DesignElement[]).map((el) => {
    const area = g.areas.find((a) => a.key === el.view);
    if (!area) return el;
    const w = Math.min(el.w, maxWidthInArea(area, el.ar));
    return { ...el, w, ...clampToArea(el.x, el.y, w, el.ar, area) };
  });
  return {
    id: "",
    name: t.name,
    garmentId: t.garmentId,
    colorIndex: t.colorIndex,
    size: "M",
    qty: 1,
    elements,
    updatedAt: 0,
  };
}
