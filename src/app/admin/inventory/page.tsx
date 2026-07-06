"use client";

import { useEffect, useMemo, useState } from "react";
import { GARMENTS } from "@/lib/garments";
import { fetchInventory, saveInventory, type InventoryRow } from "@/lib/admin-data";
import { useToast } from "@/components/ui/Toast";

export default function AdminInventory() {
  const { push } = useToast();
  const [rows, setRows] = useState<Record<string, { qty: number; low: number }>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory().then((inv) => {
      const map: Record<string, { qty: number; low: number }> = {};
      for (const r of inv) map[`${r.garment_id}|${r.size}`] = { qty: r.qty, low: r.low };
      setRows(map);
      setReady(true);
    });
  }, []);

  const lowCount = useMemo(
    () => Object.values(rows).filter((r) => r.qty <= r.low).length,
    [rows]
  );

  function set(gid: string, size: string, field: "qty" | "low", v: number) {
    const key = `${gid}|${size}`;
    setRows((r) => {
      const prev = r[key] ?? { qty: 0, low: 5 };
      return { ...r, [key]: { ...prev, [field]: v } };
    });
  }

  async function save() {
    setSaving(true);
    const payload: InventoryRow[] = Object.entries(rows).map(([key, v]) => {
      const [garment_id, size] = key.split("|");
      return { garment_id, size, qty: v.qty, low: v.low };
    });
    const { error } = await saveInventory(payload);
    setSaving(false);
    push(error ? { kind: "error", title: "Kunde inte spara", msg: error } : { kind: "success", title: "Lager sparat" });
  }

  if (!ready) return <div className="p-8 text-muted">Laddar lager…</div>;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Internt · lager</p>
          <h1 className="display text-3xl sm:text-4xl">Lager per variant</h1>
          <p className="mt-1 text-sm text-muted">Antal per plagg och storlek. Dras automatiskt vid order. Tomt = ospårat (dras ej).{lowCount > 0 && <span className="ml-1 text-warn">· {lowCount} under tröskel</span>}</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving ? "Sparar…" : "Spara lager"}</button>
      </div>

      <div className="space-y-5">
        {GARMENTS.map((g) => (
          <div key={g.id} className="card p-4">
            <h2 className="head mb-3 text-sm uppercase">{g.name}</h2>
            <div className="flex flex-wrap gap-3">
              {g.sizes.map((size) => {
                const r = rows[`${g.id}|${size}`];
                const low = r && r.qty <= r.low;
                return (
                  <label key={size} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${low ? "border-warn" : "border-line"}`}>
                    <span className="spec w-8 text-[11px] text-muted">{size}</span>
                    <input
                      type="number"
                      value={r?.qty ?? ""}
                      placeholder="–"
                      onChange={(e) => set(g.id, size, "qty", Number(e.target.value))}
                      className="field w-16 text-right"
                    />
                    {low && <span className="spec text-[9px] text-warn">lågt</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
