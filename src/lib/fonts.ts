// Utvalda tryck-typsnitt för textverktyget.
// Laddas via Google Fonts i designverktyget (kundinnehåll, ej UI).

export interface DesignFont {
  name: string; // visningsnamn
  family: string; // css font-family
  category: "Display" | "Script" | "Sans" | "Serif";
  weight?: number;
}

export const DESIGN_FONTS: DesignFont[] = [
  { name: "Oswald", family: "Oswald", category: "Display", weight: 600 },
  { name: "Anton", family: "Anton", category: "Display" },
  { name: "Bebas Neue", family: "'Bebas Neue'", category: "Display" },
  { name: "Archivo Black", family: "'Archivo Black'", category: "Display" },
  { name: "Righteous", family: "Righteous", category: "Display" },
  { name: "Bangers", family: "Bangers", category: "Display" },
  { name: "Press Start", family: "'Press Start 2P'", category: "Display" },
  { name: "Pacifico", family: "Pacifico", category: "Script" },
  { name: "Lobster", family: "Lobster", category: "Script" },
  { name: "Dancing", family: "'Dancing Script'", category: "Script", weight: 700 },
  { name: "Caveat", family: "Caveat", category: "Script", weight: 700 },
  { name: "Marker", family: "'Permanent Marker'", category: "Script" },
  { name: "Playfair", family: "'Playfair Display'", category: "Serif", weight: 700 },
  { name: "Montserrat", family: "Montserrat", category: "Sans", weight: 700 },
  { name: "Poppins", family: "Poppins", category: "Sans", weight: 600 },
];

// Google Fonts URL som laddar hela urvalet
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Oswald:wght@400;600;700",
    "family=Anton",
    "family=Bebas+Neue",
    "family=Archivo+Black",
    "family=Righteous",
    "family=Bangers",
    "family=Press+Start+2P",
    "family=Pacifico",
    "family=Lobster",
    "family=Dancing+Script:wght@700",
    "family=Caveat:wght@700",
    "family=Permanent+Marker",
    "family=Playfair+Display:wght@700;900",
    "family=Montserrat:wght@700;900",
    "family=Poppins:wght@600;800",
  ].join("&") +
  "&display=swap";

export function fontByName(name: string): DesignFont {
  return DESIGN_FONTS.find((f) => f.name === name) ?? DESIGN_FONTS[0];
}
