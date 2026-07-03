"use client";

import { createClient } from "./supabase/client";
import type { Order } from "./account";

export interface AdminOrder extends Order {
  user_id: string | null;
  contact: Record<string, string>;
  shipping: { method?: string; cost?: number };
  print_files: { elementId: string; path: string }[];
  notes: string | null;
  tracking: string | null;
  paid: boolean;
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
