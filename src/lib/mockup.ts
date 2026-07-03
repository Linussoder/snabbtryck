import { DesignSnapshot, DesignElement } from "./store";
import { getGarment, ViewKey } from "./garments";
import { GARMENT_PATHS } from "./garmentPaths";
import { fontByName } from "./fonts";

function esc(s: string): string {
  return s.replace(/[<>&"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : "&quot;"
  );
}

function elementSVG(el: DesignElement): string {
  const cx = el.x * 100;
  const cy = el.y * 100;
  const w = el.w * 100;
  const h = w * el.ar;
  const t = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${el.rotation})`;

  if (el.type === "image") {
    return `<g transform="${t}"><image href="${el.src}" x="${(-w / 2).toFixed(
      2
    )}" y="${(-h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(
      2
    )}" preserveAspectRatio="xMidYMid meet"/></g>`;
  }
  if (el.type === "emoji") {
    return `<g transform="${t}"><text x="0" y="0" font-size="${w.toFixed(
      2
    )}" text-anchor="middle" dominant-baseline="central">${esc(
      el.char
    )}</text></g>`;
  }
  // text
  const lines = el.text.split("\n");
  const fam = fontByName(el.font).family.replace(/'/g, "");
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const fontSize = Math.min(h / lines.length, (w / (longest * 0.58)) * 1.0);
  const lh = fontSize * el.lineHeight;
  const startY = -((lines.length - 1) * lh) / 2;
  const rows = lines
    .map(
      (l, i) =>
        `<text x="0" y="${(startY + i * lh).toFixed(
          2
        )}" font-family="${fam}, sans-serif" font-weight="700" font-size="${fontSize.toFixed(
          2
        )}" fill="${el.color}" ${
          el.strokeW > 0
            ? `stroke="${el.stroke}" stroke-width="${(
                (el.strokeW / 100) *
                fontSize
              ).toFixed(2)}" paint-order="stroke"`
            : ""
        } text-anchor="middle" dominant-baseline="central">${esc(l)}</text>`
    )
    .join("");
  return `<g transform="${t}">${rows}</g>`;
}

export function buildMockupSVG(
  snap: DesignSnapshot,
  view?: ViewKey,
  size = 640
): string {
  const g = getGarment(snap.garmentId);
  const color = g.colors[snap.colorIndex] ?? g.colors[0];
  // Välj vy: given, annars vy med flest element, annars fram
  let v: ViewKey = view ?? g.views[0];
  if (!view) {
    const counts: Record<string, number> = {};
    snap.elements.forEach((e) => (counts[e.view] = (counts[e.view] ?? 0) + 1));
    v = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as ViewKey) ?? g.views[0];
  }
  const els = snap.elements.filter((e) => e.view === v);
  const stroke = color.dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.25)";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" fill="#ecece6"/>
  <path d="${GARMENT_PATHS[g.shape]}" fill="${color.hex}" stroke="${stroke}" stroke-width="1"/>
  ${els.map(elementSVG).join("\n  ")}
</svg>`;
}

export function mockupDataUrl(
  snap: DesignSnapshot,
  view?: ViewKey,
  size = 640
): string {
  const svg = buildMockupSVG(snap, view, size);
  if (typeof window === "undefined") {
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  }
  return (
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)))
  );
}
