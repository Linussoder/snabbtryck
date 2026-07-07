"use client";

// Registrerar egna (uppladdade) typsnitt i document.fonts så att både
// editorns SVG-rendering och den canvas-baserade tryckfilen kan använda dem.
// Fontdatan (data-URL) lagras på text-elementet så designen bär sitt typsnitt
// även när den öppnas i en annan session (t.ex. produktion).

const registered = new Set<string>();

/** Skapar ett giltigt, unikt CSS-family-namn från ett filnamn. */
export function familyFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `Custom_${base || "font"}`;
}

/** Registrerar en font-family från en data-URL (idempotent per family). */
export async function ensureCustomFont(family: string, dataUrl: string): Promise<void> {
  if (typeof document === "undefined" || registered.has(family)) return;
  try {
    const face = new FontFace(family, `url(${dataUrl})`);
    await face.load();
    (document as Document).fonts.add(face);
    registered.add(family);
  } catch {
    /* ogiltig fontfil — faller tillbaka på standardtypsnitt */
  }
}

/** Läser en fontfil som data-URL. */
export function readFontFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("kunde inte läsa fontfilen"));
    fr.readAsDataURL(file);
  });
}
