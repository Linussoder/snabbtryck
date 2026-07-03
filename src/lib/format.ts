// Svenska format-hjälpare.

const nf0 = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Heltalskronor: 1 234 kr */
export function kr(n: number): string {
  return `${nf0.format(Math.round(n))} kr`;
}

/** Med ören för radpriser: 1 234,50 kr */
export function krExact(n: number): string {
  return `${nf2.format(n)} kr`;
}

export function num(n: number): string {
  return nf0.format(n);
}

export function cm(n: number): string {
  return `${nf0.format(Math.round(n * 10) / 10)} cm`;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)} %`;
}
