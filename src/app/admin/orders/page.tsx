"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchOrders, type AdminOrder } from "@/lib/admin-data";
import { getGarment } from "@/lib/garments";
import { kr } from "@/lib/format";
import { StatusBadge } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/account";

const STATUSES: (OrderStatus | "Alla")[] = ["Alla", "Mottagen", "I tryck", "Skickad"];

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "Alla">("Alla");
  const [q, setQ] = useState("");
  const [unpaidOnly, setUnpaidOnly] = useState(false);

  useEffect(() => {
    fetchOrders().then((o) => {
      setOrders(o);
      setReady(true);
    });
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "Alla" && o.status !== filter) return false;
      if (unpaidOnly && o.paid) return false;
      if (!needle) return true;
      const email = (o.contact?.email ?? "").toLowerCase();
      return o.ref.toLowerCase().includes(needle) || email.includes(needle);
    });
  }, [orders, filter, q, unpaidOnly]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Alla: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  function exportCsv() {
    const header = ["Ordernr", "Datum", "Kund", "E-post", "Plagg", "Antal", "Summa", "Betald", "Status"];
    const lines = rows.map((o) => {
      const g = getGarment(o.design.garmentId);
      const qty = o.lines.reduce((a, l) => a + l.qty, 0);
      return [
        o.ref,
        new Date(o.created_at).toISOString().slice(0, 16).replace("T", " "),
        [o.contact?.firstName, o.contact?.lastName].filter(Boolean).join(" "),
        o.contact?.email ?? "",
        g.name,
        String(qty),
        String(o.total),
        o.paid ? "Ja" : "Nej",
        o.status,
      ].map((v) => csvEscape(String(v))).join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snabbtryck-ordrar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Internt · orderhantering</p>
          <h1 className="display text-3xl sm:text-4xl">Ordrar</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sök ordernr / e-post…"
            className="field max-w-[220px]"
          />
          <button onClick={exportCsv} className="btn btn-outline btn-sm" disabled={!rows.length}>
            ↓ CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === st ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
            }`}
          >
            {st} {counts[st] ? <span className="opacity-60">· {counts[st]}</span> : null}
          </button>
        ))}
        <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} className="h-4 w-4 accent-[var(--color-signal)]" />
          Endast obetalda
        </label>
      </div>

      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar…</div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          {orders.length === 0 ? "Inga ordrar ännu." : "Inga ordrar matchar filtret."}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-normal eyebrow">Order</th>
                <th className="px-4 py-3 font-normal eyebrow">Datum</th>
                <th className="px-4 py-3 font-normal eyebrow">Kund</th>
                <th className="px-4 py-3 font-normal eyebrow">Plagg</th>
                <th className="px-4 py-3 text-right font-normal eyebrow">Summa</th>
                <th className="px-4 py-3 font-normal eyebrow">Betald</th>
                <th className="px-4 py-3 font-normal eyebrow">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const g = getGarment(o.design.garmentId);
                const qty = o.lines.reduce((a, l) => a + l.qty, 0);
                const date = new Date(o.created_at).toLocaleDateString("sv-SE", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="head uppercase hover:text-signal">{o.ref}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted tabular-nums">{date}</td>
                    <td className="px-4 py-3">{o.contact?.email ?? "—"}</td>
                    <td className="px-4 py-3">{g.name} · {qty} st</td>
                    <td className="px-4 py-3 text-right tabular-nums">{kr(o.total)}</td>
                    <td className="px-4 py-3">
                      {o.paid ? <span className="spec text-signal">● Betald</span> : <span className="spec text-muted">○ Obetald</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
