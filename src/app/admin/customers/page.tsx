"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchOrders, fetchProfiles, type AdminOrder, type AdminProfile } from "@/lib/admin-data";
import { kr } from "@/lib/format";

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([fetchProfiles(), fetchOrders()]).then(([p, o]) => {
      setProfiles(p);
      setOrders(o);
      setReady(true);
    });
  }, []);

  const rows = useMemo(() => {
    const byUser: Record<string, { count: number; spent: number }> = {};
    for (const o of orders) {
      if (!o.user_id) continue;
      byUser[o.user_id] = byUser[o.user_id] ?? { count: 0, spent: 0 };
      byUser[o.user_id].count += 1;
      byUser[o.user_id].spent += o.total;
    }
    const needle = q.trim().toLowerCase();
    return profiles
      .map((p) => ({ p, ...(byUser[p.id] ?? { count: 0, spent: 0 }) }))
      .filter((r) => !needle || r.p.email.toLowerCase().includes(needle) || (r.p.name ?? "").toLowerCase().includes(needle))
      .sort((a, b) => b.spent - a.spent);
  }, [profiles, orders, q]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Internt · kundregister</p>
          <h1 className="display text-3xl sm:text-4xl">Kunder · {profiles.length}</h1>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök namn / e-post…" className="field max-w-[220px]" />
      </div>

      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar…</div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center text-muted">Inga kunder ännu.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-normal eyebrow">Kund</th>
                <th className="px-4 py-3 font-normal eyebrow">Typ</th>
                <th className="px-4 py-3 text-right font-normal eyebrow">Ordrar</th>
                <th className="px-4 py-3 text-right font-normal eyebrow">Livstidsvärde</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, count, spent }) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${p.id}`} className="hover:text-signal">
                      <span className="head">{p.name || p.email.split("@")[0]}</span>
                      <span className="spec ml-2 text-[11px] text-muted">{p.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {p.role === "admin" ? (
                      <span className="spec text-signal">Admin</span>
                    ) : p.business ? (
                      <span className="spec text-cyan">Företag</span>
                    ) : (
                      <span className="spec text-muted">Privat</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{kr(spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
