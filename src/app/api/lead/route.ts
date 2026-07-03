import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lead från bulkpris-kalkylatorn → sparas i Supabase (anon insert-policy).
// Syns i admin under Leads.
export async function POST(req: Request) {
  const lead = await req.json().catch(() => null);
  if (!lead?.email) {
    return NextResponse.json({ ok: false, error: "saknar email" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    email: String(lead.email).slice(0, 200),
    garment_id: lead.garmentId ?? null,
    qty: typeof lead.qty === "number" ? lead.qty : null,
    estimate: typeof lead.estimate === "number" ? Math.round(lead.estimate) : null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "kunde inte spara" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
