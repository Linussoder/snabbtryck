"use client";

import { useEditor, TextEl } from "@/lib/store";
import { DESIGN_FONTS, fontByName } from "@/lib/fonts";
import { textAspect } from "@/lib/text";

const SWATCHES = [
  "#ffffff", "#111114", "#ffda00", "#00aeef", "#ec008c",
  "#1f8a5b", "#1c2a44", "#b3122b", "#d8cbb2", "#57564f",
];

export function TextTool() {
  const selectedRaw = useEditor((s) => s.selected());
  const addText = useEditor((s) => s.addText);
  const updateEl = useEditor((s) => s.updateEl);
  const selected = selectedRaw?.type === "text" ? (selectedRaw as TextEl) : null;

  function patch(p: Partial<TextEl>) {
    if (!selected) return;
    const next = { ...selected, ...p };
    updateEl(selected.id, { ...p, ar: textAspect(next.text, next.lineHeight) });
  }

  if (!selected) {
    return (
      <div className="space-y-4">
        <h3 className="eyebrow">Text</h3>
        <button onClick={() => addText()} className="btn btn-primary w-full">
          + Lägg till text
        </button>
        <p className="spec text-[11px] text-muted">
          Skriv egen text, välj bland {DESIGN_FONTS.length} typsnitt, färg, kontur och böj den i en
          båge för t.ex. ryggtryck.
        </p>
        <TextPresetHint />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <h3 className="eyebrow mb-2">Din text</h3>
        <textarea
          value={selected.text}
          onChange={(e) => patch({ text: e.target.value })}
          rows={2}
          className="field resize-none font-display text-lg uppercase"
          autoFocus
        />
      </section>

      <section>
        <h3 className="eyebrow mb-2">Typsnitt</h3>
        <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto thin-scroll pr-1">
          {DESIGN_FONTS.map((f) => {
            const active = f.name === selected.font;
            return (
              <button
                key={f.name}
                onClick={() => patch({ font: f.name })}
                className={`flex h-14 items-center justify-center overflow-hidden rounded-[3px] border px-2 transition-colors ${
                  active ? "border-signal bg-signal/5" : "border-line hover:border-muted"
                }`}
                style={{ fontFamily: `${f.family}, sans-serif` }}
                title={f.name}
              >
                <span className="truncate text-lg leading-none">
                  {selected.text.split("\n")[0].slice(0, 9) || f.name}
                </span>
              </button>
            );
          })}
        </div>
        <p className="spec mt-1 text-[10px] text-muted">
          Valt: {fontByName(selected.font).name} · {fontByName(selected.font).category}
        </p>
      </section>

      <ColorRow label="Textfärg" value={selected.color} onChange={(c) => patch({ color: c })} />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="eyebrow">Kontur</h3>
          <span className="spec text-[10px] text-muted">{selected.strokeW}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          value={selected.strokeW}
          onChange={(e) => patch({ strokeW: Number(e.target.value) })}
          className="brand w-full"
        />
        {selected.strokeW > 0 && (
          <div className="mt-2">
            <ColorRow label="" value={selected.stroke} onChange={(c) => patch({ stroke: c })} compact />
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="eyebrow">Båge</h3>
          <span className="spec text-[10px] text-muted">{selected.curve}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={selected.curve}
          onChange={(e) => patch({ curve: Number(e.target.value) })}
          className="brand w-full"
        />
        <div className="mt-1 flex justify-between spec text-[9px] text-muted-2">
          <span>⌣ nedåt</span>
          <span>rak</span>
          <span>⌢ uppåt</span>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="eyebrow">Radavstånd</h3>
          <span className="spec text-[10px] text-muted">{selected.lineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.8}
          max={1.8}
          step={0.05}
          value={selected.lineHeight}
          onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
          className="brand w-full"
        />
      </section>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
  compact,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
  compact?: boolean;
}) {
  return (
    <section>
      {label && <h3 className="eyebrow mb-2">{label}</h3>}
      <div className="flex flex-wrap items-center gap-1.5">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-label={c}
            className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === c ? "border-signal" : "border-line"
            }`}
            style={{ background: c }}
          />
        ))}
        {!compact && (
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-line">
            <span className="absolute inset-0 flex items-center justify-center text-xs">+</span>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute -inset-2 cursor-pointer opacity-0"
            />
          </label>
        )}
      </div>
    </section>
  );
}

function TextPresetHint() {
  const addText = useEditor((s) => s.addText);
  return (
    <div className="rounded-[3px] border border-line bg-paper-2 p-3">
      <p className="spec text-[10px] text-muted mb-2">Snabbstart</p>
      <div className="flex flex-wrap gap-1.5">
        {["LAGET", "#1", "SEDAN 2024", "STHLM"].map((t) => (
          <button
            key={t}
            onClick={() => addText(t)}
            className="rounded-[3px] border border-line px-2 py-1 font-display text-xs uppercase hover:border-ink"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
