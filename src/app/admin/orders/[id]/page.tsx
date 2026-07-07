"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/admin/ui";
import { getGarment, VIEW_LABEL } from "@/lib/garments";
import { buildPrintFile, printViews } from "@/lib/printfile";
import { downloadDataUrl } from "@/lib/gangsheet";
import { kr } from "@/lib/format";
import { VAT_RATE } from "@/lib/pricing";
import type { AdminOrder, OrderMessage } from "@/lib/admin-data";
import type { OrderStatus } from "@/lib/account";

const STATUSES: OrderStatus[] = ["Mottagen", "I tryck", "Skickad"];
const RETURN_STATES: { id: AdminOrder["return_status"]; label: string }[] = [
  { id: "none", label: "Ingen" },
  { id: "requested", label: "Begärd" },
  { id: "approved", label: "Godkänd" },
  { id: "refunded", label: "Återbetald" },
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [tracking, setTracking] = useState("");
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [genView, setGenView] = useState<string | null>(null);

  async function genPrintFile(view: "front" | "back" | "sleeve") {
    if (!order || genView) return;
    setGenView(view);
    try {
      const pf = await buildPrintFile(order.design, view);
      if (!pf) {
        push({ kind: "info", title: "Inget tryck i den vyn" });
        return;
      }
      downloadDataUrl(pf.dataUrl, `${order.ref}-tryckfil-${view}-${pf.widthCm}x${pf.heightCm}cm-300dpi.png`);
      push({ kind: "success", title: "Tryckfil skapad", msg: `${VIEW_LABEL[view]} · ${pf.widthCm}×${pf.heightCm} cm @ 300 DPI` });
    } catch {
      push({ kind: "error", title: "Kunde inte skapa tryckfil" });
    } finally {
      setGenView(null);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.from("order_messages").select("*").eq("order_id", id).order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data ?? []) as OrderMessage[]));
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        const o = (data as AdminOrder) ?? null;
        setOrder(o);
        setNotes(o?.notes ?? "");
        setTracking(o?.tracking ?? "");
        setReady(true);
        if (o?.print_files?.length) {
          const signed = await Promise.all(
            o.print_files.map(async (f) => {
              const { data: s } = await supabase.storage.from("artwork").createSignedUrl(f.path, 3600);
              return { name: f.path.split("/").pop() ?? f.path, url: s?.signedUrl ?? "" };
            })
          );
          setFiles(signed.filter((f) => f.url));
        }
      });
  }, [id]);

  async function patch(fields: Partial<AdminOrder>, okMsg: string) {
    if (!order || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update(fields).eq("id", order.id);
    setSaving(false);
    if (error) {
      push({ kind: "error", title: "Kunde inte spara" });
      return;
    }
    setOrder({ ...order, ...fields });
    // Kund-mejl vid statusbyte (no-op utan RESEND_API_KEY).
    if ("status" in fields) {
      fetch("/api/notify-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) }).catch(() => {});
    }
    push({ kind: "success", title: okMsg });
  }

  function printPackingSlip() {
    if (!order) return;
    const c = order.contact ?? {};
    const rows = order.lines
      .map((l) => {
        const g = getGarment(l.garmentId);
        return `<tr><td>${g.name}</td><td>${g.colors[l.colorIndex]?.name ?? ""} · ${l.size}</td><td style="text-align:right">${l.qty} st</td></tr>`;
      })
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Packsedel ${order.ref}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#111}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px 4px;border-bottom:1px solid #ddd;text-align:left}.muted{color:#666;font-size:13px}.tot{font-size:20px;font-weight:700;margin-top:16px;text-align:right}</style>
      </head><body>
      <h1>Snabbtryck — Packsedel</h1>
      <p class="muted">Order ${order.ref} · ${new Date(order.created_at).toLocaleDateString("sv-SE")}</p>
      <p><strong>${[c.firstName, c.lastName].filter(Boolean).join(" ")}</strong><br>
      ${c.email ?? ""}<br>${c.address ?? ""}<br>${[c.zip, c.city].filter(Boolean).join(" ")}</p>
      <table><thead><tr><th>Plagg</th><th>Variant</th><th style="text-align:right">Antal</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="tot">Totalt: ${kr(order.total)} ${order.business ? "(exkl. moms)" : "(inkl. moms)"}</p>
      <p class="muted">Leverans: ${order.shipping?.method ?? "—"}</p>
      </body></html>`;
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function printInvoice() {
    if (!order) return;
    const c = order.contact ?? {};
    const gross = order.business ? Math.round(order.total * (1 + VAT_RATE)) : order.total;
    const net = Math.round(gross / (1 + VAT_RATE));
    const vat = gross - net;
    const rows = order.lines
      .map((l) => {
        const g = getGarment(l.garmentId);
        return `<tr><td>${g.name} · ${g.colors[l.colorIndex]?.name ?? ""} · ${l.size}</td><td style="text-align:right">${l.qty} st</td></tr>`;
      })
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Faktura ${order.ref}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#111;font-size:14px}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{padding:8px 4px;border-bottom:1px solid #ddd;text-align:left}.muted{color:#666;font-size:12px}.r{text-align:right}.sum td{border:0;padding:3px 4px}</style>
      </head><body>
      <div style="display:flex;justify-content:space-between"><div><h1>FAKTURA</h1><p class="muted">Snabbtryck · snabbtryck.se</p></div>
      <div class="r"><p class="muted">Fakturanr ${order.ref}<br>${new Date(order.created_at).toLocaleDateString("sv-SE")}</p></div></div>
      <p><strong>${[c.firstName, c.lastName].filter(Boolean).join(" ")}</strong>${c.company ? "<br>" + c.company : ""}<br>${c.address ?? ""}<br>${[c.zip, c.city].filter(Boolean).join(" ")}<br>${c.email ?? ""}</p>
      <table><thead><tr><th>Beskrivning</th><th class="r">Antal</th></tr></thead><tbody>${rows}</tbody></table>
      <table class="sum" style="margin-top:16px;max-width:280px;margin-left:auto">
        <tr><td>Netto</td><td class="r">${kr(net)}</td></tr>
        <tr><td>Moms (${Math.round(VAT_RATE * 100)}%)</td><td class="r">${kr(vat)}</td></tr>
        ${order.discount_amount ? `<tr><td>Rabatt ${order.discount_code ?? ""}</td><td class="r">−${kr(order.discount_amount)}</td></tr>` : ""}
        <tr><td style="font-weight:700;font-size:16px">Att betala</td><td class="r" style="font-weight:700;font-size:16px">${kr(gross)}</td></tr>
      </table>
      <p class="muted" style="margin-top:24px">${order.business ? "Betalningsvillkor 30 dagar." : "Betald vid beställning."} Moms ingår enligt ovan.</p>
      </body></html>`;
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  async function sendMessage() {
    if (!order || !msgInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    const res = await fetch("/api/order-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, body: msgInput }),
    });
    setSendingMsg(false);
    const d = await res.json().catch(() => ({ ok: false }));
    if (!d.ok) return push({ kind: "error", title: "Kunde inte skicka" });
    setMessages((m) => [...m, { id: String(m.length), order_id: order.id, from_admin: true, body: msgInput.trim(), created_at: new Date().toISOString() }]);
    setMsgInput("");
    push({ kind: "success", title: "Meddelande skickat", msg: "Kunden mejlas." });
  }

  if (!ready) return <div className="p-8 text-muted">Laddar…</div>;
  if (!order)
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center">
        <h1 className="display text-3xl">Ordern hittades inte</h1>
        <Link href="/admin/orders" className="btn btn-primary mt-6">Till orderlistan</Link>
      </div>
    );

  const g = getGarment(order.design.garmentId);
  const c = order.contact ?? {};

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-8 md:px-8">
      <Link href="/admin/orders" className="spec text-muted hover:text-ink">← Alla ordrar</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="display text-3xl sm:text-4xl">{order.ref}</h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={printInvoice} className="btn btn-outline btn-sm">Faktura</button>
          <button onClick={printPackingSlip} className="btn btn-outline btn-sm">Packsedel</button>
          <span className="spec text-muted">{new Date(order.created_at).toLocaleString("sv-SE")}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="eyebrow mb-2">Status</h2>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => patch({ status: st }, `Status: ${st}`)}
                      disabled={saving}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        order.status === st ? "border-signal bg-signal text-white" : "border-line text-muted hover:border-ink"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => patch({ paid: !order.paid }, order.paid ? "Markerad obetald" : "Markerad betald")}
                disabled={saving}
                className={`rounded-lg border px-4 py-2 text-sm ${order.paid ? "border-signal text-signal" : "border-line text-muted hover:border-ink"}`}
              >
                {order.paid ? "● Betald" : "○ Markera betald"}
              </button>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="eyebrow mb-3">Orderrader</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.lines.map((l, i) => {
                  const lg = getGarment(l.garmentId);
                  return (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="py-2 head uppercase">{lg.name}</td>
                      <td className="py-2 text-muted">{lg.colors[l.colorIndex]?.name} · {l.size}</td>
                      <td className="py-2 text-right tabular-nums">{l.qty} st</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="head uppercase">Totalt {order.business ? "(exkl. moms)" : "(inkl. moms)"}</span>
              <span className="font-display text-2xl">{kr(order.total)}</span>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="eyebrow mb-3">Tryckfiler</h2>

            {/* Tryckfärdig, komponerad fil (text + bild) i verklig storlek, 300 DPI. */}
            <p className="spec mb-2 text-[11px] text-muted">Tryckfärdig fil (transparent PNG, 300 DPI):</p>
            <div className="flex flex-wrap gap-2">
              {printViews(order.design).map((v) => (
                <button
                  key={v}
                  onClick={() => genPrintFile(v)}
                  disabled={genView !== null}
                  className="btn btn-primary btn-sm"
                >
                  {genView === v ? "Skapar…" : `↓ Tryckfil · ${VIEW_LABEL[v]}`}
                </button>
              ))}
              {printViews(order.design).length === 0 && (
                <p className="text-sm text-muted">Designen saknar tryck.</p>
              )}
            </div>

            {/* Uppladdade originalfiler (om kunden laddat upp bilder). */}
            {files.length > 0 && (
              <>
                <p className="spec mb-2 mt-4 text-[11px] text-muted">Uppladdade originalfiler:</p>
                <ul className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <li key={f.url}>
                      <a href={f.url} download className="btn btn-outline btn-sm">↓ {f.name}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="card p-5">
            <h2 className="eyebrow mb-2">Spårningsnummer</h2>
            <div className="flex gap-2">
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="t.ex. PostNord-kolli-id" className="field flex-1" />
              <button onClick={() => patch({ tracking }, "Spårning sparad")} disabled={saving} className="btn btn-outline btn-sm">Spara</button>
            </div>
            <h2 className="eyebrow mb-2 mt-5">Interna noteringar</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Syns bara internt…" className="field w-full resize-y" />
            <button onClick={() => patch({ notes }, "Notering sparad")} disabled={saving} className="btn btn-outline btn-sm mt-2">Spara notering</button>
          </section>

          {/* Retur & reklamation */}
          <section className="card p-5">
            <h2 className="eyebrow mb-2">Retur / reklamation</h2>
            <div className="flex flex-wrap gap-2">
              {RETURN_STATES.map((rs) => (
                <button
                  key={rs.id}
                  onClick={() => patch({ return_status: rs.id }, `Retur: ${rs.label}`)}
                  disabled={saving}
                  className={`rounded-full border px-3 py-1 text-sm ${order.return_status === rs.id ? "border-bad bg-bad text-white" : "border-line text-muted hover:border-ink"}`}
                >
                  {rs.label}
                </button>
              ))}
            </div>
            {order.return_status !== "none" && (
              <div className="mt-3">
                <textarea
                  defaultValue={order.return_reason ?? ""}
                  onBlur={(e) => e.target.value !== (order.return_reason ?? "") && patch({ return_reason: e.target.value }, "Orsak sparad")}
                  rows={2}
                  placeholder="Orsak / anteckning…"
                  className="field w-full resize-y"
                />
              </div>
            )}
          </section>

          {/* Kundmeddelanden */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Meddelanden till kund</h2>
            {messages.length > 0 && (
              <div className="mb-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="rounded-lg bg-paper-2 p-2.5 text-sm">
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className="spec mt-1 text-[10px] text-muted">{new Date(m.created_at).toLocaleString("sv-SE")}</p>
                  </div>
                ))}
              </div>
            )}
            <textarea value={msgInput} onChange={(e) => setMsgInput(e.target.value)} rows={2} placeholder="Skriv till kunden (mejlas)…" className="field w-full resize-y" />
            <button onClick={sendMessage} disabled={sendingMsg || !msgInput.trim()} className="btn btn-primary btn-sm mt-2">{sendingMsg ? "Skickar…" : "Skicka meddelande"}</button>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-paper-2 grid-field">
              <DesignThumb design={order.design} />
            </div>
            <p className="spec border-t border-line px-3 py-2 text-[11px] text-muted">{order.design.name} · {g.name}</p>
          </div>
          <div className="card p-5">
            <h2 className="eyebrow mb-2">Kund</h2>
            <p className="head">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</p>
            <a href={`mailto:${c.email}`} className="text-sm text-signal hover:underline">{c.email}</a>
            {c.company && <p className="text-sm text-muted">{c.company}</p>}
            <div className="mt-3 border-t border-line pt-3 text-sm text-muted">
              <p>{c.address}</p>
              <p>{[c.zip, c.city].filter(Boolean).join(" ")}</p>
              <p className="mt-2 spec text-[11px]">
                Frakt: {order.shipping?.method ?? "—"}
                {typeof order.shipping?.cost === "number" ? ` · ${kr(order.shipping.cost)}` : ""}
              </p>
              {order.user_id && (
                <Link href={`/admin/customers/${order.user_id}`} className="spec mt-2 block text-[11px] text-signal">
                  Se kundens alla ordrar →
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
