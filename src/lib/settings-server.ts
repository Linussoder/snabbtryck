import "server-only";
import { createClient } from "./supabase/server";
import {
  mergePricing,
  mergeShipping,
  mergeCosts,
  mergeProducts,
  type PricingConfig,
  type ShippingConfig,
  type CostConfig,
  type ProductsConfig,
} from "./settings";

async function getValue(key: string): Promise<unknown> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

export async function getPricing(): Promise<PricingConfig> {
  return mergePricing((await getValue("pricing")) as Partial<PricingConfig>);
}
export async function getShipping(): Promise<ShippingConfig> {
  return mergeShipping((await getValue("shipping")) as Partial<ShippingConfig>);
}
export async function getCosts(): Promise<CostConfig> {
  return mergeCosts((await getValue("costs")) as Partial<CostConfig>);
}
export async function getProducts(): Promise<ProductsConfig> {
  return mergeProducts((await getValue("products")) as ProductsConfig);
}
