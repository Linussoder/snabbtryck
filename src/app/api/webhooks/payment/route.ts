import { NextResponse } from "next/server";

// ===== BETALNINGS-WEBHOOK (STUB — förberedd) =====
// Koppla Stripe/Swish/Klarna här:
//  1. Verifiera provider-signaturen (Stripe-Signature-header / Swish-cert).
//  2. Plocka ut ordern via payment_ref eller ref ur eventet.
//  3. Sätt paid=true + payment_status='paid' på ordern.
//     Webhooken saknar användarsession → använd SUPABASE_SERVICE_ROLE_KEY
//     (eller en SECURITY DEFINER-funktion) för att uppdatera ordern.
//  4. (valfritt) skicka "betald"-kvitto via lib/email-server.
//
// Sätt env i Vercel när du kopplar: STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET,
// SWISH_* etc. samt SUPABASE_SERVICE_ROLE_KEY.

export async function POST(req: Request) {
  const raw = await req.text().catch(() => "");
  // TODO: verifiera signatur innan du litar på payloaden.
  let event: unknown = null;
  try {
    event = JSON.parse(raw);
  } catch {
    /* vissa providers skickar icke-JSON */
  }
  console.log("[payment-webhook] event mottaget (stub) — koppla provider här", (event as { type?: string })?.type);
  return NextResponse.json({ ok: true, stub: true });
}
