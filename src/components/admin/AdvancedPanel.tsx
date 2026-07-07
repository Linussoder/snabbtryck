"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, ImageEl } from "@/lib/store";
import { removeBackgroundLocal } from "@/lib/bgremove";
import { upscaleImage } from "@/lib/upscale";
import { useToast } from "@/components/ui/Toast";

// Admin-kraftpanel: allt kundverktyget INTE har. Fri uppladdning utan varningar,
// proffs-bildverktyg (bg-borttagning, AI-uppskalning, färgjustering), DPI-koll,
// exakt cm/mm-placering + justera/ordna. Skriver via editor-storet (samma data
// som kundverktyget) och återanvänder befintliga libbar.

const VIEW_LABEL: Record<string, string> = { front: "Fram", back: "Bak", sleeve: "Ärm", left: "Vänster", right: "Höger" };

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

function Slider({ label, value, min, max, onChange, onCommit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; onCommit: () => void }) {
  return (
    <label className="block">
      <span className="spec flex justify-between text-[11px] text-muted"><span>{label}</span><span>{value}%</span></span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} onMouseUp={onCommit} onTouchEnd={onCommit}
        className="w-full accent-[var(--color-signal)]" />
    </label>
  );
}

// Applicerar canvas-filter på en bild och returnerar ny data-URL.
function processImage(baseSrc: string, contrast: number, saturate: number, grayscale: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) { reject(new Error("no ctx")); return; }
      ctx.filter = `contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`;
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("bild"));
    img.src = baseSrc;
  });
}

