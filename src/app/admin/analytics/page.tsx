"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchOrders, fetchLeads, fetchAllDesigns, fetchProfiles, type AdminOrder, type Lead } from "@/lib/admin-data";
import { Kpi } from "@/components/admin/ui";
import { VAT_RATE } from "@/lib/pricing";
import { kr, pct } from "@/lib/format";

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
function download(name: string, content: string, type: string) {
  const blob = new Blob(["﻿" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function grossOf(o: AdminOrder) {
  return o.business ? Math.round(o.total * (1 + VAT_RATE)) : o.total;
}

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [designs, setDesigns] = useState<{ id: string; name: string; user_id: string }[]>([]);
  const [profileCount, setProfileCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchLeads(), fetchAllDesigns(), fetchProfiles()]).then(([o, l, d, p]) => {
      setOrders(o);
      setLeads(l);
      setDesigns(d);
      setProfileCount(p.length);
      setReady(true);
    });
  }, []);

  const s = useMemo(() => {
    const orderedDesignIds = new Set(orders.map((o) => o.design?.id).filter(Boolean));
    const abandoned = designs.filter((d) => !orderedDesignIds.has(d.id)).length;

    const byCustomer: Record<string, number> = {};
    orders.forEach((o) => o.user_id && (byCustomer[o.user_id] = (byCustomer[o.user_id] ?? 0) + 1));
    const repeat = Object.values(byCustomer).filter((n) => n > 1).length;
    const buyers = Object.keys(byCustomer).length;

    const byDesign: Record<string, number> = {};
    orders.forEach((o) => {
      const n = o.design?.name ?? "—";
      byDesign[n] = (byDesign[n] ?? 0) + 1;
    });
    const topDesigns = Object.entries(byDesign).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxDesign = topDesigns[0]?.[1] ?? 1;

    const gross = orders.reduce((a, o) => a + grossOf(o), 0);
    const net = Math.round(gross / (1 + VAT_RATE));
    const vat = gross - net;

    return {
      abandoned,
      repeat,
      buyers,
      buyerRate: profileCount ? buyers / profileCount : 0,
      leadConv: leads.length + orders.length ? orders.length / (leads.length + orders.length) : 0,
      topDesigns,
      maxDesign,
      gross,
      net,
      vat,
    };
  }, [orders, leads, designs, profileCount]);

  function exportCsv() {
    const header = ["Datum", "Ordernr", "Netto", "Moms", "Brutto", "Betalsätt", "Rabatt"];
    const lines = orders.map((o) => {
      const gross = grossOf(o);
      const net = Math.round(gross / (1 + VAT_RATE));
      return [new Date(o.created_at).toISOString().slice(0, 10), o.ref, String(net), String(gross - net), String(gross), o.payment_method ?? "", String(o.discount_amount ?? 0)]
        .map((v) => csvEscape(v)).join(";");
    });
    download(`snabbtryck-bokforing-${new Date().toISOString().slice(0, 10)}.csv`, [header.join(";"), ...lines].join("\n"), "text/csv;charset=utf-8");
  }

  function exportSie() {
    const d = new Date();
    const ymd = (x: Date) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}`;
    const head = [
      "#FLAGGA 0",
      '#PROGRAM "Snabbtryck" 1.0',
      "#FORMAT PC8",
      `#GEN ${ymd(d)}`,
      "#SIETYP 4",
      '#FNAMN "Snabbtryck"',
      '#KONTO 1930 "Företagskonto"',
      '#KONTO 3001 "Försäljning"',
      '#KONTO 2611 "Utgående moms 25%"',
    ];
    const vers = orders.map((o, i) => {
      const gross = grossOf(o);
      const net = gross / (1 + VAT_RATE);
      const vat = gross - net;
      return [
        `#VER "A" "${i + 1}" ${ymd(new Date(o.created_at))} "Order ${o.ref}"`,
        "{",
        `   #TRANS 1930 {} ${gross.toFixed(2)}`,
        `   #TRANS 3001 {} ${(-net).toFixed(2)}`,
        `   #TRANS 2611 {} ${(-vat).toFixed(2)}`,
        "}",
      ].join("\n");
    });
    download(`snabbtryck-${ymd(d)}.se`, [...head, ...vers].join("\n"), "text/plain;charset=utf-8");
  }

  if (!ready) return <div className="p-8 text-muted">Laddar analys…</div>;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · analys</p>
        <h1 className="display text-3xl sm:text-4xl">Analys &amp; ekonomi</h1>
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Lead→order-konvertering" value={pct(s.leadConv)} sub={`${orders.length} ordrar · ${leads.length} leads`} />
        <Kpi label="Kunder som beställt" value={`${s.buyers}`} sub={`${pct(s.buyerRate)} av ${profileCount}`} />
        <Kpi label="Återkommande kunder" value={`${s.repeat}`} sub="beställt >1 gång" accent={s.repeat > 0} />
        <Kpi label="Ej beställda designer" value={`${s.abandoned}`} sub="heta att jaga" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="eyebrow mb-3">Mest beställda designer</h2>
          {s.topDesigns.length === 0 ? (
            <p className="text-sm text-muted">Ingen orderdata ännu.</p>
          ) : (
            <div className="space-y-2">
              {s.topDesigns.map(([name, n]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-32 flex-none truncate text-sm">{name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                    <div className="h-full rounded-full bg-signal" style={{ width: `${(n / s.maxDesign) * 100}%` }} />
                  </div>
                  <span className="spec w-8 text-right text-[11px] text-muted">{n}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="eyebrow mb-3">Ekonomi &amp; bokföring</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Brutto (alla ordrar)</dt><dd className="tabular-nums">{kr(s.gross)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Netto</dt><dd className="tabular-nums">{kr(s.net)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Utgående moms ({Math.round(VAT_RATE * 100)}%)</dt><dd className="tabular-nums">{kr(s.vat)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={exportCsv} disabled={!orders.length} className="btn btn-outline btn-sm">↓ Bokförings-CSV</button>
            <button onClick={exportSie} disabled={!orders.length} className="btn btn-outline btn-sm">↓ SIE4 (.se)</button>
          </div>
          <p className="spec mt-2 text-[11px] text-muted">CSV för kalkylark · SIE4 för bokföringsprogram (Fortnox/Visma). Verifiera konton mot din kontoplan.</p>
        </section>
      </div>
    </div>
  );
}
