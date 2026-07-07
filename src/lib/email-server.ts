import "server-only";

// Mejl-sändare via Resend REST (ingen SDK). No-op + logg om RESEND_API_KEY
// saknas → säkert att anropa redan nu, "kopplas klart" genom att sätta env.
//
// Sätt i Vercel:
//   RESEND_API_KEY=re_...
//   EMAIL_FROM="Snabbtryck <order@snabbtryck.se>"   (verifierad domän i Resend)

const FROM = process.env.EMAIL_FROM || "Snabbtryck <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] (no RESEND_API_KEY) skulle skicka "${opts.subject}" → ${opts.to}`);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, headers: opts.headers }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/* ---------------- Mallar ---------------- */
function shell(title: string, body: string): string {
  return `<!doctype html><html lang="sv"><body style="margin:0;background:#f6f5f1;font-family:Arial,sans-serif;color:#14181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 16px">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border:1px solid #e2ded4;border-radius:6px;overflow:hidden">
      <tr><td style="background:#0e1113;padding:16px 24px;color:#fff;font-weight:800;letter-spacing:1px">» SNABBTRYCK</td></tr>
      <tr><td style="padding:26px 24px">
        <h1 style="margin:0 0 12px;font-size:24px">${title}</h1>
        ${body}
      </td></tr>
      <tr><td style="background:#eeece5;padding:14px 24px;color:#8a929a;font-size:11px">Snabbtryck · DTF-tryck · snabbtryck.se</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export function orderConfirmationEmail(o: { ref: string; total: number; firstName?: string }): { subject: string; html: string } {
  const hej = o.firstName ? `Hej ${o.firstName}!` : "Tack för din order!";
  return {
    subject: `Orderbekräftelse ${o.ref}`,
    html: shell(hej, `<p style="color:#555;line-height:1.6">Vi har tagit emot din order <b>${o.ref}</b> på <b>${o.total} kr</b> och börjar förbereda tryckfilen. Du får ett mejl när den går i tryck och när den skickas.</p>
      <p style="margin-top:16px"><a href="https://www.snabbtryck.se/order/${o.ref}" style="background:#00aeef;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block">Följ din order →</a></p>`),
  };
}

export function marketingReminderEmail(o: { firstName?: string; unsubscribeUrl: string }): { subject: string; html: string } {
  const hej = o.firstName ? `Hej ${o.firstName}!` : "Hej!";
  const body = `<p style="color:#555;line-height:1.6">Du designade något snyggt men hann aldrig beställa. Vi sparade den åt dig — ett klick så är den på väg.</p>
    <p style="margin-top:16px"><a href="https://www.snabbtryck.se/mina-skapelser" style="background:#00aeef;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block">Slutför din beställning →</a></p>
    <p style="margin-top:20px;color:#8a929a;font-size:11px">Du får detta för att du valt marknadsföringsmejl från Snabbtryck. <a href="${o.unsubscribeUrl}" style="color:#8a929a;text-decoration:underline">Avprenumerera här</a>.</p>`;
  return { subject: "Din design väntar på dig", html: shell(hej, body) };
}

export function orderStatusEmail(o: { ref: string; status: string; tracking?: string | null }): { subject: string; html: string } {
  const map: Record<string, string> = {
    "I tryck": "Din design körs nu genom DTF-pressen. 🖨️",
    Skickad: "Din order är på väg! 📦",
  };
  const extra = o.status === "Skickad" && o.tracking ? `<p style="margin-top:10px;color:#555">Spårningsnummer: <b>${o.tracking}</b></p>` : "";
  return {
    subject: `Order ${o.ref}: ${o.status}`,
    html: shell(`Order ${o.ref} – ${o.status}`, `<p style="color:#555;line-height:1.6">${map[o.status] ?? "Statusuppdatering på din order."}</p>${extra}`),
  };
}
