import { DesignSnapshot, DesignElement } from "./store";

// Färdiga designmallar — text/emoji-baserade (inga bildassets → renderar överallt).
// Laddas in i editorn via /designa?template=<id>.

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
    elements: [txt("DITT LAG", 0.34, 0.5), txt("07", 0.6, 0.28, "#FFDA00")] },
  { id: "forening", name: "Föreningen", category: "Lag & förening", garmentId: "hoodie", colorIndex: 3,
    elements: [emo("⚽", 0.34, 0.24), txt("FÖRENINGEN", 0.56, 0.6)] },
  { id: "svensexa", name: "Svensexa", category: "Fest & event", garmentId: "tshirt", colorIndex: 0,
    elements: [txt("SVENSEXA", 0.32, 0.6), txt("2026", 0.52, 0.34, "#00AEEF"), emo("🎉", 0.72, 0.18)] },
  { id: "mohippa", name: "Möhippa", category: "Fest & event", garmentId: "tshirt", colorIndex: 4,
    elements: [emo("👑", 0.3, 0.2), txt("MÖHIPPA", 0.52, 0.58, "#ffffff")] },
  { id: "student", name: "Student -26", category: "Fest & event", garmentId: "tshirt", colorIndex: 1,
    elements: [txt("STUDENT", 0.34, 0.6, "#141414"), txt("-26", 0.56, 0.3, "#b3122b"), emo("🎓", 0.75, 0.16)] },
  { id: "foretag", name: "Företag – text här", category: "Företag", garmentId: "tshirt", colorIndex: 2,
    elements: [txt("DITT FÖRETAG", 0.42, 0.62), txt("EST. 2026", 0.6, 0.32, "#FFDA00", { ar: 0.24 })] },
  { id: "team", name: "Team 2026", category: "Företag", garmentId: "hoodie", colorIndex: 0,
    elements: [txt("TEAM", 0.34, 0.44), txt("2026", 0.56, 0.5, "#00AEEF")] },
  { id: "chefen", name: "Chefen", category: "Kul", garmentId: "tshirt", colorIndex: 0,
    elements: [txt("CHEFEN", 0.42, 0.6, "#FFDA00")] },
  { id: "bast-fore", name: "Bäst före", category: "Kul", garmentId: "tshirt", colorIndex: 7,
    elements: [txt("BÄST FÖRE", 0.4, 0.6, "#141414"), txt("1990", 0.6, 0.42, "#141414")] },
  { id: "hjarta", name: "Kärlek", category: "Kul", garmentId: "tshirt", colorIndex: 1,
    elements: [emo("❤️", 0.45, 0.4)] },
];

export function getTemplate(id: string): DesignSnapshot | null {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) return null;
  return {
    id: "",
    name: t.name,
    garmentId: t.garmentId,
    colorIndex: t.colorIndex,
    size: "M",
    qty: 1,
    elements: JSON.parse(JSON.stringify(t.elements)),
    updatedAt: 0,
  };
}
