import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGarment } from "@/lib/garments";
import { computePrice } from "@/lib/pricing";
import { computePrintArea } from "@/lib/print";
import { getPricing, getShipping, getProducts } from "@/lib/settings-server";
import { shippingCostFor, withOverride, garmentStock } from "@/lib/settings";
import { sendEmail, orderConfirmationEmail } from "@/lib/email-server";
import type { DesignSnapshot, DesignElement } from "@/lib/store";
import type { OrderLine } from "@/lib/account";

interface OrderBody {
  design: DesignSnapshot;
  lines: OrderLine[];
  contact: Record<string, string>;
  shipping: { method?: string };
  paymentMethod?: string;
  discountCode?: string;
}

function genRef(): string {
  return "TR-" + Math.floor(100000 + Math.random() * 899999);
}
function genId(): string {
  return "ord_" + Math.random().toString(36).slice(2, 11);
}

/** Order kommer in här. Priset räknas ALLTID om server-side — klientens summa ignoreras. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Du måste vara inloggad för att beställa." },
      { status: 401 }
    );
  }

  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Ogiltig data." }, { status: 400 });
  }

  const { design, lines, contact, shipping } = body;
  if (!design?.garmentId || !Array.isArray(design.elements) || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Ofullständig order." }, { status: 400 });
  }

  // Företagsflagga från profilen (inte från klienten).
  const { data: profile } = await supabase
    .from("profiles")
    .select("business")
    .eq("id", user.id)
    .single();
  const business = !!profile?.business;

  // ---- Server-side prisberäkning (config från DB, speglar kassan) ----
  const pricing = await getPricing();
  const shipCfg = await getShipping();
  const products = await getProducts();

  // Lager-guard: går inte att beställa slutsålt plagg.
  for (const line of lines) {
    if (garmentStock(products, line.garmentId) === "out") {
      return NextResponse.json(
        { ok: false, error: `${getGarment(line.garmentId).name} är slut i lager.` },
        { status: 409 }
      );
    }
  }

  let itemsSum = 0;
  let inclVatSum = 0;
  for (const line of lines) {
    const g = withOverride(getGarment(line.garmentId), products);
    const area = computePrintArea(design.elements, g);
    const p = computePrice(g, area, Math.max(1, Math.round(line.qty || 1)), pricing);
    itemsSum += business ? p.subtotalExclVat : p.subtotalInclVat;
    inclVatSum += p.subtotalInclVat;
  }
  const shippingCost = shippingCostFor(shipCfg, inclVatSum, shipping?.method);

  // ---- Rabattkod (server-validerad via SECURITY DEFINER-funktion) ----
  let discountAmount = 0;
  let appliedCode: string | null = null;
  if (body.discountCode) {
    const { data: d } = await supabase.rpc("get_discount", { p_code: body.discountCode });
    const code = Array.isArray(d) ? d[0] : d;
    if (code && itemsSum >= (code.min_order ?? 0)) {
      if (code.type === "percent") discountAmount = itemsSum * (Number(code.value) / 100);
      else if (code.type === "fixed") discountAmount = Number(code.value);
      else if (code.type === "free_shipping") discountAmount = shippingCost;
      discountAmount = Math.min(discountAmount, itemsSum + shippingCost);
      appliedCode = code.code;
    }
  }

  const total = Math.round(itemsSum + shippingCost - discountAmount);

  const id = genId();
  const ref = genRef();

  const { error: insertErr } = await supabase.from("orders").insert({
    id,
    ref,
    user_id: user.id,
    status: "Mottagen",
    total,
    business,
    contact: contact ?? {},
    shipping: { ...shipping, cost: shippingCost },
    design,
    lines,
    print_files: [],
    payment_method: body.paymentMethod ?? null,
    discount_code: appliedCode,
    discount_amount: Math.round(discountAmount),
  });

  if (insertErr) {
    return NextResponse.json(
      { ok: false, error: "Kunde inte spara ordern. Försök igen." },
      { status: 500 }
    );
  }

  // ---- Ladda upp original-grafik till Storage för tryck (best-effort) ----
  const printFiles: { elementId: string; path: string }[] = [];
  for (const el of design.elements as DesignElement[]) {
    if (el.type === "image" && typeof el.src === "string" && el.src.startsWith("data:")) {
      const m = /^data:(.+?);base64,(.*)$/.exec(el.src);
      if (!m) continue;
      const contentType = m[1];
      const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "bin";
      const buffer = Buffer.from(m[2], "base64");
      const path = `${user.id}/${id}/${el.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("artwork")
        .upload(path, buffer, { contentType, upsert: true });
      if (!upErr) printFiles.push({ elementId: el.id, path });
    }
  }
  if (printFiles.length) {
    await supabase.from("orders").update({ print_files: printFiles }).eq("id", id);
  }

  // Räkna upp rabattkodens användning (efter lyckad order).
  if (appliedCode) await supabase.rpc("redeem_discount", { p_code: appliedCode });

  // Lager-avdrag per rad (best-effort; bara spårade varianter påverkas).
  for (const line of lines) {
    await supabase.rpc("decrement_inventory", {
      p_garment: line.garmentId,
      p_size: line.size,
      p_qty: Math.max(1, Math.round(line.qty || 1)),
    });
  }

  // Låg-lager-notis: pinga om någon berörd variant nu ligger på/under tröskeln.
  if (process.env.NTFY_TOPIC) {
    try {
      const ordered = new Set(lines.map((l: { garmentId: string; size: string }) => `${l.garmentId}|${l.size}`));
      const { data: lowRows } = await supabase.rpc("get_low_stock");
      const hits = (lowRows ?? []).filter((r: { garment_id: string; size: string }) => ordered.has(`${r.garment_id}|${r.size}`));
      if (hits.length) {
        await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
          method: "POST",
          headers: { Title: "Lagt lager", Priority: "high", Tags: "warning,package" },
          body: hits.map((r: { garment_id: string; size: string; qty: number }) => `${r.garment_id} ${r.size}: ${r.qty} kvar`).join("\n"),
        });
      }
    } catch {
      /* best-effort */
    }
  }

  // Bekräftelsemejl (no-op utan RESEND_API_KEY).
  if (contact?.email) {
    const mail = orderConfirmationEmail({ ref, total, firstName: contact.firstName });
    await sendEmail({ to: contact.email, subject: mail.subject, html: mail.html });
  }

  // Telefon-notis via ntfy (no-op utan NTFY_TOPIC).
  if (process.env.NTFY_TOPIC) {
    try {
      await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
        method: "POST",
        headers: { Title: `Ny order ${ref}`, Priority: "high", Tags: "package,moneybag" },
        body: `${total} kr\n${contact?.email ?? ""}`,
      });
    } catch {
      /* notis är best-effort */
    }
  }

  return NextResponse.json({ ok: true, id, ref });
}
