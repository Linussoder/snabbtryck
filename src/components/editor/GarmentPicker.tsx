"use client";

import { useEditor } from "@/lib/store";
import { GARMENTS, CATEGORIES, VIEW_LABEL } from "@/lib/garments";
import { kr } from "@/lib/format";
import { GarmentImage } from "@/components/ui/GarmentImage";

export function GarmentPicker() {
  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const size = useEditor((s) => s.size);
  const view = useEditor((s) => s.view);
  const setGarment = useEditor((s) => s.setGarment);
  const setColor = useEditor((s) => s.setColor);
  const setSize = useEditor((s) => s.setSize);
  const setView = useEditor((s) => s.setView);
  const color = garment.colors[colorIndex] ?? garment.colors[0];

  return (
    <div className="space-y-6">
      {/* Garment grid */}
      <section>
        <h3 className="eyebrow mb-2">Plagg</h3>
        {CATEGORIES.map((cat) => (
          <div key={cat} className="mb-3">
            <p className="spec text-[10px] text-muted-2 mb-1.5">{cat}</p>
            <div className="grid grid-cols-3 gap-2">
              {GARMENTS.filter((g) => g.category === cat).map((g) => {
                const active = g.id === garment.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGarment(g.id)}
                    className={`group overflow-hidden rounded-[10px] border transition-colors ${
                      active ? "border-ink ring-1 ring-ink" : "border-line hover:border-muted"
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-white">
                      <GarmentImage
                        shape={g.shape}
                        view="front"
                        color={active ? color.hex : g.colors[0].hex}
                        dark={active ? color.dark : g.colors[0].dark}
                        alt={g.name}
                      />
                    </div>
                    <div className="px-1 py-1.5">
                      <span className="block text-center font-head text-[11px] leading-tight">
                        {g.name}
                      </span>
                      <span className="spec block text-center text-[9px] text-muted">
                        {kr(g.basePrice)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Color */}
      <section>
        <h3 className="eyebrow mb-2">Färg — {color.name}</h3>
        <div className="flex flex-wrap gap-2">
          {garment.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setColor(i)}
              title={c.name}
              aria-label={c.name}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                i === colorIndex ? "border-signal" : "border-line"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </section>

      {/* Size */}
      <section>
        <h3 className="eyebrow mb-2">Storlek</h3>
        <div className="flex flex-wrap gap-1.5">
          {garment.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`min-w-[42px] rounded-[10px] border px-2.5 py-1.5 font-display text-sm uppercase transition-colors ${
                s === size ? "border-ink bg-ink text-paper" : "border-line hover:border-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* View switcher */}
      <section>
        <h3 className="eyebrow mb-2">Vy</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {garment.views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-[10px] border px-2 py-2 font-display text-xs uppercase tracking-wide transition-colors ${
                v === view ? "border-signal bg-signal text-white" : "border-line hover:border-muted"
              }`}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
