"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getGarment } from "@/lib/garments";
import { kr } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/account";

interface AdminOrder extends Order {
  contact: { email?: string; firstName?: string; lastName?: string };
  created_at: string;
}

const STATUSES: (OrderStatus | "Alla")[] = ["Alla", "Mottagen", "I tryck", "Skickad"];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Mottagen: "border-warn text-warn",
  "I tryck": "border-cyan text-cyan",
  Skickad: "border-signal text-signal",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "Alla">("Alla");
  const [q, setQ] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as AdminOrder[]);
        setReady(true);
      });
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "Alla" && o.status !== filter) return false;
      if (!needle) return true;
      const email = (o.contact?.email ?? "").toLowerCase();
      return o.ref.toLowerCase().includes(needle) || email.includes(needle);
    });
  }, [orders, filter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Alla: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Internt · orderhantering</p>
          <h1 className="display text-3xl sm:text-4xl">Inkomna ordrar</h1>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sök ordernr eller e-post…"
          className="field max-w-xs"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === s ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
            }`}
          >
            {s} {counts[s] ? <span className="opacity-60">· {counts[s]}</span> : null}
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar ordrar…</div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          {orders.length === 0 ? "Inga ordrar ännu." : "Inga ordrar matchar filtret."}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-normal eyebrow">Order</th>
                <th className="px-4 py-3 font-normal eyebrow">Datum</th>
                <th className="px-4 py-3 font-normal eyebrow">Kund</th>
                <th className="px-4 py-3 font-normal eyebrow">Plagg</th>
                <th className="px-4 py-3 text-right font-normal eyebrow">Summa</th>
                <th className="px-4 py-3 font-normal eyebrow">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const g = getGarment(o.design.garmentId);
                const qty = o.lines.reduce((s, l) => s + l.qty, 0);
                const date = new Date(o.created_at).toLocaleDateString("sv-SE", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                    <td className="px-4 py-3">
                      <Link href={`/admin/order/${o.id}`} className="head uppercase hover:text-signal">
                        {o.ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted tabular-nums">{date}</td>
                    <td className="px-4 py-3">{o.contact?.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {g.name} · {qty} st
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{kr(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`spec rounded-full border px-2 py-0.5 text-[10px] uppercase ${STATUS_STYLE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
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
