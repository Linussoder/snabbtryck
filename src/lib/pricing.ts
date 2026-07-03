import { Garment } from "./garments";

export const VAT_RATE = 0.25; // 25 % moms
export const PRICE_PER_CM2 = 0.85; // tryckkostnad per cm² (inkl. moms)
export const PRINT_SETUP_MIN = 20; // minsta tryckkostnad per plagg om något tryck finns

export interface DiscountTier {
  min: number;
  pct: number; // rabatt på pris per plagg
}

// Mängdrabatt-trappa
export const DISCOUNT_TIERS: DiscountTier[] = [
  { min: 1, pct: 0 },
  { min: 5, pct: 0.1 },
  { min: 10, pct: 0.18 },
  { min: 25, pct: 0.25 },
  { min: 50, pct: 0.32 },
  { min: 100, pct: 0.4 },
];

export function tierForQty(qty: number): DiscountTier {
  let t = DISCOUNT_TIERS[0];
  for (const tier of DISCOUNT_TIERS) if (qty >= tier.min) t = tier;
  return t;
}

export function nextTier(qty: number): DiscountTier | null {
  return DISCOUNT_TIERS.find((t) => t.min > qty) ?? null;
}

export interface PriceBreakdown {
  base: number; // plaggpris per st
  printArea: number; // total tryckyta cm² per st
  printCost: number; // tryckkostnad per st
  unitBeforeDiscount: number;
  discountPct: number;
  unitAfterDiscount: number;
  qty: number;
  subtotalInclVat: number; // rad-summa inkl. moms
  vat: number;
  subtotalExclVat: number;
}

/**
 * @param printAreaCm2 total tryckyta i cm² för ETT plagg (summa av alla element)
 */
export function computePrice(
  garment: Garment,
  printAreaCm2: number,
  qty: number
): PriceBreakdown {
  const base = garment.basePrice;
  const rawPrint = printAreaCm2 * PRICE_PER_CM2;
  const printCost = printAreaCm2 > 0 ? Math.max(rawPrint, PRINT_SETUP_MIN) : 0;
  const unitBeforeDiscount = base + printCost;
  const tier = tierForQty(qty);
  const unitAfterDiscount = unitBeforeDiscount * (1 - tier.pct);
  const subtotalInclVat = unitAfterDiscount * qty;
  const subtotalExclVat = subtotalInclVat / (1 + VAT_RATE);
  const vat = subtotalInclVat - subtotalExclVat;
  return {
    base,
    printArea: printAreaCm2,
    printCost,
    unitBeforeDiscount,
    discountPct: tier.pct,
    unitAfterDiscount,
    qty,
    subtotalInclVat,
    vat,
    subtotalExclVat,
  };
}
