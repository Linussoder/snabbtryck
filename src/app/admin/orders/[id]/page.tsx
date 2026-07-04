"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/admin/ui";
import { getGarment } from "@/lib/garments";
import { kr } from "@/lib/format";
import type { AdminOrder } from "@/lib/admin-data";
import type { OrderStatus } from "@/lib/account";

const STATUSES: OrderStatus[] = ["Mottagen", "I tryck", "Skickad"];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    const supabase = createClient();
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
            <h2 className="eyebrow mb-3">Tryckfiler ({files.length})</h2>
            {files.length === 0 ? (
              <p className="text-sm text-muted">Inga uppladdade originalfiler.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} download className="btn btn-outline btn-sm">↓ {f.name}</a>
                  </li>
                ))}
              </ul>
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
