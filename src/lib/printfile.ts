"use client";

// Tryckfärdig fil (DTF): komponerar HELA designen för en vy — text, bilder och
// emoji — till en transparent PNG i verklig cm-storlek vid 300 DPI, tight
// beskuren runt trycket. Detta är den faktiska transferfilen som skickas till
// DTF-skrivaren (till skillnad från originalbilderna som lagras separat).

import { DesignSnapshot, DesignElement, TextEl } from "./store";
import { getGarment, ViewKey } from "./garments";
import { fontByName } from "./fonts";
import { textLines, CHAR_W } from "./text";
import { ensureCustomFont } from "./customfont";

const DPI = 300;
const pxFromMm = (mm: number) => Math.round((mm / 25.4) * DPI);
const pxFromCm = (cm: number) => pxFromMm(cm * 10);
const PAD_CM = 0.3; // liten marginal runt trycket

export interface PrintFile {
  dataUrl: string;
  widthCm: number;
  heightCm: number;
  view: ViewKey;
}

/** Vyer som faktiskt har element (för att veta vilka tryckfiler som finns). */
export function printViews(design: DesignSnapshot): ViewKey[] {
  const g = getGarment(design.garmentId);
  return g.views.filter((v) => design.elements.some((e) => e.view === v));
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("bild kunde inte laddas"));
    img.src = src;
  });
}

/** Ser till att designens typsnitt är laddade innan canvas-rendering. */
async function ensureFonts(families: string[]): Promise<void> {
  if (typeof document === "undefined") return;
  // Injicera Google Fonts-stylesheet en gång (samma urval som editorn).
  const HREF_ID = "snabbtryck-design-fonts";
  if (!document.getElementById(HREF_ID)) {
    const { GOOGLE_FONTS_HREF } = await import("./fonts");
    const link = document.createElement("link");
    link.id = HREF_ID;
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_HREF;
    document.head.appendChild(link);
  }
  await Promise.all(
    families.map((f) =>
      (document as Document).fonts.load(`700 48px ${f}`).catch(() => {})
    )
  );
  await (document as Document).fonts.ready;
}

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Roterad bounding-box för ett element i full-canvas-px. */
function elementBox(el: DesignElement, fullW: number): Box {
  const cx = el.x * fullW;
  const cy = el.y * fullW; // canvas är kvadratisk
  const hw = (el.w * fullW) / 2;
  const hh = (el.w * el.ar * fullW) / 2;
  const rad = (el.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const ex = hw * cos + hh * sin;
  const ey = hw * sin + hh * cos;
  return { minX: cx - ex, minY: cy - ey, maxX: cx + ex, maxY: cy + ey };
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: DesignElement,
  fullW: number,
  offX: number,
  offY: number,
  img?: HTMLImageElement
) {
  const cx = el.x * fullW - offX;
  const cy = el.y * fullW - offY;
  const w = el.w * fullW;
  const h = el.w * el.ar * fullW;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((el.rotation * Math.PI) / 180);

  if (el.type === "image" && img) {
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else if (el.type === "emoji") {
    ctx.font = `${w * 0.86}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(el.char, 0, 0);
  } else if (el.type === "text") {
    const font = fontByName(el.font);
    const family = el.customFont ?? `${font.family}, sans-serif`;
    const lines = textLines(el.text);
    const longest = Math.max(1, ...lines.map((l) => l.length || 1));
    const fontSize = w / (longest * CHAR_W);
    const lh = fontSize * el.lineHeight;
    const strokeW = el.strokeW > 0 ? (el.strokeW / 100) * fontSize : 0;
    ctx.font = `700 ${fontSize}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const startY = -((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lh;
      ctx.shadowColor = "transparent";
      if (strokeW) {
        ctx.lineJoin = "round";
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = strokeW;
        ctx.strokeText(line, 0, y);
      }
      if (el.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = fontSize * 0.06;
        ctx.shadowOffsetX = fontSize * 0.05;
        ctx.shadowOffsetY = fontSize * 0.05;
      }
      ctx.fillStyle = el.color;
      ctx.fillText(line, 0, y);
      ctx.shadowColor = "transparent";
    });
  }
  ctx.restore();
}

/**
 * Bygger en tryckfärdig transparent PNG för en vy. Returnerar null om vyn
 * saknar element. curve-text renderas som rak text i denna version.
 */
export async function buildPrintFile(
  design: DesignSnapshot,
  view: ViewKey
): Promise<PrintFile | null> {
  const g = getGarment(design.garmentId);
  const els = design.elements.filter((e) => e.view === view);
  if (!els.length) return null;

  const fullW = pxFromCm(g.printRefWidthCm);
  const pad = pxFromCm(PAD_CM);

  // Bounding-box över alla element (+ marginal), klippt till canvas.
  let box: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const el of els) {
    const b = elementBox(el, fullW);
    box = {
      minX: Math.min(box.minX, b.minX),
      minY: Math.min(box.minY, b.minY),
      maxX: Math.max(box.maxX, b.maxX),
      maxY: Math.max(box.maxY, b.maxY),
    };
  }
  const minX = Math.max(0, box.minX - pad);
  const minY = Math.max(0, box.minY - pad);
  const maxX = Math.min(fullW, box.maxX + pad);
  const maxY = Math.min(fullW, box.maxY + pad);
  const wPx = Math.max(1, Math.round(maxX - minX));
  const hPx = Math.max(1, Math.round(maxY - minY));

  // Ladda typsnitt (inkl. ev. egna uppladdade) + bilder.
  await ensureFonts(
    Array.from(new Set(els.filter((e) => e.type === "text").map((e) => fontByName((e as { font: string }).font).family)))
  );
  await Promise.all(
    els
      .filter((e): e is TextEl => e.type === "text" && !!(e as TextEl).customFont && !!(e as TextEl).fontData)
      .map((e) => ensureCustomFont(e.customFont as string, e.fontData as string))
  );
  const imgs = new Map<string, HTMLImageElement>();
  await Promise.all(
    els
      .filter((e) => e.type === "image")
      .map(async (e) => {
        try {
          imgs.set(e.id, await loadImg((e as { src: string }).src));
        } catch {
          /* hoppa över trasig bild */
        }
      })
  );

  const canvas = document.createElement("canvas");
  canvas.width = wPx;
  canvas.height = hPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // Transparent bakgrund (DTF-transfer). Rendera i lager-ordning.
  for (const el of els) {
    drawElement(ctx, el, fullW, minX, minY, el.type === "image" ? imgs.get(el.id) : undefined);
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthCm: Math.round(((maxX - minX) / fullW) * g.printRefWidthCm * 10) / 10,
    heightCm: Math.round(((maxY - minY) / fullW) * g.printRefWidthCm * 10) / 10,
    view,
  };
}
