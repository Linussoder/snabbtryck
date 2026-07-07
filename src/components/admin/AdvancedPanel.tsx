"use client";

import { useEditor } from "@/lib/store";

// Admin-kraftpanel: exakt placering (cm/mm-precision) + fri uppladdning utan
// kvalitetsvarningar. Läser/skriver via editor-storet (samma som kundverktyget).

function Num({ label, value, step = 1, suffix, onChange }: { label: string; value: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="spec text-[11px] text-muted">{label}</span>
      <span className="flex items-center gap-1">
        <input type="number" step={step} value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
          onChange={(e) => onChange(Number(e.target.value))} className="field w-20 text-right" />
        {suffix && <span className="spec w-6 text-[10px] text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

export function AdvancedPanel() {
  const sel = useEditor((s) => s.selected());
  const updateEl = useEditor((s) => s.updateEl);
  const garment = useEditor((s) => s.garment());
  const addImage = useEditor((s) => s.addImage);

  function freeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => addImage(src, img.naturalWidth, img.naturalHeight);
      img.onerror = () => addImage(src, 800, 800);
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const refCm = garment.printRefWidthCm;
  const wCm = sel ? sel.w * refCm : 0;
  const hCm = sel ? wCm * sel.ar : 0;

  return (
    <div className="space-y-5">
      <section>
        <h3 className="eyebrow mb-2">Fri uppladdning</h3>
        <label className="btn btn-outline btn-sm w-full cursor-pointer">
          Ladda upp bild (inga varningar)
          <input type="file" accept="image/*" className="hidden" onChange={freeUpload} />
        </label>
        <p className="spec mt-1.5 text-[10px] text-muted">Ingen DPI-/storlekskontroll — admin ansvarar för kvaliteten.</p>
      </section>

      <section>
        <h3 className="eyebrow mb-2">Exakt placering</h3>
        {!sel ? (
          <p className="text-sm text-muted">Markera ett element på plagget för att ange exakta mått.</p>
        ) : (
          <div className="space-y-2">
            <Num label="Bredd" value={wCm} step={0.1} suffix="cm" onChange={(cm) => updateEl(sel.id, { w: Math.max(0.01, cm / refCm) })} />
            <Num label="Höjd" value={hCm} step={0.1} suffix="cm" onChange={(cm) => updateEl(sel.id, { ar: Math.max(0.01, cm / (wCm || 0.01)) })} />
            <Num label="X (mitt)" value={sel.x * 100} step={0.5} suffix="%" onChange={(v) => updateEl(sel.id, { x: Math.min(1, Math.max(0, v / 100)) })} />
            <Num label="Y (mitt)" value={sel.y * 100} step={0.5} suffix="%" onChange={(v) => updateEl(sel.id, { y: Math.min(1, Math.max(0, v / 100)) })} />
            <Num label="Rotation" value={sel.rotation} step={1} suffix="°" onChange={(v) => updateEl(sel.id, { rotation: v })} />
            <p className="spec text-[10px] text-muted">Referensbredd {refCm} cm = hela tryckytan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
