"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchOrders, fetchLeads, fetchSettings, type AdminOrder, type Lead, type AllSettings } from "@/lib/admin-data";
import { computeOrderMargin } from "@/lib/margin";
import { getGarment } from "@/lib/garments";
import { kr, pct } from "@/lib/format";
import { Kpi, Sparkline, StatusBadge } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/account";

const DAY = 86400000;

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchLeads(), fetchSettings()]).then(([o, l, st]) => {
      setOrders(o);
      setLeads(l);
      setSettings(st);
      setReady(true);
    });
  }, []);

  const s = useMemo(() => {
    const now = Date.now();
    const in30 = orders.filter((o) => now - o.createdAt <= 30 * DAY);
    const revenue30 = in30.reduce((a, o) => a + o.total, 0);
    const profit30 = in30.reduce((a, o) => a + computeOrderMargin(o, settings?.costs, settings?.pricing).profit, 0);
    const byStatus: Record<string, number> = { Mottagen: 0, "I tryck": 0, Skickad: 0 };
    orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] ?? 0) + 1));

    // 14-dagars daglig omsättning
    const trend: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = now - i * DAY;
      const rev = orders
        .filter((o) => o.createdAt >= dayStart - DAY && o.createdAt < dayStart)
        .reduce((a, o) => a + o.total, 0);
      trend.push(rev);
    }

    // top plagg (efter antal)
    const garmentQty: Record<string, number> = {};
    orders.forEach((o) =>
      o.lines.forEach((l) => {
        const name = getGarment(l.garmentId).name;
        garmentQty[name] = (garmentQty[name] ?? 0) + l.qty;
      })
    );
    const topGarments = Object.entries(garmentQty).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxGarment = topGarments[0]?.[1] ?? 1;

    return {
      revenue30,
      profit30,
      count30: in30.length,
      aov: in30.length ? Math.round(revenue30 / in30.length) : 0,
      marginPct: revenue30 > 0 ? profit30 / revenue30 : 0,
      byStatus,
      trend,
      topGarments,
      maxGarment,
      needAction: (byStatus["Mottagen"] ?? 0) + (byStatus["I tryck"] ?? 0),
    };
  }, [orders, settings]);

  if (!ready) return <div className="p-8 text-muted">Laddar översikt…</div>;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · översikt</p>
        <h1 className="display text-3xl sm:text-4xl">God dag. Här är läget.</h1>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          Inga ordrar ännu. När kunder beställer dyker allt upp här.
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Omsättning 30 d" value={kr(s.revenue30)} sub={`${s.count30} ordrar`} />
            <Kpi label="Snittordervärde" value={kr(s.aov)} />
            <Kpi label="Vinst 30 d" value={kr(s.profit30)} accent={s.profit30 >= 0} />
            <Kpi label="Marginal 30 d" value={pct(s.marginPct)} accent={s.marginPct >= 0.35} />
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="eyebrow">Omsättning · 14 dagar</h2>
                <span className="spec text-[11px] text-muted">{kr(s.trend.reduce((a, b) => a + b, 0))}</span>
              </div>
              <Sparkline data={s.trend} />
            </section>

            <section className="card p-5">
              <h2 className="eyebrow mb-3">Att göra</h2>
              <Link href="/admin/production" className="block rounded-lg border border-line p-3 hover:border-ink">
                <p className="font-display text-3xl">{s.needAction}</p>
                <p className="spec text-[11px] text-muted">ordrar väntar på tryck/skick →</p>
              </Link>
              <div className="mt-3 flex gap-2">
                {(["Mottagen", "I tryck", "Skickad"] as OrderStatus[]).map((st) => (
                  <div key={st} className="flex-1 rounded-lg bg-paper-2 p-2 text-center">
                    <p className="font-display text-lg">{s.byStatus[st] ?? 0}</p>
                    <StatusBadge status={st} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="eyebrow">Senaste ordrar</h2>
                <Link href="/admin/orders" className="spec text-[11px] text-signal">Alla →</Link>
              </div>
              <div className="space-y-2">
                {orders.slice(0, 6).map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-paper-2">
                    <span className="head uppercase text-sm">{o.ref}</span>
                    <span className="spec text-[11px] text-muted">{o.contact?.email ?? "—"}</span>
                    <span className="tabular-nums text-sm">{kr(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </Link>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h2 className="eyebrow mb-3">Mest sålda plagg</h2>
              <div className="space-y-2">
                {s.topGarments.map(([name, qty]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-24 flex-none truncate text-sm">{name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                      <div className="h-full rounded-full bg-signal" style={{ width: `${(qty / s.maxGarment) * 100}%` }} />
                    </div>
                    <span className="spec w-10 text-right text-[11px] text-muted">{qty} st</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/leads" className="mt-4 block border-t border-line pt-3 text-sm hover:text-signal">
                <span className="font-display text-lg">{leads.length}</span>{" "}
                <span className="text-muted">leads från priskalkylatorn →</span>
              </Link>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
