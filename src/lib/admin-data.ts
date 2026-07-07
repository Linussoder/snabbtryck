"use client";

import { createClient } from "./supabase/client";
import type { Order } from "./account";
import {
  mergePricing, mergeShipping, mergeCosts, mergeProducts, mergeProductImages,
  type PricingConfig, type ShippingConfig, type CostConfig, type ProductsConfig, type ProductImagesConfig,
} from "./settings";

export interface AdminOrder extends Order {
  user_id: string | null;
  contact: Record<string, string>;
  shipping: { method?: string; cost?: number };
  print_files: { elementId: string; path: string }[];
  notes: string | null;
  tracking: string | null;
  paid: boolean;
  created_at: string;
  payment_method: string | null;
  payment_status: string;
  discount_code: string | null;
  discount_amount: number;
  return_status: "none" | "requested" | "approved" | "refunded";
  return_reason: string | null;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  from_admin: boolean;
  body: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  business: boolean;
  company_name: string | null;
  role: "customer" | "admin";
  created_at: string;
}

export interface Lead {
  id: string;
  email: string;
  garment_id: string | null;
  qty: number | null;
  estimate: number | null;
  created_at: string;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  const supabase = createClient();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return ((data ?? []) as AdminOrder[]).map((o) => ({ ...o, createdAt: new Date(o.created_at).getTime() }));
}

export async function fetchProfiles(): Promise<AdminProfile[]> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data ?? []) as AdminProfile[];
}

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}

export async function fetchAllDesigns(): Promise<{ id: string; name: string; user_id: string }[]> {
  const supabase = createClient();
  const { data } = await supabase.from("designs").select("id,name,user_id");
  return (data ?? []) as { id: string; name: string; user_id: string }[];
}

// Sparade designer för en viss kund (admin via RLS). Mappas till DesignSnapshot.
import type { DesignSnapshot } from "./store";
export async function fetchDesignsForUser(userId: string): Promise<DesignSnapshot[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data ?? []).map(rowToSnapshot);
}

type DesignRow = { id: string; name: string; garment_id: string; color_index: number; size: string; qty: number; elements: DesignSnapshot["elements"]; updated_at: string };
function rowToSnapshot(r: unknown): DesignSnapshot {
  const row = r as DesignRow;
  return { id: row.id, name: row.name, garmentId: row.garment_id, colorIndex: row.color_index, size: row.size, qty: row.qty, elements: row.elements, updatedAt: new Date(row.updated_at).getTime() };
}

// Admin-mallar: sparade i designs med is_template=true, ägda av inloggad admin.
export async function fetchTemplates(): Promise<DesignSnapshot[]> {
  const supabase = createClient();
  const { data } = await supabase.from("designs").select("*").eq("is_template", true).order("updated_at", { ascending: false });
  return (data ?? []).map(rowToSnapshot);
}

export async function saveTemplate(d: DesignSnapshot, name: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ej inloggad" };
  const { error } = await supabase.from("designs").insert({
    id: `tpl_${Math.random().toString(36).slice(2, 11)}`,
    user_id: user.id,
    name,
    garment_id: d.garmentId,
    color_index: d.colorIndex,
    size: d.size,
    qty: d.qty,
    elements: d.elements,
    is_template: true,
    updated_at: new Date().toISOString(),
  });
  return error ? { error: error.message } : {};
}

/* ---------------- Recensioner (admin-moderering) ---------------- */
import type { Review } from "./reviews";
export type { Review };

export async function fetchAllReviews(): Promise<Review[]> {
  const supabase = createClient();
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Review[];
}
export async function setReviewApproved(id: string, approved: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.from("reviews").update({ approved }).eq("id", id);
}
export async function deleteReview(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("reviews").delete().eq("id", id);
}

export interface AllSettings {
  pricing: PricingConfig;
  shipping: ShippingConfig;
  costs: CostConfig;
  products: ProductsConfig;
  productImages: ProductImagesConfig;
}

export async function fetchSettings(): Promise<AllSettings> {
  const supabase = createClient();
  const { data } = await supabase.from("app_settings").select("key,value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    pricing: mergePricing(map.pricing),
    shipping: mergeShipping(map.shipping),
    costs: mergeCosts(map.costs),
    products: mergeProducts(map.products),
    productImages: mergeProductImages(map.productImages),
  };
}

export async function saveSetting(key: string, value: unknown): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  return { error: error?.message ?? null };
}

/* ---------------- Rabattkoder ---------------- */
export interface DiscountCode {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  active: boolean;
  min_order: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
}

export async function fetchDiscounts(): Promise<DiscountCode[]> {
  const supabase = createClient();
  const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
  return (data ?? []) as DiscountCode[];
}
export async function saveDiscount(d: Partial<DiscountCode> & { code: string }): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("discount_codes").upsert({ ...d, code: d.code.toUpperCase() });
  return { error: error?.message ?? null };
}
export async function deleteDiscount(code: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("discount_codes").delete().eq("code", code);
}

/* ---------------- Lager (variant-nivå) ---------------- */
export interface InventoryRow {
  garment_id: string;
  size: string;
  qty: number;
  low: number;
}
export async function fetchInventory(): Promise<InventoryRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from("inventory").select("garment_id,size,qty,low");
  return (data ?? []) as InventoryRow[];
}
export async function saveInventory(rows: InventoryRow[]): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("inventory").upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
  return { error: error?.message ?? null };
}

