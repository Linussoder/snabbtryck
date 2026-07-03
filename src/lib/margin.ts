import { Order } from "./account";
import { getGarment } from "./garments";
import { computePrice, VAT_RATE } from "./pricing";
import { computePrintArea } from "./store";

// Kostnadsmodell för marginal-dashboarden. Schabloner (ex. moms) — justera
// mot verkligt inköp/förbrukning när data finns.
export const COST = {
  garmentOfRetail: 0.4, // plagg-inköp som andel av retailpris ex. moms
  filmPerCm2: 0.14, // DTF-film + transfer per cm² (ex. moms)
  consumablePerPrint: 4, // pulver/bläck-schablon per tryckt plagg
  shippingPerOrder: 42, // fraktkostnad per order (ex. moms)
};

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

export function computeOrderMargin(order: Order): OrderMargin {
  const design = order.design;
  const lines: LineMargin[] = order.lines.map((l) => {
    const g = getGarment(l.garmentId);
    const area = computePrintArea(design.elements, g);
    const price = computePrice(g, area, l.qty);
    const revenue = price.subtotalExclVat;
    const retailExVat = g.basePrice / (1 + VAT_RATE);
    const garmentCost = retailExVat * COST.garmentOfRetail * l.qty;
    const filmCost = area * COST.filmPerCm2 * l.qty;
    const consumableCost = area > 0 ? COST.consumablePerPrint * l.qty : 0;
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
  const shippingCost = COST.shippingPerOrder;
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
