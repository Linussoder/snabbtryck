"use client";

import { createClient } from "./supabase/client";
import type { DesignSnapshot } from "./store";

// DB-lager för sparade designer (synkas till kontot när inloggad).
// Base64-grafik behålls i elements för rendering; RLS ger bara egna rader.

interface DesignRow {
  id: string;
  name: string;
  garment_id: string;
  color_index: number;
  size: string;
  qty: number;
  elements: DesignSnapshot["elements"];
  updated_at: string;
}

function fromRow(r: DesignRow): DesignSnapshot {
  return {
    id: r.id,
    name: r.name,
    garmentId: r.garment_id,
    colorIndex: r.color_index,
    size: r.size,
    qty: r.qty,
    elements: r.elements,
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

export async function saveDesignRemote(d: DesignSnapshot): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not-logged-in");
  const { error } = await supabase.from("designs").upsert({
    id: d.id,
    user_id: user.id,
    name: d.name,
    garment_id: d.garmentId,
    color_index: d.colorIndex,
    size: d.size,
    qty: d.qty,
    elements: d.elements,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getDesignsRemote(): Promise<DesignSnapshot[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("designs")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data ?? []).map((r) => fromRow(r as DesignRow));
}

export async function getDesignRemote(id: string): Promise<DesignSnapshot | null> {
  const supabase = createClient();
  const { data } = await supabase.from("designs").select("*").eq("id", id).maybeSingle();
  return data ? fromRow(data as DesignRow) : null;
}

export async function deleteDesignRemote(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("designs").delete().eq("id", id);
}
