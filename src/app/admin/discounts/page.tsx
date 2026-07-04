"use client";

import { useEffect, useState } from "react";
import { fetchDiscounts, saveDiscount, deleteDiscount, type DiscountCode } from "@/lib/admin-data";
import { useToast } from "@/components/ui/Toast";
import { kr } from "@/lib/format";

const TYPES = [
  { id: "percent", label: "Procent (%)" },
  { id: "fixed", label: "Fast belopp (kr)" },
  { id: "free_shipping", label: "Fri frakt" },
] as const;

const BLANK = { code: "", type: "percent" as DiscountCode["type"], value: 10, min_order: 0, max_uses: "", expires_at: "", active: true };

export default function AdminDiscounts() {
  const { push } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setCodes(await fetchDiscounts());
  }
  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  async function create() {
    if (!form.code.trim()) {
      push({ kind: "error", title: "Ange en kod" });
      return;
    }
    setSaving(true);
    const { error } = await saveDiscount({
      code: form.code.trim(),
      type: form.type,
      value: form.type === "free_shipping" ? 0 : Number(form.value),
      min_order: Number(form.min_order) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: true,
    });
    setSaving(false);
    if (error) return push({ kind: "error", title: "Kunde inte spara", msg: error });
    push({ kind: "success", title: "Rabattkod skapad" });
    setForm({ ...BLANK });
    refresh();
  }

  async function toggle(c: DiscountCode) {
    await saveDiscount({ code: c.code, active: !c.active });
    refresh();
  }
  async function remove(c: DiscountCode) {
    if (!confirm(`Ta bort ${c.code}?`)) return;
    await deleteDiscount(c.code);
    refresh();
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · kampanjer</p>
        <h1 className="display text-3xl sm:text-4xl">Rabattkoder</h1>
      </div>

      {/* Skapa */}
      <div className="card mb-6 p-5">
        <h2 className="eyebrow mb-3">Ny kod</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="eyebrow mb-1 block">Kod</span>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SOMMAR20" className="field" /></label>
          <label className="block"><span className="eyebrow mb-1 block">Typ</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DiscountCode["type"] })} className="field">
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select></label>
          {form.type !== "free_shipping" && (
            <label className="block"><span className="eyebrow mb-1 block">Värde {form.type === "percent" ? "(%)" : "(kr)"}</span>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="field" /></label>
          )}
          <label className="block"><span className="eyebrow mb-1 block">Min. ordervärde (kr)</span>
            <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} className="field" /></label>
          <label className="block"><span className="eyebrow mb-1 block">Max antal (tomt = obegränsat)</span>
            <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="field" /></label>
          <label className="block"><span className="eyebrow mb-1 block">Giltig t.o.m. (tomt = alltid)</span>
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="field" /></label>
        </div>
        <button onClick={create} disabled={saving} className="btn btn-primary btn-sm mt-4">{saving ? "Skapar…" : "Skapa kod"}</button>
      </div>

      {/* Lista */}
      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar…</div>
      ) : codes.length === 0 ? (
        <div className="card p-12 text-center text-muted">Inga rabattkoder ännu.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="border-b border-line text-left">
              <th className="px-4 py-3 font-normal eyebrow">Kod</th>
              <th className="px-4 py-3 font-normal eyebrow">Rabatt</th>
              <th className="px-4 py-3 font-normal eyebrow">Villkor</th>
              <th className="px-4 py-3 font-normal eyebrow">Använd</th>
              <th className="px-4 py-3 font-normal eyebrow"></th>
            </tr></thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.code} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 head uppercase">{c.code}</td>
                  <td className="px-4 py-3">{c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? kr(c.value) : "Fri frakt"}</td>
                  <td className="px-4 py-3 spec text-[11px] text-muted">
                    {c.min_order > 0 ? `min ${kr(c.min_order)}` : "—"}
                    {c.expires_at ? ` · t.o.m. ${new Date(c.expires_at).toLocaleDateString("sv-SE")}` : ""}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggle(c)} className={`spec text-[11px] ${c.active ? "text-signal" : "text-muted"}`}>{c.active ? "● Aktiv" : "○ Pausad"}</button>
                    <button onClick={() => remove(c)} className="ml-3 text-muted hover:text-bad">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
