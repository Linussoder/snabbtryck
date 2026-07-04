"use client";

import { useState } from "react";
import { GARMENTS } from "@/lib/garments";
import { GarmentImage } from "@/components/ui/GarmentImage";
import type { ProductsConfig, StockStatus } from "@/lib/settings";

const STOCK: { id: StockStatus; label: string }[] = [
  { id: "in_stock", label: "I lager" },
  { id: "low", label: "Få kvar" },
  { id: "out", label: "Slut" },
];

export function ProductsTab({ initial, onSave, saving }: { initial: ProductsConfig; onSave: (v: ProductsConfig) => void; saving: boolean }) {
  const [draft, setDraft] = useState<ProductsConfig>(initial);

  const patch = (id: string, p: Partial<ProductsConfig[string]>) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...p } }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="head text-lg uppercase">Produkter</h2>
          <p className="spec mt-0.5 text-[11px] text-muted">Pris, synlighet och lagerstatus per plagg. Slut i lager går inte att beställa.</p>
        </div>
        <button onClick={() => onSave(draft)} disabled={saving} className="btn btn-primary btn-sm flex-none">{saving ? "Sparar…" : "Spara"}</button>
      </div>

      <div className="space-y-2">
        {GARMENTS.map((g) => {
          const o = draft[g.id] ?? {};
          const active = o.active !== false;
          return (
            <div key={g.id} className="flex flex-wrap items-center gap-3 border-b border-line py-2 last:border-0">
              <div className="h-10 w-10 flex-none overflow-hidden rounded-sm bg-white">
                <GarmentImage shape={g.shape} view="front" color={g.colors[0].hex} dark={g.colors[0].dark} alt={g.name} />
              </div>
              <div className="w-28 flex-none">
                <p className="head text-sm">{g.name}</p>
                <p className="spec text-[10px] text-muted">std {g.basePrice} kr</p>
              </div>
              <label className="flex items-center gap-1.5">
                <span className="spec text-[10px] text-muted">Pris</span>
                <input
                  type="number"
                  value={o.basePrice ?? g.basePrice}
                  onChange={(e) => patch(g.id, { basePrice: Number(e.target.value) })}
                  className="field w-20 text-right"
                />
              </label>
              <select
                value={o.stockStatus ?? "in_stock"}
                onChange={(e) => patch(g.id, { stockStatus: e.target.value as StockStatus })}
                className="field w-28"
              >
                {STOCK.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <label className="ml-auto flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={active} onChange={(e) => patch(g.id, { active: e.target.checked })} className="h-4 w-4 accent-[var(--color-signal)]" />
                <span className="spec text-[11px] text-muted">{active ? "Synlig" : "Dold"}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