export function AdvancedPanel() {
  const { push } = useToast();
  const sel = useEditor((s) => s.selected());
  const updateEl = useEditor((s) => s.updateEl);
  const removeEl = useEditor((s) => s.removeEl);
  const duplicate = useEditor((s) => s.duplicate);
  const moveLayer = useEditor((s) => s.moveLayer);
  const garment = useEditor((s) => s.garment());
  const addImage = useEditor((s) => s.addImage);
  const setView = useEditor((s) => s.setView);

  const [busy, setBusy] = useState<null | "bg" | "up" | "col">(null);
  const [adj, setAdj] = useState({ contrast: 100, saturate: 100, grayscale: 0 });
  const baseSrc = useRef<Record<string, string>>({});

  const isImg = sel?.type === "image";
  const img = isImg ? (sel as ImageEl) : null;

  // Nollställ färgjustering + kom ihåg originalbilden när man byter element.
  useEffect(() => {
    setAdj({ contrast: 100, saturate: 100, grayscale: 0 });
    if (img && !baseSrc.current[img.id]) baseSrc.current[img.id] = img.src;
  }, [sel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function freeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const im = new Image();
      im.onload = () => addImage(src, im.naturalWidth, im.naturalHeight);
      im.onerror = () => addImage(src, 800, 800);
      im.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function applyColor() {
    if (!img) return;
    const base = baseSrc.current[img.id] ?? img.src;
    if (adj.contrast === 100 && adj.saturate === 100 && adj.grayscale === 0) { updateEl(img.id, { src: base }); return; }
    setBusy("col");
    try { updateEl(img.id, { src: await processImage(base, adj.contrast, adj.saturate, adj.grayscale) }); }
    catch { push({ kind: "error", title: "Kunde inte justera bilden" }); }
    setBusy(null);
  }

  async function removeBg() {
    if (!img) return;
    setBusy("bg");
    try {
      const out = await removeBackgroundLocal(img.src);
      baseSrc.current[img.id] = out;
      updateEl(img.id, { src: out, bgRemoved: true });
      push({ kind: "success", title: "Bakgrund borttagen" });
    } catch { push({ kind: "error", title: "Bakgrundsborttagning misslyckades" }); }
    setBusy(null);
  }

  async function upscale(scale: 2 | 4) {
    if (!img) return;
    setBusy("up");
    try {
      const r = await upscaleImage(img.src, scale);
      baseSrc.current[img.id] = r.src;
      updateEl(img.id, { src: r.src, naturalW: r.width, naturalH: r.height });
      push({ kind: "success", title: `Uppskalad ${scale}×`, msg: `${r.width}×${r.height} px` });
    } catch { push({ kind: "error", title: "Uppskalning misslyckades" }); }
    setBusy(null);
  }

  const refCm = garment.printRefWidthCm;
  const wCm = sel ? sel.w * refCm : 0;
  const hCm = sel ? wCm * sel.ar : 0;

  // Effektiv tryck-DPI för bild vid nuvarande storlek.
  const printInch = wCm / 2.54;
  const dpi = img && printInch > 0 ? Math.round(img.naturalW / printInch) : 0;
  const dpiBadge = dpi >= 300 ? { t: "Utmärkt", c: "text-good" } : dpi >= 150 ? { t: "OK", c: "text-warn" } : { t: "Låg", c: "text-bad" };

  const hw = sel ? sel.w / 2 : 0;
  const hh = sel ? (sel.w * sel.ar) / 2 : 0;
  function place(patch: { x?: number; y?: number }) { if (sel) updateEl(sel.id, patch); }

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

      {!sel ? (
        <p className="text-sm text-muted">Markera ett element på plagget för fler verktyg.</p>
      ) : (
        <>
          {/* Bildverktyg */}
          {img && (
            <section>
              <h3 className="eyebrow mb-2">Bildverktyg</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={removeBg} disabled={!!busy} className="btn btn-outline btn-sm">
                  {busy === "bg" ? "Tar bort…" : "Ta bort bakgrund"}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => upscale(2)} disabled={!!busy} className="btn btn-outline btn-sm flex-1">{busy === "up" ? "…" : "AI 2×"}</button>
                  <button onClick={() => upscale(4)} disabled={!!busy} className="btn btn-outline btn-sm flex-1">AI 4×</button>
                </div>
              </div>
              <div className="mt-3 space-y-2 rounded-lg bg-paper-2 p-3">
                <p className="spec text-[10px] text-muted">Färgjustering</p>
                <Slider label="Kontrast" value={adj.contrast} min={0} max={200} onChange={(v) => setAdj({ ...adj, contrast: v })} onCommit={applyColor} />
                <Slider label="Mättnad" value={adj.saturate} min={0} max={200} onChange={(v) => setAdj({ ...adj, saturate: v })} onCommit={applyColor} />
                <Slider label="Gråskala" value={adj.grayscale} min={0} max={100} onChange={(v) => setAdj({ ...adj, grayscale: v })} onCommit={applyColor} />
                <button onClick={() => { const b = baseSrc.current[img.id]; if (b) updateEl(img.id, { src: b }); setAdj({ contrast: 100, saturate: 100, grayscale: 0 }); }}
                  className="spec text-[10px] text-muted underline">Återställ bild</button>
              </div>

              {/* DPI-inspektör */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className="spec text-[11px] text-muted">Tryck-DPI vid {wCm.toFixed(1)} cm</span>
                <span className={`spec text-sm font-bold ${dpiBadge.c}`}>{dpi} · {dpiBadge.t}</span>
              </div>
            </section>
          )}

          {/* Justera & ordna */}
          <section>
            <h3 className="eyebrow mb-2">Justera & ordna</h3>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => place({ x: 0.5 })} className="btn btn-ghost btn-sm">Centrera X</button>
              <button onClick={() => place({ y: 0.5 })} className="btn btn-ghost btn-sm">Centrera Y</button>
              <button onClick={() => place({ x: 0.5, y: 0.5 })} className="btn btn-ghost btn-sm">Mitten</button>
              <button onClick={() => place({ x: hw })} className="btn btn-ghost btn-sm">Vänster</button>
              <button onClick={() => place({ x: 1 - hw })} className="btn btn-ghost btn-sm">Höger</button>
              <button onClick={() => updateEl(sel.id, { rotation: 0 })} className="btn btn-ghost btn-sm">Nollställ °</button>
              <button onClick={() => place({ y: hh })} className="btn btn-ghost btn-sm">Topp</button>
              <button onClick={() => place({ y: 1 - hh })} className="btn btn-ghost btn-sm">Botten</button>
              <button onClick={() => place({ y: 0.5, x: 0.5 })} className="btn btn-ghost btn-sm">Mitt</button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <button onClick={() => moveLayer(sel.id, "up")} className="btn btn-ghost btn-sm">Fram ↑</button>
              <button onClick={() => moveLayer(sel.id, "down")} className="btn btn-ghost btn-sm">Bak ↓</button>
              <button onClick={() => duplicate(sel.id)} className="btn btn-ghost btn-sm">Kopia</button>
              <button onClick={() => removeEl(sel.id)} className="btn btn-ghost btn-sm text-bad">Ta bort</button>
            </div>
            <button onClick={() => updateEl(sel.id, { locked: !sel.locked })}
              className={`btn btn-sm mt-1.5 w-full ${sel.locked ? "btn-primary" : "btn-outline"}`}>
              {sel.locked ? "🔒 Låst — lås upp" : "Lås element"}
            </button>
          </section>

          {/* Flytta till vy */}
          {garment.views.length > 1 && (
            <section>
              <h3 className="eyebrow mb-2">Flytta till tryckyta</h3>
              <div className="flex flex-wrap gap-1.5">
                {garment.views.map((v) => (
                  <button key={v} disabled={sel.view === v}
                    onClick={() => { updateEl(sel.id, { view: v }); setView(v); }}
                    className={`rounded-full border px-3 py-1 text-sm ${sel.view === v ? "border-signal bg-signal text-white" : "border-line text-muted hover:border-ink"}`}>
                    {VIEW_LABEL[v] ?? v}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Exakt placering */}
          <section>
            <h3 className="eyebrow mb-2">Exakt placering</h3>
            <div className="space-y-2">
              <Num label="Bredd" value={wCm} step={0.1} suffix="cm" onChange={(cm) => updateEl(sel.id, { w: Math.max(0.01, cm / refCm) })} />
              <Num label="Höjd" value={hCm} step={0.1} suffix="cm" onChange={(cm) => updateEl(sel.id, { ar: Math.max(0.01, cm / (wCm || 0.01)) })} />
              <Num label="X (mitt)" value={sel.x * 100} step={0.5} suffix="%" onChange={(v) => updateEl(sel.id, { x: Math.min(1, Math.max(0, v / 100)) })} />
              <Num label="Y (mitt)" value={sel.y * 100} step={0.5} suffix="%" onChange={(v) => updateEl(sel.id, { y: Math.min(1, Math.max(0, v / 100)) })} />
              <Num label="Rotation" value={sel.rotation} step={1} suffix="°" onChange={(v) => updateEl(sel.id, { rotation: v })} />
              <p className="spec text-[10px] text-muted">Referensbredd {refCm} cm = hela tryckytan.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
