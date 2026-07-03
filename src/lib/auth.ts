import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./supabase/types";

export type { Profile };

/** Inloggad auth-user (eller null). Memoiseras per render-pass. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Profilraden för inloggad användare (eller null). */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, name, business, company_name, org_nr, role")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
});

/** Kräver inloggad admin. Redirectar annars. Anropas i /admin-layout och admin-actions. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/logga-in?next=/admin");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
