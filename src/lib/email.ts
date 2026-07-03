import { DesignSnapshot } from "./store";
import { mockupDataUrl } from "./mockup";
import { getGarment } from "./garments";
import { computePrice } from "./pricing";
import { computePrintArea } from "./store";
import { kr } from "./format";

// Övergiven design-mail. Bygger själva mejlet; utskick sker via /api/email
// (stubbat — koppla Resend där). Renderad mockup gör att kunden ser SIN design.

export interface BuiltEmail {
  subject: string;
  preheader: string;
  html: string;
}

export function buildAbandonedEmail(
  design: DesignSnapshot,
  firstName?: string
): BuiltEmail {
  const g = getGarment(design.garmentId);
  const price = computePrice(g, computePrintArea(design.elements, g), design.qty);
  const mockup = mockupDataUrl(design, undefined, 520);
  const hej = firstName ? `Hej ${firstName}!` : "Hej!";

  const subject = `Din ${g.name.toLowerCase()} väntar på dig`;
  const preheader = `${design.name} är sparad och redo att beställas — ${kr(
    price.subtotalInclVat
  )}.`;

  const html = `<!doctype html><html lang="sv"><body style="margin:0;background:#f5f5f0;font-family:Inter,Arial,sans-serif;color:#0a0a0a">
  <div style="display:none;max-height:0;overflow:hidden">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #d6d6cd;border-radius:3px;overflow:hidden">
        <tr><td style="background:#0a0a0a;padding:18px 24px">
          <span style="color:#ff4d1c;font-weight:700">&#8853;</span>
          <span style="color:#f5f5f0;font-family:Oswald,Arial;font-weight:700;font-size:22px;letter-spacing:1px;text-transform:uppercase">&nbsp;TRYCK</span>
        </td></tr>
        <tr><td style="padding:28px 24px 8px">
          <h1 style="margin:0;font-family:Oswald,Arial;font-size:30px;line-height:1.05;text-transform:uppercase">${hej}<br>Din tröja väntar på dig.</h1>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:14px 0 0">Du designade något snyggt men hann aldrig beställa. Vi sparade den åt dig — ett klick så är den på väg.</p>
        </td></tr>
        <tr><td align="center" style="padding:16px 24px">
          <img src="${mockup}" width="360" alt="${design.name}" style="width:360px;max-width:100%;background:#ecece6;border:1px solid #d6d6cd;border-radius:3px"/>
        </td></tr>
        <tr><td style="padding:8px 24px 4px">
          <p style="margin:0;font-family:Oswald,Arial;font-size:18px;text-transform:uppercase">${design.name}</p>
          <p style="margin:4px 0 0;color:#86867c;font-size:13px">${g.name} &middot; ${g.colors[design.colorIndex]?.name} &middot; ${design.qty} st &middot; ${kr(price.subtotalInclVat)} inkl. moms</p>
        </td></tr>
        <tr><td style="padding:20px 24px 28px">
          <a href="https://tryck.se/designa" style="display:inline-block;background:#ff4d1c;color:#fff;font-family:Oswald,Arial;font-weight:600;text-transform:uppercase;text-decoration:none;padding:14px 26px;border-radius:3px">Slutför din beställning &rarr;</a>
        </td></tr>
        <tr><td style="background:#ecece6;padding:16px 24px">
          <p style="margin:0;color:#86867c;font-size:11px;font-family:'IBM Plex Mono',monospace">&#8853; TRYCK &middot; DTF-tryck &middot; Avsluta prenumeration i mejlfoten</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  return { subject, preheader, html };
}

/** Trigga utskick via API-route (stubbat). */
export async function sendAbandonedEmail(
  to: string,
  design: DesignSnapshot,
  firstName?: string
): Promise<{ ok: boolean; provider: string }> {
  const email = buildAbandonedEmail(design, firstName);
  const res = await fetch("/api/email/abandoned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject: email.subject }),
  });
  return res.json();
}
