import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, orderStatusEmail } from "@/lib/email-server";

// Admin triggar kund-mejl vid statusbyte ("I tryck" / "Skickad").
// No-op utan RESEND_API_KEY (förberedd — kopplas klart genom att sätta env).
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const { orderId } = await req.json().catch(() => ({}));
  const { data: o } = await supabase
    .from("orders")
    .select("ref,status,tracking,contact")
    .eq("id", orderId)
    .maybeSingle();

  const email = (o?.contact as { email?: string })?.email;
  if (!o || !email) return NextResponse.json({ ok: true, skipped: true });

  const mail = orderStatusEmail({ ref: o.ref, status: o.status, tracking: o.tracking });
  const r = await sendEmail({ to: email, subject: mail.subject, html: mail.html });
  return NextResponse.json({ ok: true, sent: !r.skipped });
}
