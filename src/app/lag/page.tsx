"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useToast } from "@/components/ui/Toast";
import { DesignSnapshot, DesignElement, computePrintArea, uid } from "@/lib/store";
import { GARMENTS, getGarment } from "@/lib/garments";
import { computePrice, nextTier } from "@/lib/pricing";
import { setCart } from "@/lib/account";
import { useAuth } from "@/components/auth/AuthProvider";
import { kr, num, pct } from "@/lib/format";

interface Row {
  id: string;
  name: string;
  number: string;
  size: string;
}

const SIZES = ["S", "M", "L", "XL", "2XL"];

function baseText(view: "back", text: string, y: number, w: number, color: string): DesignElement {
  return {
    id: uid("txt"),
    type: "text",
    view,
    x: 0.5,
    y,
    w,
    ar: 0.3,
    rotation: 0,
    text,
    font: "Anton",
    color,
    stroke: "#111114",
    strokeW: 0,
    curve: 0,
    lineHeight: 1,
  } as DesignElement;
}

export default function LagPage() {
  const router = useRouter();
  const { push } = useToast();
  const [garmentId, setGarmentId] = useState("tshirt");
  const [colorIndex, setColorIndex] = useState(0);
  const [rows, setRows] = useState<Row[]>([
    { id: uid("r"), name: "ANDERSSON", number: "7", size: "L" },
    { id: uid("r"), name: "BERG", number: "10", size: "M" },
    { id: uid("r"), name: "CARLSSON", number: "23", size: "XL" },
  ]);
  const [paste, setPaste] = useState("");

  const garment = getGarment(garmentId);
  const color = garment.colors[colorIndex] ?? garment.colors[0];
  const { profile } = useAuth();
  const business = profile?.business ?? false;

  const base: DesignSnapshot = useMemo(
    () => ({
      id: uid("dsn"),
      name: "Lagtryck",
      garmentId,
      colorIndex,
      size: "L",
      qty: rows.length,
      elements: [],
      updatedAt: Date.now(),
    }),
    [garmentId, colorIndex, rows.length]
  );

  const rowSnapshot = (r: Row): DesignSnapshot => {
    const textColor = color.dark ? "#ffffff" : "#111114";
    const els: DesignElement[] = [];
    if (r.number) els.push(baseText("back", r.number, 0.42, 0.42, textColor));
    if (r.name) els.push(baseText("back", r.name, 0.2, 0.5, textColor));
    return { ...base, size: r.size, elements: els };
  };

  const qty = rows.length;
  const area = computePrintArea(rowSnapshot(rows[0] ?? { id: "", name: "A", number: "1", size: "L" }).elements, garment);
  const price = computePrice(garment, area, qty);
  const next = nextTier(qty);
  const total = business ? price.subtotalExclVat : price.subtotalInclVat;

  function update(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { id: uid("r"), name: "", number: "", size: "L" }]);
  }
  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }
  function importPaste() {
    const parsed = paste
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const m = l.split(/[,\t;]|\s{2,}| (?=\d+$)/).map((s) => s.trim()).filter(Boolean);
        const name = (m[0] ?? "").toUpperCase();
        const number = (m[1] ?? "").replace(/\D/g, "");
        return { id: uid("r"), name, number, size: "L" as string };
      });
    if (parsed.length) {
      setRows(parsed);
      setPaste("");
      push({ kind: "success", title: `${parsed.length} spelare importerade` });
    }
  }
  function checkout() {
    setCart({ design: { ...base, name: `Lagtryck ${garment.name}` }, qty });
    router.push("/kassa");
  }

  return (
    <PageShell>
      <PageHead
        index="LAG"
        title="Lagbeställning"
        sub="Ladda upp namn och nummer, förhandsgranska hela laget och få volympris direkt."
      />
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* garment + color */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Plagg & färg</h2>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={garmentId}
                onChange={(e) => {
                  setGarmentId(e.target.value);
                  setColorIndex(0);
                }}
                className="field w-auto"
              >
                {GARMENTS.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} — från {g.basePrice} kr</option>
                ))}
              </select>
              <div className="flex gap-2">
                {garment.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setColorIndex(i)}
                    title={c.name}
                    className={`h-8 w-8 rounded-full border-2 ${i === colorIndex ? "border-signal" : "border-line"}`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* roster */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="eyebrow">Laglista · {rows.length} spelare</h2>
              <button onClick={addRow} className="btn btn-ghost btn-sm">+ Rad</button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_70px_80px_32px] gap-2 spec text-[10px] text-muted">
                <span>NAMN</span><span>NR</span><span>STL</span><span />
              </div>
              {rows.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_70px_80px_32px] items-center gap-2">
                  <input value={r.name} onChange={(e) => update(r.id, { name: e.target.value.toUpperCase() })} placeholder="Namn" className="field py-2 text-sm" />
                  <input value={r.number} onChange={(e) => update(r.id, { number: e.target.value.replace(/\D/g, "") })} placeholder="#" className="field py-2 text-center text-sm" />
                  <select value={r.size} onChange={(e) => update(r.id, { size: e.target.value })} className="field py-2 text-sm">
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => removeRow(r.id)} className="text-muted hover:text-bad">×</button>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <label className="eyebrow">Eller klistra in lista (namn nummer per rad)</label>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={3}
                placeholder={"Andersson 7\nBerg 10\nCarlsson 23"}
                className="field mt-2 resize-none font-mono text-sm"
              />
              <button onClick={importPaste} disabled={!paste.trim()} className="btn btn-outline btn-sm mt-2">Importera lista</button>
            </div>
          </section>

          {/* preview */}
          <section>
            <h2 className="head mb-3 text-lg">Förhandsgranska laget</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {rows.map((r) => (
                <div key={r.id} className="card crop-frame overflow-hidden">
                  <div className="aspect-square bg-paper-2">
                    <DesignThumb design={rowSnapshot(r)} view="back" />
                  </div>
                  <div className="bg-ink px-2 py-2 text-center">
                    <p className="head truncate text-sm text-paper">{r.name || "—"}</p>
                    <p className="spec text-[10px] text-paper/60">
                      <span className="font-display text-cyan">#{r.number || "–"}</span> · {r.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* sticky price */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <h2 className="eyebrow mb-3">Volympris</h2>
            <div className="space-y-1 text-sm">
              <Line label={`${garment.name} × ${qty}`} value={kr(garment.basePrice * qty)} />
              <Line label={`Tryck ${num(area)} cm²/st`} value={kr(price.printCost * qty)} />
              {price.discountPct > 0 && (
                <Line label={`Mängdrabatt −${pct(price.discountPct)}`} value={`−${kr((price.unitBeforeDiscount - price.unitAfterDiscount) * qty)}`} accent />
              )}
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
              <div>
                <span className="eyebrow">{business ? "Exkl. moms" : "Inkl. moms"}</span>
                <p className="spec text-[11px] text-muted">{kr(price.unitAfterDiscount)} / st</p>
              </div>
              <PriceDisplay value={Math.round(total)} size="lg" />
            </div>
            {next && (
              <p className="spec mt-2 text-[11px] text-muted">+ {next.min - qty} plagg → −{pct(next.pct)} rabatt</p>
            )}
            <button onClick={checkout} className="btn btn-primary mt-4 w-full">
              {business ? "Begär offert" : "Lägg laget i varukorg"} →
            </button>
            <p className="mt-3 spec text-[10px] text-muted">Namn & nummer trycks på ryggen. Loggan kan läggas till i verktyget.</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`tabular-nums ${accent ? "text-signal" : ""}`}>{value}</span>
    </div>
  );
}
