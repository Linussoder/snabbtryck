import { NextResponse } from "next/server";

// Lead från bulkpris-kalkylatorn. STUB — koppla CRM/n8n/Supabase här:
//
//   await supabase.from("leads").insert(lead);
//   // eller POST till n8n-webhook för CRM-synk
//
// Logga + mailadress går rakt in i CRM i skarpt läge.

export async function POST(req: Request) {
  const lead = await req.json().catch(() => null);
  if (!lead?.email) {
    return NextResponse.json({ ok: false, error: "saknar email" }, { status: 400 });
  }
  console.log(`[lead-stub] ${lead.email} · ${lead.garmentId}×${lead.qty} · ~${lead.estimate} kr`);
  return NextResponse.json({ ok: true });
}
