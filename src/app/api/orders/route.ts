import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGarment } from "@/lib/garments";
import { computePrice } from "@/lib/pricing";
import { computePrintArea } from "@/lib/print";
import { getPricing, getShipping, getProducts } from "@/lib/settings-server";
import { shippingCostFor, withOverride, garmentStock } from "@/lib/settings";
import type { DesignSnapshot, DesignElement } from "@/lib/store";
import type { OrderLine } from "@/lib/account";

interface OrderBody {
  design: DesignSnapshot;
  lines: OrderLine[];
  contact: Record<string, string>;
  shipping: { method?: string };
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
  const total = Math.round(itemsSum + shippingCost);

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

  return NextResponse.json({ ok: true, id, ref });
}
