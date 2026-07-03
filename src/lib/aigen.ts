"use client";

// AI-designgenerator (DEMO-stub).
// Genererar en tryckfärdig platshållar-grafik från en text-prompt.
// Byt ut mot riktig bildmodell (t.ex. via Vercel AI Gateway) — samma retur (data-URL).

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PALETTES = [
  ["#FF4D1C", "#0A0A0A", "#F5F5F0"],
  ["#12b5c9", "#0A0A0A", "#FFD23F"],
  ["#e0218a", "#1c2a44", "#F5F5F0"],
  ["#2f9e44", "#0A0A0A", "#FF4D1C"],
  ["#FFD23F", "#141414", "#FF4D1C"],
];

export interface AiGenResult {
  dataUrl: string;
  naturalW: number;
  naturalH: number;
}

export async function generateDesign(prompt: string): Promise<AiGenResult> {
  // simulerad genereringstid
  await new Promise((r) => setTimeout(r, 1400));
  const seed = hash(prompt.toLowerCase().trim() || "tryck");
  const pal = PALETTES[seed % PALETTES.length];
  const rnd = mulberry(seed);
  const S = 800;

  const shapes: string[] = [];
  const kinds = ["circle", "burst", "ring", "triangle"];
  for (let i = 0; i < 5; i++) {
    const k = kinds[Math.floor(rnd() * kinds.length)];
    const cx = 120 + rnd() * (S - 240);
    const cy = 120 + rnd() * (S - 320);
    const r = 60 + rnd() * 160;
    const fill = pal[Math.floor(rnd() * pal.length)];
    if (k === "circle") shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="0.9"/>`);
    else if (k === "ring")
      shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fill}" stroke-width="${8 + rnd() * 22}"/>`);
    else if (k === "triangle")
      shapes.push(
        `<path d="M${cx} ${cy - r} L${cx + r} ${cy + r} L${cx - r} ${cy + r} Z" fill="${fill}" opacity="0.9"/>`
      );
    else {
      let d = "";
      const pts = 12;
      for (let p = 0; p < pts * 2; p++) {
        const ang = (Math.PI * p) / pts;
        const rr = p % 2 ? r : r * 0.5;
        d += `${p === 0 ? "M" : "L"}${(cx + Math.cos(ang) * rr).toFixed(1)} ${(cy + Math.sin(ang) * rr).toFixed(1)} `;
      }
      shapes.push(`<path d="${d}Z" fill="${fill}" opacity="0.9"/>`);
    }
  }

  const words = prompt.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 3);
  const label = words.join(" ") || "TRYCK";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
    <rect width="${S}" height="${S}" fill="none"/>
    ${shapes.join("\n    ")}
    <g>
      <rect x="${S / 2 - 260}" y="${S - 220}" width="520" height="120" fill="${pal[1]}" rx="6"/>
      <text x="${S / 2}" y="${S - 145}" font-family="Oswald, Arial, sans-serif" font-weight="700" font-size="72" fill="${pal[2]}" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">${label}</text>
    </g>
  </svg>`;

  const dataUrl =
    "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  return { dataUrl, naturalW: S, naturalH: S };
}

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
