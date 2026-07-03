"use client";

// AI-bakgrundsborttagning i webbläsaren.
// Primärt: @imgly/background-removal (U²-Net, WASM). Fallback: kant-flood chroma-key.

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

/** Snabb fallback: ta bort sammanhängande bakgrund från kanterna (chroma-key + flood). */
export async function removeBackgroundLocal(src: string): Promise<string> {
  const img = await loadImage(src);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Referensfärg = medel av hörnpixlarna
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
  let r = 0, g = 0, b = 0;
  for (const c of corners) {
    r += px[c];
    g += px[c + 1];
    b += px[c + 2];
  }
  r /= 4;
  g /= 4;
  b /= 4;

  const thresh = 42;
  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  const pushIf = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    visited[i] = 1;
    const o = i * 4;
    const dist = Math.hypot(px[o] - r, px[o + 1] - g, px[o + 2] - b);
    if (dist < thresh) {
      px[o + 3] = 0; // transparent
      stack.push(x, y);
    }
  };
  // starta från alla kantpixlar
  for (let x = 0; x < w; x++) {
    pushIf(x, 0);
    pushIf(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIf(0, y);
    pushIf(w - 1, y);
  }
  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    pushIf(x + 1, y);
    pushIf(x - 1, y);
    pushIf(x, y + 1);
    pushIf(x, y - 1);
  }

  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Försök AI-modell, fall tillbaka på lokal metod. */
export async function removeBackground(src: string): Promise<string> {
  try {
    const mod = await import("@imgly/background-removal");
    const blob = await mod.removeBackground(src, {
      output: { format: "image/png" },
    });
    return await blobToDataUrl(blob);
  } catch (e) {
    console.warn("AI-modell otillgänglig, använder lokal borttagning:", e);
    return removeBackgroundLocal(src);
  }
}
