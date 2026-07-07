import { DesignSnapshot } from "./store";

// Namn/nummer-variabler för lagtryck. Text som innehåller {namn}/{nummer}
// (eller {name}/{number}) ersätts per person så varje spelare får sin egen
// tryckfil från samma grunddesign.

const VAR_RE = /\{\s*(namn|name|nummer|number)\s*\}/gi;

export interface PersonVars {
  name: string;
  number: string;
}

/** True om designen innehåller minst en namn/nummer-variabel. */
export function hasVars(d: DesignSnapshot): boolean {
  const re = /\{\s*(namn|name|nummer|number)\s*\}/i; // ny instans → ingen lastIndex-delning
  return d.elements.some((e) => e.type === "text" && re.test(e.text));
}

/** Ersätter variabler i alla textelement med personens värden. */
export function applyVars(d: DesignSnapshot, p: PersonVars): DesignSnapshot {
  const sub = (text: string) =>
    text.replace(VAR_RE, (_m, key: string) => (/num/i.test(key) ? p.number : p.name));
  return {
    ...d,
    elements: d.elements.map((e) => (e.type === "text" ? { ...e, text: sub(e.text) } : e)),
  };
}
