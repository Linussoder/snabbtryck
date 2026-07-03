// DPI- / kvalitetsberäkning mot vald tryckstorlek.

export type QualityLevel = "good" | "warn" | "bad";

export interface QualityResult {
  dpi: number;
  level: QualityLevel;
  // Största bredd (cm) där bilden fortfarande håller >= 300 DPI
  maxWidthCm: number;
  message: string;
}

const CM_PER_INCH = 2.54;

export function dpiForSize(
  naturalW: number,
  naturalH: number,
  printWcm: number,
  printHcm: number
): number {
  if (printWcm <= 0 || printHcm <= 0) return 0;
  const dpiX = naturalW / (printWcm / CM_PER_INCH);
  const dpiY = naturalH / (printHcm / CM_PER_INCH);
  return Math.min(dpiX, dpiY);
}

export function evaluateQuality(
  naturalW: number,
  naturalH: number,
  printWcm: number,
  printHcm: number
): QualityResult {
  const dpi = dpiForSize(naturalW, naturalH, printWcm, printHcm);
  const maxWidthCm = (naturalW / 300) * CM_PER_INCH;

  let level: QualityLevel;
  let message: string;

  if (dpi >= 300) {
    level = "good";
    message = `Skarpt tryck — ${Math.round(dpi)} DPI i ${round(
      printWcm
    )} cm bredd.`;
  } else if (dpi >= 150) {
    level = "warn";
    message = `Okej men inte knivskarpt (${Math.round(
      dpi
    )} DPI). Max rekommenderat ${round(maxWidthCm)} cm bredd för skarpt tryck.`;
  } else {
    level = "bad";
    message = `Din bild blir suddig i ${round(printWcm)} cm bredd — max rekommenderat ${round(
      maxWidthCm
    )} cm.`;
  }

  return { dpi, level, maxWidthCm, message };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
