"use client";

// Browser-baserad AI-uppskalning (UpscalerJS + TensorFlow.js, WebGL).
// Allt laddas on-demand (dynamisk import) så huvud-appens bundle inte påverkas.

export interface Upscaled {
  src: string; // data-URL (PNG)
  width: number;
  height: number;
}

function imgSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = rej;
    img.src = src;
  });
}

/**
 * Skalar upp en bild med en ESRGAN-modell i webbläsaren. `scale` 2 eller 4.
 * Returnerar den uppskalade bilden som data-URL + nya mått.
 */
export async function upscaleImage(src: string, scale: 2 | 4 = 2): Promise<Upscaled> {
  const { default: Upscaler } = await import("upscaler");
  const modelMod =
    scale === 4
      ? await import("@upscalerjs/esrgan-slim/4x")
      : await import("@upscalerjs/esrgan-slim/2x");
  const upscaler = new Upscaler({ model: modelMod.default });
  const result: string = await upscaler.upscale(src, {
    output: "base64",
    patchSize: 64, // bearbeta i rutor → undviker minnestoppar
    padding: 2,
  });
  const { width, height } = await imgSize(result);
  return { src: result, width, height };
}
