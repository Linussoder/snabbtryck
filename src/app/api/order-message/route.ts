import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email-server";

// Admin skickar meddelande till kund (loggas + mejlas). No-op-mejl utan RESEND_API_KEY.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const { orderId, body } = await req.json().catch(() => ({}));
  if (!orderId || !body?.trim()) return NextResponse.json({ ok: false, error: "Tomt meddelande" }, { status: 400 });

  const { error } = await supabase.from("order_messages").insert({ order_id: orderId, from_admin: true, body: body.trim() });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Mejla kunden.
  const { data: o } = await supabase.from("orders").select("ref,contact").eq("id", orderId).maybeSingle();
  const email = (o?.contact as { email?: string; firstName?: string })?.email;
  if (email) {
    await sendEmail({
      to: email,
      subject: `Meddelande om din order ${o?.ref}`,
      html: `<div style="font-family:Arial,sans-serif;color:#14181b"><p>Angående din order <b>${o?.ref}</b>:</p><p style="white-space:pre-wrap">${body.trim().replace(/</g, "&lt;")}</p><p style="color:#8a929a;font-size:12px">— Snabbtryck</p></div>`,
    });
  }
  return NextResponse.json({ ok: true });
}
