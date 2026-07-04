// Delade typer + kod-defaults för redigerbar sajtkonfiguration.
// Defaults = exakt nuvarande hårdkodade värden → sajten funkar identiskt även
// om DB-config saknas. Ren modul (ingen klient/server-kod) → importeras överallt.
import type { Garment } from "./garments";

export interface DiscountTier {
  min: number;
  pct: number;
}

export interface PricingConfig {
  pricePerCm2: number;
  printSetupMin: number;
  vatRate: number;
  discountTiers: DiscountTier[];
}

export interface ShippingMethod {
  id: string;
  label: string;
  price: number;
  deliveryDays: string;
}

export interface ShippingConfig {
  methods: ShippingMethod[];
  freeThreshold: number;
}

export interface CostConfig {
  garmentOfRetail: number;
  filmPerCm2: number;
  consumablePerPrint: number;
  shippingPerOrder: number;
}

export const DEFAULT_PRICING: PricingConfig = {
  pricePerCm2: 0.85,
  printSetupMin: 20,
  vatRate: 0.25,
  discountTiers: [
    { min: 1, pct: 0 },
    { min: 5, pct: 0.1 },
    { min: 10, pct: 0.18 },
    { min: 25, pct: 0.25 },
    { min: 50, pct: 0.32 },
    { min: 100, pct: 0.4 },
  ],
};

export const DEFAULT_SHIPPING: ShippingConfig = {
  methods: [
    { id: "postombud", label: "Postombud", price: 59, deliveryDays: "2–4 dagar" },
    { id: "hemleverans", label: "Hemleverans", price: 79, deliveryDays: "1–3 dagar" },
  ],
  freeThreshold: 800,
};

export const DEFAULT_COSTS: CostConfig = {
  garmentOfRetail: 0.4,
  filmPerCm2: 0.14,
  consumablePerPrint: 4,
  shippingPerOrder: 42,
};

/** Slår ihop delvis DB-värde med defaults → robust mot saknade fält. */
export function mergePricing(v: Partial<PricingConfig> | null | undefined): PricingConfig {
  return { ...DEFAULT_PRICING, ...(v ?? {}), discountTiers: v?.discountTiers ?? DEFAULT_PRICING.discountTiers };
}
export function mergeShipping(v: Partial<ShippingConfig> | null | undefined): ShippingConfig {
  return { ...DEFAULT_SHIPPING, ...(v ?? {}), methods: v?.methods ?? DEFAULT_SHIPPING.methods };
}
export function mergeCosts(v: Partial<CostConfig> | null | undefined): CostConfig {
  return { ...DEFAULT_COSTS, ...(v ?? {}) };
}

/** Fraktkostnad givet delsumma inkl. moms + vald metod. */
export function shippingCostFor(cfg: ShippingConfig, inclVatSum: number, methodId?: string): number {
  if (inclVatSum >= cfg.freeThreshold) return 0;
  const m = cfg.methods.find((x) => x.id === methodId) ?? cfg.methods[0];
  return m?.price ?? 0;
}

/* ---------------- Produkter (override per plagg) ---------------- */
export type StockStatus = "in_stock" | "low" | "out";
export interface ProductOverride {
  basePrice?: number;
  active?: boolean; // false = dold i butiken
  stockStatus?: StockStatus;
}
export type ProductsConfig = Record<string, ProductOverride>;
export const DEFAULT_PRODUCTS: ProductsConfig = {};
export function mergeProducts(v: ProductsConfig | null | undefined): ProductsConfig {
  return { ...(v ?? {}) };
}
/** Plagg med ev. override-pris applicerat (för prisberäkning). */
export function withOverride(g: Garment, products: ProductsConfig): Garment {
  const bp = products[g.id]?.basePrice;
  return bp != null ? { ...g, basePrice: bp } : g;
}
export function isGarmentActive(products: ProductsConfig, id: string): boolean {
  return products[id]?.active !== false;
}
export function garmentStock(products: ProductsConfig, id: string): StockStatus {
  return products[id]?.stockStatus ?? "in_stock";
}

/* ---------------- Produktbilder (override per plagg-shape) ---------------- */
export interface ProductImageOverride {
  front?: string;
  back?: string;
}
export type ProductImagesConfig = Record<string, ProductImageOverride>;
export const DEFAULT_PRODUCT_IMAGES: ProductImagesConfig = {};
export function mergeProductImages(v: ProductImagesConfig | null | undefined): ProductImagesConfig {
  return { ...(v ?? {}) };
}
