"use client";

// A3 gang-sheet (DTF): packar tryckbilder på A3-ark i 300 DPI med
// shelf-bin-packing. Varje bild placeras i sin fysiska cm-storlek.

const A3_MM = { w: 297, h: 420 };
const DPI = 300;
const px = (mm: number) => Math.round((mm / 25.4) * DPI);
const MARGIN = px(6);
const GAP = px(4);

export interface GangItem {
  src: string;
  wCm: number;
  hCm: number;
}

interface Placed {
  img: HTMLImageElement;
  w: number;
  h: number;
  x: number;
  y: number;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

/** Returnerar en data-URL per A3-sida (PNG, 300 DPI). */
export async function buildGangSheets(items: GangItem[]): Promise<string[]> {
  const pageW = px(A3_MM.w);
  const pageH = px(A3_MM.h);

  const loaded = await Promise.all(
    items.map(async (it) => ({ img: await loadImg(it.src), w: px(it.wCm * 10), h: px(it.hCm * 10) }))
  );

  // Shelf-packing, största höjd först för tätare rader.
  loaded.sort((a, b) => b.h - a.h);

  const pages: Placed[][] = [];
  let cur: Placed[] = [];
  let x = MARGIN;
  let y = MARGIN;
  let shelfH = 0;

  for (const it of loaded) {
    let { w, h } = it;
    if (w > pageW - MARGIN * 2) {
      const s = (pageW - MARGIN * 2) / w;
      w *= s;
      h *= s;
    }
    if (h > pageH - MARGIN * 2) {
      const s = (pageH - MARGIN * 2) / h;
      w *= s;
      h *= s;
    }
    if (x + w > pageW - MARGIN) {
      x = MARGIN;
      y += shelfH + GAP;
      shelfH = 0;
    }
    if (y + h > pageH - MARGIN) {
      if (cur.length) pages.push(cur);
      cur = [];
      x = MARGIN;
      y = MARGIN;
      shelfH = 0;
    }
    cur.push({ img: it.img, w, h, x, y });
    x += w + GAP;
    shelfH = Math.max(shelfH, h);
  }
  if (cur.length) pages.push(cur);

  return pages.map((placed) => {
    const c = document.createElement("canvas");
    c.width = pageW;
    c.height = pageH;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageW, pageH);
    for (const p of placed) {
      try {
        ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
      } catch {
        /* korrupt bild hoppas över */
      }
    }
    return c.toDataURL("image/png");
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
