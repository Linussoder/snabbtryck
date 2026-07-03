import { NextResponse } from "next/server";

// Utskick av övergiven design-mail. STUB — koppla Resend här:
//
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({ from, to, subject, html });
//
// Triggas i skarpt läge av n8n X timmar efter sparad-men-ej-beställd design,
// med suppression-logik återanvänd från seriespel-flödet.

export async function POST(req: Request) {
  const { to, subject } = await req.json().catch(() => ({}));
  if (!to || !subject) {
    return NextResponse.json({ ok: false, error: "saknar to/subject" }, { status: 400 });
  }
  console.log(`[email-stub] skulle skicka "${subject}" till ${to}`);
  return NextResponse.json({ ok: true, provider: "stub", to, subject });
}
