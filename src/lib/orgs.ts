// Shop-in-shop: förkonfigurerade butiker per förening/företag med låst
// logga och färgprofil. Byt mot org-config i DB (jfr siteId-modell).

export interface OrgProduct {
  garmentId: string;
  colorIndex: number;
}

export interface Org {
  slug: string;
  name: string;
  tagline: string;
  primary: string; // profilfärg
  logoDataUrl: string; // låst logga (SVG)
  products: OrgProduct[];
}

function wordmark(text: string, bg: string, fg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <circle cx="200" cy="150" r="96" fill="none" stroke="${fg}" stroke-width="14"/>
    <circle cx="200" cy="150" r="30" fill="${bg}"/>
    <line x1="200" y1="40" x2="200" y2="260" stroke="${fg}" stroke-width="14"/>
    <line x1="90" y1="150" x2="310" y2="150" stroke="${fg}" stroke-width="14"/>
    <text x="200" y="320" font-family="Oswald, Arial" font-weight="700" font-size="58" fill="${fg}" text-anchor="middle" letter-spacing="2">${text}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoaSafe(svg);
}

function btoaSafe(s: string): string {
  if (typeof window !== "undefined")
    return btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s).toString("base64");
}

export const ORGS: Org[] = [
  {
    slug: "padel-stars",
    name: "Padel Stars",
    tagline: "Klubbkläder för seriespelet — logga och färg redan på plats.",
    primary: "#ff4d1c",
    logoDataUrl: wordmark("PADEL STARS", "#141414", "#ff4d1c"),
    products: [
      { garmentId: "tshirt", colorIndex: 0 },
      { garmentId: "hoodie", colorIndex: 0 },
      { garmentId: "cap", colorIndex: 0 },
      { garmentId: "bag", colorIndex: 1 },
    ],
  },
  {
    slug: "snp",
    name: "SNP-teamet",
    tagline: "Företagsprofilen på plats — beställ din storlek, vi trycker on demand.",
    primary: "#12b5c9",
    logoDataUrl: wordmark("SNP", "#1c2a44", "#12b5c9"),
    products: [
      { garmentId: "tshirt", colorIndex: 3 },
      { garmentId: "hoodie", colorIndex: 3 },
      { garmentId: "longsleeve", colorIndex: 3 },
    ],
  },
];

export function getOrg(slug: string): Org | undefined {
  return ORGS.find((o) => o.slug === slug);
}
