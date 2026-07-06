"use client";

import { createClient } from "./supabase/client";
import type { DesignSnapshot } from "./store";

export interface TeamOrder {
  id: string;
  token: string;
  title: string;
  garment_id: string;
  color_index: number;
  design: DesignSnapshot;
  owner_id: string | null;
  created_at: string;
}
export interface TeamEntry {
  id: string;
  team_order_id: string;
  member_name: string;
  number: string | null;
  size: string;
  created_at: string;
}

function rid(prefix: string, len = 9) {
  let s = "";
  while (s.length < len) s += Math.random().toString(36).slice(2);
  return prefix + s.slice(0, len);
}

/** Skapar en insamling från nuvarande design. Kräver inloggning. Returnerar token. */
export async function createTeamOrder(design: DesignSnapshot, title: string): Promise<{ token: string } | { error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not-logged-in" };
  const token = rid("t", 14);
  const { error } = await supabase.from("team_orders").insert({
    id: rid("team_"),
    token,
    title: title || "Laginsamling",
    garment_id: design.garmentId,
    color_index: design.colorIndex,
    design,
    owner_id: user.id,
  });
  if (error) return { error: error.message };
  return { token };
}

export async function getTeamOrder(token: string): Promise<TeamOrder | null> {
  const supabase = createClient();
  const { data } = await supabase.from("team_orders").select("*").eq("token", token).maybeSingle();
  return (data as TeamOrder) ?? null;
}

export async function submitEntry(teamOrderId: string, entry: { member_name: string; number?: string; size: string }): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("team_order_entries").insert({
    team_order_id: teamOrderId,
    member_name: entry.member_name,
    number: entry.number || null,
    size: entry.size,
  });
  return { error: error?.message ?? null };
}

export async function getEntries(teamOrderId: string): Promise<TeamEntry[]> {
  const supabase = createClient();
  const { data } = await supabase.from("team_order_entries").select("*").eq("team_order_id", teamOrderId).order("created_at", { ascending: true });
  return (data ?? []) as TeamEntry[];
}
