"use client";

import { createClient } from "./supabase/client";

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  garment_id: string | null;
  approved: boolean;
  created_at: string;
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  const supabase = createClient();
  const { data } = await supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false });
  return (data ?? []) as Review[];
}

export async function submitReview(r: { author_name: string; rating: number; body: string }): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").insert({
    author_name: r.author_name.trim().slice(0, 80),
    rating: Math.max(1, Math.min(5, Math.round(r.rating))),
    body: r.body.trim().slice(0, 2000),
  });
  return { error: error?.message ?? null };
}
