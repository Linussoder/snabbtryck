"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/account";
import { computeOrderMargin, OrderMargin, COST } from "@/lib/margin";
import { getGarment } from "@/lib/garments";
import { kr, num, pct } from "@/lib/format";

// Kostnads-segment: sekventiell grå-ramp (delar av helheten) + signal för vinst.
const SEG = [
  { key: "garmentCost", label: "Plagg", color: "#3d3d38" },
  { key: "filmCost", label: "Film", color: "#6b6b64" },
  { key: "consumableCost", label: "Pulver/bläck", color: "#9a9a90" },
  { key: "shippingCost", label: "Frakt", color: "#c4c4ba" },
] as const;

export default function MarginalDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []).map((o) => ({ ...o, createdAt: o.created_at }) as Order));
        setReady(true);
      });
  }, []);

  const rows = useMemo(
    () => orders.map((o) => ({ o, m: computeOrderMargin(o) })),
    [orders]
  );

  const totals = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + r.m.revenue, 0);
    const cost = rows.reduce((s, r) => s + r.m.totalCost, 0);
    const profit = revenue - cost;
    return { revenue, cost, profit, marginPct: revenue > 0 ? profit / revenue : 0 };
  }, [rows]);

  // marginal per plaggtyp
  const byGarment = useMemo(() => {
    const map: Record<string, { revenue: number; cost: number; profit: number }> = {};
    for (const { o, m } of rows) {
      m.lines.forEach((l) => {
        const key = l.garmentName;
        map[key] = map[key] ?? { revenue: 0, cost: 0, profit: 0 };
        const lineCost = l.garmentCost + l.filmCost + l.consumableCost;
        map[key].revenue += l.revenue;
        map[key].cost += lineCost;
        map[key].profit += l.revenue - lineCost;
      });
      // frakt fördelas ej per plaggtyp här (order-nivå)
      void o;
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, marginPct: v.revenue > 0 ? v.profit / v.revenue : 0 }))
      .sort((a, b) => b.profit - a.profit);
  }, [rows]);

  if (!ready) return <div className="p-16" />;

  return (
    <>
      <PageHead
        index="INTERNT"
        title="Marginal per order"
        sub="Plaggkostnad, filmåtgång i cm², pulver/bläck-schablon och frakt mot försäljningspris. Underlag för att sätta cm²-priset datadrivet."
      />
      <div className="mx-auto max-w-[1100px] space-y-10 px-4 py-12 md:px-8">
        {orders.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <ChevronMark size={28} color="#FFDA00" />
            <p className="text-muted">Ingen orderdata ännu. Lägg en order i kassan så dyker den upp här.</p>
            <Link href="/designa" className="btn btn-primary btn-sm">Skapa en design</Link>
          </div>
        ) : (
          <>
            {/* KPI tiles */}
            <section className="grid gap-3 sm:grid-cols-4">
              <Kpi label="Omsättning ex. moms" value={kr(totals.revenue)} />
              <Kpi label="Kostnad" value={kr(totals.cost)} />
              <Kpi label="Vinst" value={kr(totals.profit)} accent={totals.profit >= 0} bad={totals.profit < 0} />
              <Kpi label="Snittmarginal" value={pct(totals.marginPct)} accent={totals.marginPct >= 0.35} bad={totals.marginPct < 0.2} />
            </section>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              {SEG.map((s) => (
                <Legend key={s.key} color={s.color} label={s.label} />
              ))}
              <Legend color="var(--color-signal)" label="Vinst" />
              <Legend color="var(--color-bad)" label="Förlust" />
            </div>

            {/* Per order */}
            <section>
              <h2 className="head text-lg uppercase mb-4">Per order</h2>
              <div className="space-y-3">
                {rows.map(({ o, m }) => (
                  <OrderRow key={o.id} order={o} m={m} />
                ))}
              </div>
            </section>

            {/* Per garment */}
            <section>
              <h2 className="head text-lg uppercase mb-4">Marginal per plaggtyp</h2>
              <div className="card p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="pb-2 font-normal eyebrow">Plagg</th>
                      <th className="pb-2 text-right font-normal eyebrow">Omsättning</th>
                      <th className="pb-2 text-right font-normal eyebrow">Vinst</th>
                      <th className="pb-2 pl-4 font-normal eyebrow">Marginal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byGarment.map((g) => (
                      <tr key={g.name} className="border-b border-line last:border-0">
                        <td className="py-2 head uppercase">{g.name}</td>
                        <td className="py-2 text-right tabular-nums">{kr(g.revenue)}</td>
                        <td className={`py-2 text-right tabular-nums ${g.profit < 0 ? "text-bad" : ""}`}>{kr(g.profit)}</td>
                        <td className="py-2 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(2, Math.min(100, g.marginPct * 100))}%`,
                                  background: g.marginPct < 0 ? "var(--color-bad)" : "var(--color-signal)",
                                }}
                              />
                            </div>
                            <span className={`spec w-12 text-right text-[11px] ${g.marginPct < 0 ? "text-bad" : ""}`}>
                              {pct(g.marginPct)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="spec text-[11px] text-muted">
              Schabloner: plagg {pct(COST.garmentOfRetail)} av retail ex. moms · film {COST.filmPerCm2} kr/cm² ·
              pulver/bläck {COST.consumablePerPrint} kr/plagg · frakt {COST.shippingPerOrder} kr/order.
              Justeras i <span className="font-mono">src/lib/margin.ts</span>.
            </p>
          </>
        )}
      </div>
    </>
  );
}

function OrderRow({ order, m }: { order: Order; m: OrderMargin }) {
  const g = getGarment(order.design.garmentId);
  const denom = Math.max(m.revenue, m.totalCost);
  const w = (v: number) => `${(v / denom) * 100}%`;
  const profitPos = m.profit >= 0;
  return (
    <div className="card p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="head uppercase">{order.ref}</span>
          <span className="spec ml-2 text-[11px] text-muted">
            {g.name} · {order.lines.reduce((s, l) => s + l.qty, 0)} st
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="spec text-[11px] text-muted">Vinst {kr(m.profit)}</span>
          <span className={`font-display text-lg ${profitPos ? "text-signal" : "text-bad"}`}>{pct(m.marginPct)}</span>
        </div>
      </div>
      {/* stacked bar */}
      <div className="flex h-5 w-full overflow-hidden rounded-[10px] bg-paper-2">
        {SEG.map((s) => (
          <div key={s.key} title={`${s.label}: ${kr(m[s.key])}`} style={{ width: w(m[s.key]), background: s.color }} />
        ))}
        {profitPos ? (
          <div title={`Vinst: ${kr(m.profit)}`} style={{ width: w(m.profit), background: "var(--color-signal)" }} />
        ) : (
          <div title={`Förlust: ${kr(-m.profit)}`} style={{ width: w(-m.profit), background: "var(--color-bad)" }} />
        )}
      </div>
      <div className="mt-1.5 flex justify-between spec text-[10px] text-muted">
        <span>Kostnad {kr(m.totalCost)}</span>
        <span>Omsättning {kr(m.revenue)}</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent, bad }: { label: string; value: string; accent?: boolean; bad?: boolean }) {
  return (
    <div className="card p-4">
      <p className="eyebrow">{label}</p>
      <p className={`mt-1 font-display text-2xl ${bad ? "text-bad" : accent ? "text-signal" : ""}`}>{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 spec text-[11px] text-muted">
      <span className="h-3 w-3 rounded-[8px]" style={{ background: color }} />
      {label}
    </span>
  );
}
