"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchOrders, type AdminOrder } from "@/lib/admin-data";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { StatusBadge } from "@/components/admin/ui";
import { useToast } from "@/components/ui/Toast";
import { getGarment } from "@/lib/garments";
import { buildGangSheets, downloadDataUrl, type GangItem } from "@/lib/gangsheet";
import { buildPrintFile, printViews } from "@/lib/printfile";
import type { OrderStatus } from "@/lib/account";

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  Mottagen: "I tryck",
  "I tryck": "Skickad",
  Skickad: null,
};

export default function ProductionQueue() {
  const { push } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders().then((o) => {
      setOrders(o);
      setReady(true);
    });
  }, []);

  const [sheeting, setSheeting] = useState(false);

  // Aktiva ordrar, äldst först (FIFO).
  const queue = orders.filter((o) => o.status !== "Skickad").sort((a, b) => a.createdAt - b.createdAt);

  async function makeGangSheet() {
    if (sheeting) return;
    setSheeting(true);
    try {
      // Komponera en tryckfärdig fil (text + bild) per vy och plagg-antal.
      const items: GangItem[] = [];
      for (const o of queue) {
        const qty = o.lines.reduce((a, l) => a + l.qty, 0) || 1;
        for (const v of printViews(o.design)) {
          const pf = await buildPrintFile(o.design, v);
          if (!pf) continue;
          for (let i = 0; i < qty; i++) {
            items.push({ src: pf.dataUrl, wCm: pf.widthCm, hCm: pf.heightCm });
          }
        }
      }
      if (!items.length) {
        push({ kind: "info", title: "Inga tryck i kön" });
        return;
      }
      const pages = await buildGangSheets(items);
      pages.forEach((p, i) => downloadDataUrl(p, `snabbtryck-a3-ark-${i + 1}.png`));
      push({ kind: "success", title: `${pages.length} A3-ark skapade`, msg: `${items.length} tryck packade` });
    } catch {
      push({ kind: "error", title: "Kunde inte skapa ark" });
    } finally {
      setSheeting(false);
    }
  }

  async function advance(o: AdminOrder) {
    const next = NEXT[o.status];
    if (!next || busy) return;
    setBusy(o.id);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", o.id);
    setBusy(null);
    if (error) {
      push({ kind: "error", title: "Kunde inte uppdatera" });
      return;
    }
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    // Kund-mejl om statusbyte (no-op utan RESEND_API_KEY).
    fetch("/api/notify-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: o.id }) }).catch(() => {});
    push({ kind: "success", title: `${o.ref} → ${next}` });
  }

  async function downloadFiles(o: AdminOrder) {
    if (!o.print_files?.length) {
      push({ kind: "info", title: "Inga tryckfiler för den här ordern" });
      return;
    }
    const supabase = createClient();
    for (const f of o.print_files) {
      const { data } = await supabase.storage.from("artwork").createSignedUrl(f.path, 3600);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    }
  }

  if (!ready) return <div className="p-8 text-muted">Laddar kö…</div>;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Internt · tryckkö</p>
          <h1 className="display text-3xl sm:text-4xl">Produktion · {queue.length}</h1>
        </div>
        {queue.length > 0 && (
          <button onClick={makeGangSheet} disabled={sheeting} className="btn btn-primary btn-sm">
            {sheeting ? "Packar A3…" : "🖨️ Gör A3-tryckark av kön"}
          </button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="card p-12 text-center text-muted">Kön är tom — allt är skickat. 🎉</div>
      ) : (
        <div className="space-y-3">
          {queue.map((o) => {
            const g = getGarment(o.design.garmentId);
            const qty = o.lines.reduce((a, l) => a + l.qty, 0);
            const waited = Math.floor((Date.now() - o.createdAt) / 3600000);
            return (
              <div key={o.id} className="card flex flex-wrap items-center gap-4 p-3">
                <div className="h-16 w-16 flex-none rounded-sm bg-paper-2">
                  <DesignThumb design={o.design} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/orders/${o.id}`} className="head uppercase hover:text-signal">{o.ref}</Link>
                    <StatusBadge status={o.status} />
                    {!o.paid && <span className="spec text-[10px] text-warn">obetald</span>}
                  </div>
                  <p className="spec text-[11px] text-muted">
                    {g.name} · {qty} st · {o.contact?.email ?? "—"} · väntat {waited} h
                  </p>
                </div>
                <button onClick={() => downloadFiles(o)} className="btn btn-ghost btn-sm">
                  Tryckfiler ({o.print_files?.length ?? 0})
                </button>
                <button onClick={() => advance(o)} disabled={busy === o.id} className="btn btn-primary btn-sm">
                  {busy === o.id ? "…" : `→ ${NEXT[o.status]}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
