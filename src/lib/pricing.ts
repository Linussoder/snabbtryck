import { Garment } from "./garments";
import { DEFAULT_PRICING, PricingConfig, DiscountTier } from "./settings";

export type { DiscountTier };

// Bakåtkompatibla konstanter (= defaults). Används som fallback + i admin-UI.
export const VAT_RATE = DEFAULT_PRICING.vatRate; // 25 % moms
export const PRICE_PER_CM2 = DEFAULT_PRICING.pricePerCm2; // tryckkostnad per cm² (inkl. moms)
export const PRINT_SETUP_MIN = DEFAULT_PRICING.printSetupMin; // minsta tryckkostnad per plagg
export const DISCOUNT_TIERS: DiscountTier[] = DEFAULT_PRICING.discountTiers;

export function tierForQty(qty: number, tiers: DiscountTier[] = DISCOUNT_TIERS): DiscountTier {
  let t = tiers[0];
  for (const tier of tiers) if (qty >= tier.min) t = tier;
  return t;
}

export function nextTier(qty: number, tiers: DiscountTier[] = DISCOUNT_TIERS): DiscountTier | null {
  return tiers.find((t) => t.min > qty) ?? null;
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
 * @param cfg prissättningskonfiguration (default = kod-defaults; DB-config skickas in där den finns)
 */
export function computePrice(
  garment: Garment,
  printAreaCm2: number,
  qty: number,
  cfg: PricingConfig = DEFAULT_PRICING
): PriceBreakdown {
  const base = garment.basePrice;
  const rawPrint = printAreaCm2 * cfg.pricePerCm2;
  const printCost = printAreaCm2 > 0 ? Math.max(rawPrint, cfg.printSetupMin) : 0;
  const unitBeforeDiscount = base + printCost;
  const tier = tierForQty(qty, cfg.discountTiers);
  const unitAfterDiscount = unitBeforeDiscount * (1 - tier.pct);
  const subtotalInclVat = unitAfterDiscount * qty;
  const subtotalExclVat = subtotalInclVat / (1 + cfg.vatRate);
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
