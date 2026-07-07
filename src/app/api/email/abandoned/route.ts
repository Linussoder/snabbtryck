import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, marketingReminderEmail } from "@/lib/email-server";

// Marknadsutskick (övergiven design). Admin/internt-triggat.
// GDPR: skickas ENDAST till kunder med marketing_consent, alltid med
// avprenumereringslänk + List-Unsubscribe. No-op-mejl utan RESEND_API_KEY.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ ok: false }, { status: 403 });

  const { to, firstName } = await req.json().catch(() => ({}));
  if (!to) return NextResponse.json({ ok: false, error: "saknar to" }, { status: 400 });

  // Samtyckeskontroll (admin ser alla profiler via RLS).
  const { data: recip } = await supabase
    .from("profiles")
    .select("marketing_consent, unsubscribe_token")
    .eq("email", to)
    .maybeSingle();

  if (!recip?.marketing_consent) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no-consent" });
  }

  const unsubscribeUrl = `https://www.snabbtryck.se/avprenumerera?t=${recip.unsubscribe_token}`;
  const mail = marketingReminderEmail({ firstName, unsubscribeUrl });
  const r = await sendEmail({
    to,
    subject: mail.subject,
    html: mail.html,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
  return NextResponse.json({ ok: true, sent: !r.skipped });
}
