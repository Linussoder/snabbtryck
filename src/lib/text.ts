// Deterministisk text-geometri så canvas, pris och mockup är samstämmiga.
export const CHAR_W = 0.58; // approx teckenbredd / fontstorlek

export function textLines(text: string): string[] {
  return text.length ? text.split("\n") : [" "];
}

export function textAspect(text: string, lineHeight: number): number {
  const lines = textLines(text);
  const longest = Math.max(1, ...lines.map((l) => l.length || 1));
  return (lines.length * lineHeight) / (longest * CHAR_W);
}
