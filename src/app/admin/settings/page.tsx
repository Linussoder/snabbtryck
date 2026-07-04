"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSettings, saveSetting, fetchProfiles, type AllSettings, type AdminProfile } from "@/lib/admin-data";
import { useToast } from "@/components/ui/Toast";
import {
  DEFAULT_PRICING,
  DEFAULT_COSTS,
  DEFAULT_SHIPPING,
  type PricingConfig,
  type CostConfig,
  type ShippingConfig,
} from "@/lib/settings";

type Tab = "priser" | "kostnader" | "leverans" | "admins";
const TABS: { id: Tab; label: string }[] = [
  { id: "priser", label: "Priser" },
  { id: "kostnader", label: "Kostnader" },
  { id: "leverans", label: "Leverans" },
  { id: "admins", label: "Admins" },
];

export default function AdminSettings() {
  const { push } = useToast();
  const [tab, setTab] = useState<Tab>("priser");
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [costs, setCosts] = useState<CostConfig>(DEFAULT_COSTS);
  const [shipping, setShipping] = useState<ShippingConfig>(DEFAULT_SHIPPING);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchProfiles()]).then(([s, p]) => {
      setPricing(s.pricing);
      setCosts(s.costs);
      setShipping(s.shipping);
      setAdmins(p.filter((x) => x.role === "admin"));
      setReady(true);
    });
  }, []);

  async function save(key: string, value: unknown) {
    setSaving(true);
    const { error } = await saveSetting(key, value);
    setSaving(false);
    push(error ? { kind: "error", title: "Kunde inte spara", msg: error } : { kind: "success", title: "Sparat", msg: "Ändringen är live på sajten." });
  }

  if (!ready) return <div className="p-8 text-muted">Laddar inställningar…</div>;

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8 md:px-8">
      <div className="mb-5">
        <p className="eyebrow text-muted">Internt · konfiguration</p>
        <h1 className="display text-3xl sm:text-4xl">Inställningar</h1>
        <p className="mt-1 text-sm text-muted">Allt du ändrar här slår igenom direkt på sajten — priser, uträkningar och frakt.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === t.id ? "border-signal text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "priser" && (
        <Section title="Priser & uträkningar" onSave={() => save("pricing", pricing)} saving={saving}>
          <NumField label="Tryckpris per cm² (inkl. moms)" suffix="kr" value={pricing.pricePerCm2} step={0.05}
            onChange={(v) => setPricing({ ...pricing, pricePerCm2: v })} />
          <NumField label="Minsta tryckkostnad / plagg" suffix="kr" value={pricing.printSetupMin}
            onChange={(v) => setPricing({ ...pricing, printSetupMin: v })} />
          <NumField label="Moms" suffix="%" value={pricing.vatRate * 100} step={0.5}
            onChange={(v) => setPricing({ ...pricing, vatRate: v / 100 })} />
          <div className="pt-2">
            <p className="eyebrow mb-2">Mängdrabatt-trappa</p>
            <div className="space-y-2">
              {pricing.discountTiers.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="spec w-8 text-muted">≥</span>
                  <input type="number" value={t.min} onChange={(e) => {
                    const tiers = [...pricing.discountTiers]; tiers[i] = { ...t, min: Number(e.target.value) }; setPricing({ ...pricing, discountTiers: tiers });
                  }} className="field w-20" />
                  <span className="spec text-muted">st →</span>
                  <input type="number" value={Math.round(t.pct * 100)} onChange={(e) => {
                    const tiers = [...pricing.discountTiers]; tiers[i] = { ...t, pct: Number(e.target.value) / 100 }; setPricing({ ...pricing, discountTiers: tiers });
                  }} className="field w-20" />
                  <span className="spec text-muted">% rabatt</span>
                  <button onClick={() => setPricing({ ...pricing, discountTiers: pricing.discountTiers.filter((_, j) => j !== i) })} className="ml-auto text-muted hover:text-bad">×</button>
                </div>
              ))}
              <button onClick={() => setPricing({ ...pricing, discountTiers: [...pricing.discountTiers, { min: 0, pct: 0 }] })} className="btn btn-ghost btn-sm">+ Nivå</button>
            </div>
          </div>
        </Section>
      )}

      {tab === "kostnader" && (
        <Section title="Kostnadsschabloner (internt)" onSave={() => save("costs", costs)} saving={saving}
          note="Syns bara för admin — används i marginal-uträkningen, aldrig publikt.">
          <NumField label="Plaggkostnad (andel av retail ex. moms)" suffix="%" value={costs.garmentOfRetail * 100} step={0.5}
            onChange={(v) => setCosts({ ...costs, garmentOfRetail: v / 100 })} />
          <NumField label="Film + transfer per cm²" suffix="kr" value={costs.filmPerCm2} step={0.01}
            onChange={(v) => setCosts({ ...costs, filmPerCm2: v })} />
          <NumField label="Pulver/bläck per plagg" suffix="kr" value={costs.consumablePerPrint}
            onChange={(v) => setCosts({ ...costs, consumablePerPrint: v })} />
          <NumField label="Fraktkostnad per order (ex. moms)" suffix="kr" value={costs.shippingPerOrder}
            onChange={(v) => setCosts({ ...costs, shippingPerOrder: v })} />
        </Section>
      )}

      {tab === "leverans" && (
        <Section title="Leverans & frakt" onSave={() => save("shipping", shipping)} saving={saving}>
          <NumField label="Fri frakt över (inkl. moms)" suffix="kr" value={shipping.freeThreshold}
            onChange={(v) => setShipping({ ...shipping, freeThreshold: v })} />
          <div className="pt-2">
            <p className="eyebrow mb-2">Fraktsätt</p>
            <div className="space-y-3">
              {shipping.methods.map((m, i) => (
                <div key={i} className="rounded-lg border border-line p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Labeled label="Namn"><input value={m.label} onChange={(e) => upd(i, { label: e.target.value })} className="field" /></Labeled>
                    <Labeled label="Leveranstid"><input value={m.deliveryDays} onChange={(e) => upd(i, { deliveryDays: e.target.value })} className="field" placeholder="2–4 dagar" /></Labeled>
                    <Labeled label="Pris (kr)"><input type="number" value={m.price} onChange={(e) => upd(i, { price: Number(e.target.value) })} className="field" /></Labeled>
                    <Labeled label="Id (kod)"><input value={m.id} onChange={(e) => upd(i, { id: e.target.value })} className="field" /></Labeled>
                  </div>
                  <button onClick={() => setShipping({ ...shipping, methods: shipping.methods.filter((_, j) => j !== i) })} className="mt-2 spec text-[11px] text-muted hover:text-bad">Ta bort</button>
                </div>
              ))}
              <button onClick={() => setShipping({ ...shipping, methods: [...shipping.methods, { id: "nytt", label: "Nytt fraktsätt", price: 0, deliveryDays: "" }] })} className="btn btn-ghost btn-sm">+ Fraktsätt</button>
            </div>
          </div>
        </Section>
      )}

      {tab === "admins" && (
        <div className="card p-5">
          <h2 className="head mb-3 text-lg uppercase">Administratörer · {admins.length}</h2>
          <ul className="space-y-1">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <span>{a.name || a.email.split("@")[0]} <span className="spec ml-1 text-[11px] text-muted">{a.email}</span></span>
                <Link href={`/admin/customers/${a.id}`} className="spec text-[11px] text-signal">Hantera →</Link>
              </li>
            ))}
          </ul>
          <p className="spec mt-3 text-[11px] text-muted">Gör en kund till admin via kundens sida. Nya e-postadresser i <span className="font-mono">admin_emails</span> blir admin vid första inloggning.</p>
        </div>
      )}
    </div>
  );

  function upd(i: number, patch: Partial<ShippingConfig["methods"][number]>) {
    const methods = [...shipping.methods];
    methods[i] = { ...methods[i], ...patch };
    setShipping({ ...shipping, methods });
  }
}

function Section({ title, note, children, onSave, saving }: { title: string; note?: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="head text-lg uppercase">{title}</h2>
          {note && <p className="spec mt-0.5 text-[11px] text-muted">{note}</p>}
        </div>
        <button onClick={onSave} disabled={saving} className="btn btn-primary btn-sm flex-none">{saving ? "Sparar…" : "Spara"}</button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function NumField({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1.5">
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="field w-28 text-right" />
        {suffix && <span className="spec w-6 text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
    </label>
  );
}
