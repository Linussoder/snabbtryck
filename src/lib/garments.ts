// Plagg-katalog. Priser i SEK inkl. moms (25%).
// Tryckytor och referensmått anges i cm för pris- och DPI-beräkning.

export type ViewKey = "front" | "back" | "sleeve";
export type GarmentShape =
  | "tshirt"
  | "hoodie"
  | "longsleeve"
  | "tank"
  | "shorts"
  | "pants"
  | "jacket"
  | "cap"
  | "bag";

export interface PrintArea {
  key: ViewKey;
  label: string; // "Bröst", "Rygg", "Ärm"
  // Normaliserad rektangel (0..1) inom plaggets bounding box
  x: number;
  y: number;
  w: number;
  h: number;
  // Verklig maxbredd/-höjd för denna tryckyta, i cm
  maxWcm: number;
  maxHcm: number;
}

export interface GarmentColor {
  name: string;
  hex: string;
  dark: boolean; // mörkt plagg → ljus canvas-kontur
}

export interface Garment {
  id: string;
  name: string;
  category: string;
  shape: GarmentShape;
  basePrice: number; // per plagg, inkl. moms
  colors: GarmentColor[];
  sizes: string[];
  views: ViewKey[];
  areas: PrintArea[];
  // Referensbredd i cm som motsvarar hela canvasens bredd (för cm/DPI-skala)
  printRefWidthCm: number;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const NUMERIC_SIZES = ["S", "M", "L", "XL", "2XL"];

const COMMON_COLORS: GarmentColor[] = [
  { name: "Svart", hex: "#141414", dark: true },
  { name: "Vit", hex: "#f4f4f0", dark: false },
  { name: "Grafit", hex: "#3d3d3d", dark: true },
  { name: "Marin", hex: "#1c2a44", dark: true },
  { name: "Ceriseröd", hex: "#b3122b", dark: true },
  { name: "Flaskgrön", hex: "#1f4030", dark: true },
  { name: "Sand", hex: "#d8cbb2", dark: false },
  { name: "Signal", hex: "#ff4d1c", dark: true },
];

export const GARMENTS: Garment[] = [
  {
    id: "tshirt",
    name: "T-shirt",
    category: "Överdel",
    shape: "tshirt",
    basePrice: 149,
    colors: COMMON_COLORS,
    sizes: APPAREL_SIZES,
    views: ["front", "back", "sleeve"],
    areas: [
      { key: "front", label: "Bröst", x: 0.348, y: 0.175, w: 0.312, h: 0.343, maxWcm: 30, maxHcm: 38 },
      { key: "back", label: "Rygg", x: 0.317, y: 0.142, w: 0.359, h: 0.416, maxWcm: 35, maxHcm: 45 },
      { key: "sleeve", label: "Ärm", x: 0.06, y: 0.28, w: 0.14, h: 0.12, maxWcm: 9, maxHcm: 28 },
    ],
    printRefWidthCm: 50,
  },
  {
    id: "hoodie",
    name: "Hoodie",
    category: "Överdel",
    shape: "hoodie",
    basePrice: 399,
    colors: COMMON_COLORS,
    sizes: APPAREL_SIZES,
    views: ["front", "back", "sleeve"],
    areas: [
      { key: "front", label: "Bröst", x: 0.369, y: 0.286, w: 0.258, h: 0.203, maxWcm: 26, maxHcm: 22 },
      { key: "back", label: "Rygg", x: 0.329, y: 0.14, w: 0.357, h: 0.396, maxWcm: 35, maxHcm: 45 },
      { key: "sleeve", label: "Ärm", x: 0.05, y: 0.3, w: 0.14, h: 0.12, maxWcm: 9, maxHcm: 28 },
    ],
    printRefWidthCm: 52,
  },
  {
    id: "longsleeve",
    name: "Långärmad",
    category: "Överdel",
    shape: "longsleeve",
    basePrice: 199,
    colors: COMMON_COLORS,
    sizes: APPAREL_SIZES,
    views: ["front", "back", "sleeve"],
    areas: [
      { key: "front", label: "Bröst", x: 0.375, y: 0.186, w: 0.248, h: 0.324, maxWcm: 30, maxHcm: 38 },
      { key: "back", label: "Rygg", x: 0.35, y: 0.149, w: 0.301, h: 0.397, maxWcm: 35, maxHcm: 45 },
      { key: "sleeve", label: "Ärm", x: 0.06, y: 0.28, w: 0.14, h: 0.12, maxWcm: 9, maxHcm: 28 },
    ],
    printRefWidthCm: 50,
  },
  {
    id: "tank",
    name: "Linne",
    category: "Överdel",
    shape: "tank",
    basePrice: 139,
    colors: COMMON_COLORS,
    sizes: APPAREL_SIZES,
    views: ["front", "back"],
    areas: [
      { key: "front", label: "Bröst", x: 0.368, y: 0.191, w: 0.262, h: 0.361, maxWcm: 26, maxHcm: 36 },
      { key: "back", label: "Rygg", x: 0.342, y: 0.153, w: 0.297, h: 0.422, maxWcm: 30, maxHcm: 44 },
    ],
    printRefWidthCm: 46,
  },
  {
    id: "jacket",
    name: "Jacka",
    category: "Överdel",
    shape: "jacket",
    basePrice: 549,
    colors: COMMON_COLORS,
    sizes: APPAREL_SIZES,
    views: ["front", "back", "sleeve"],
    areas: [
      { key: "front", label: "Bröst v.", x: 0.36, y: 0.242, w: 0.131, h: 0.135, maxWcm: 12, maxHcm: 10 },
      { key: "back", label: "Rygg", x: 0.322, y: 0.168, w: 0.355, h: 0.379, maxWcm: 36, maxHcm: 42 },
      { key: "sleeve", label: "Ärm", x: 0.05, y: 0.3, w: 0.14, h: 0.12, maxWcm: 9, maxHcm: 28 },
    ],
    printRefWidthCm: 54,
  },
  {
    id: "shorts",
    name: "Shorts",
    category: "Underdel",
    shape: "shorts",
    basePrice: 179,
    colors: COMMON_COLORS,
    sizes: NUMERIC_SIZES,
    views: ["front", "back"],
    areas: [
      { key: "front", label: "Lår v.", x: 0.281, y: 0.308, w: 0.191, h: 0.33, maxWcm: 14, maxHcm: 18 },
      { key: "back", label: "Bak", x: 0.306, y: 0.31, w: 0.186, h: 0.33, maxWcm: 16, maxHcm: 18 },
    ],
    printRefWidthCm: 44,
  },
  {
    id: "pants",
    name: "Byxor",
    category: "Underdel",
    shape: "pants",
    basePrice: 299,
    colors: COMMON_COLORS,
    sizes: NUMERIC_SIZES,
    views: ["front", "back"],
    areas: [
      { key: "front", label: "Lår v.", x: 0.309, y: 0.128, w: 0.156, h: 0.28, maxWcm: 12, maxHcm: 16 },
      { key: "back", label: "Bak", x: 0.324, y: 0.122, w: 0.154, h: 0.281, maxWcm: 14, maxHcm: 16 },
    ],
    printRefWidthCm: 42,
  },
  {
    id: "cap",
    name: "Keps",
    category: "Accessoar",
    shape: "cap",
    basePrice: 129,
    colors: COMMON_COLORS,
    sizes: ["One size"],
    views: ["front", "back"],
    areas: [
      { key: "front", label: "Front", x: 0.328, y: 0.34, w: 0.335, h: 0.254, maxWcm: 12, maxHcm: 6 },
      { key: "back", label: "Bak", x: 0.367, y: 0.378, w: 0.251, h: 0.174, maxWcm: 9, maxHcm: 5 },
    ],
    printRefWidthCm: 28,
  },
  {
    id: "bag",
    name: "Tygväska",
    category: "Accessoar",
    shape: "bag",
    basePrice: 99,
    colors: [
      { name: "Natur", hex: "#e6ddc4", dark: false },
      { name: "Svart", hex: "#141414", dark: true },
      { name: "Marin", hex: "#1c2a44", dark: true },
    ],
    sizes: ["One size"],
    views: ["front", "back"],
    areas: [
      { key: "front", label: "Front", x: 0.321, y: 0.235, w: 0.354, h: 0.492, maxWcm: 28, maxHcm: 32 },
      { key: "back", label: "Bak", x: 0.321, y: 0.235, w: 0.354, h: 0.492, maxWcm: 28, maxHcm: 32 },
    ],
    printRefWidthCm: 40,
  },
];

export const CATEGORIES = ["Överdel", "Underdel", "Accessoar"];

export function getGarment(id: string): Garment {
  return GARMENTS.find((g) => g.id === id) ?? GARMENTS[0];
}

export const VIEW_LABEL: Record<ViewKey, string> = {
  front: "Fram",
  back: "Bak",
  sleeve: "Ärm",
};
