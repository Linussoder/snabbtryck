import { Order } from "./account";
import { getGarment } from "./garments";
import { computePrice } from "./pricing";
import { computePrintArea } from "./print";
import { DEFAULT_COSTS, DEFAULT_PRICING, type CostConfig, type PricingConfig } from "./settings";

// Bakåtkompatibel default (= schablonerna). Redigerbara via admin → app_settings 'costs'.
export const COST = DEFAULT_COSTS;

export interface LineMargin {
  garmentName: string;
  qty: number;
  revenue: number;
  garmentCost: number;
  filmCost: number;
  consumableCost: number;
}

export interface OrderMargin {
  revenue: number; // ex. moms
  garmentCost: number;
  filmCost: number;
  consumableCost: number;
  shippingCost: number;
  totalCost: number;
  profit: number;
  marginPct: number;
  lines: LineMargin[];
}

export function computeOrderMargin(
  order: Order,
  costs: CostConfig = DEFAULT_COSTS,
  pricing: PricingConfig = DEFAULT_PRICING
): OrderMargin {
  const design = order.design;
  const lines: LineMargin[] = order.lines.map((l) => {
    const g = getGarment(l.garmentId);
    const area = computePrintArea(design.elements, g);
    const price = computePrice(g, area, l.qty, pricing);
    const revenue = price.subtotalExclVat;
    const retailExVat = g.basePrice / (1 + pricing.vatRate);
    const garmentCost = retailExVat * costs.garmentOfRetail * l.qty;
    const filmCost = area * costs.filmPerCm2 * l.qty;
    const consumableCost = area > 0 ? costs.consumablePerPrint * l.qty : 0;
    return {
      garmentName: g.name,
      qty: l.qty,
      revenue,
      garmentCost,
      filmCost,
      consumableCost,
    };
  });

  const sum = (f: (l: LineMargin) => number) => lines.reduce((a, l) => a + f(l), 0);
  const revenue = sum((l) => l.revenue);
  const garmentCost = sum((l) => l.garmentCost);
  const filmCost = sum((l) => l.filmCost);
  const consumableCost = sum((l) => l.consumableCost);
  const shippingCost = costs.shippingPerOrder;
  const totalCost = garmentCost + filmCost + consumableCost + shippingCost;
  const profit = revenue - totalCost;
  const marginPct = revenue > 0 ? profit / revenue : 0;

  return {
    revenue,
    garmentCost,
    filmCost,
    consumableCost,
    shippingCost,
    totalCost,
    profit,
    marginPct,
    lines,
  };
}
