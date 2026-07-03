import { Garment } from "./garments";
import type { DesignElement } from "./store";

/** Tryckyta (cm²) för ett plagg = summa av elementens bounding-box.
 *  Ren funktion (ingen klient-kod) → körbar server-side för prisvalidering. */
export function computePrintArea(
  elements: DesignElement[],
  garment: Garment
): number {
  let total = 0;
  for (const el of elements) {
    const wcm = el.w * garment.printRefWidthCm;
    const hcm = wcm * el.ar;
    // text/emoji fyller inte hela sin box → skala ner något
    const fill = el.type === "image" ? 1 : el.type === "emoji" ? 0.78 : 0.62;
    total += wcm * hcm * fill;
  }
  return Math.round(total);
}
