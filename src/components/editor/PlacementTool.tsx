"use client";

import { useEffect } from "react";
import { useEditor, DesignElement } from "@/lib/store";
import { VIEW_LABEL } from "@/lib/garments";
import {
  getPlacements,
  applyPlacement,
  placementSpec,
  placementGuideRect,
  isPlacementActive,
  Placement,
} from "@/lib/placements";
import { useToast } from "@/components/ui/Toast";

export function PlacementTool() {
  const garment = useEditor((s) => s.garment());
  const view = useEditor((s) => s.view);
  const setView = useEditor((s) => s.setView);
  const elements = useEditor((s) => s.elements);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const updateEl = useEditor((s) => s.updateEl);
  const setHint = useEditor((s) => s.setHint);
  const { push } = useToast();

  // Rensa hjälplinjen när panelen lämnas (t.ex. byte av flik).
  useEffect(() => () => setHint(null), [setHint]);

  function hoverOn(p: Placement) {
    const r = placementGuideRect(p, garment);
    if (r) setHint({ view, label: p.label, ...r });
  }
  const hoverOff = () => setHint(null);

  const placements = getPlacements(garment, view);
  const viewEls = elements.filter((e) => e.view === view);
  const selectedEl =
    selectedId != null ? viewEls.find((e) => e.id === selectedId) ?? null : null;

  // Målelement: markerat i denna vy, annars det enda/översta elementet i vyn.
  const target = selectedEl ?? (viewEls.length === 1 ? viewEls[0] : null);
  const noTarget = target == null;

  function apply(p: Placement) {
    if (!target) return;
    const a = applyPlacement(p, garment, target.ar);
    if (!a) return;
    updateEl(target.id, { x: a.x, y: a.y, w: a.w, view: a.view });
    select(target.id);
    push({
      kind: "success",
      title: `Placerad: ${p.label}`,
      msg: `${VIEW_LABEL[a.view]} · ${Math.round(a.wcm * 10) / 10} cm bred`,
    });
  }

  const area = garment.areas.find((x) => x.key === view);

  return (
    <div className="space-y-5">
      {/* Vy-väljare (placeringar är vy-specifika) */}
      {garment.views.length > 1 && (
        <section>
          <h3 className="eyebrow mb-2">Vy</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {garment.views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-[3px] border px-2 py-2 font-display text-xs uppercase tracking-wide transition-colors ${
                  v === view ? "border-signal bg-signal text-white" : "border-line hover:border-muted"
                }`}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="eyebrow">Placering · {VIEW_LABEL[view]}</h3>
          <span className="spec text-[10px] text-muted">{placements.length} st</span>
        </div>

        {noTarget ? (
          <p className="spec rounded-[3px] border border-dashed border-line p-3 text-center text-[11px] text-muted">
            Välj ett element först — lägg till bild eller text och markera det.
          </p>
        ) : (
          <>
            {!selectedEl && (
              <p className="spec mb-2 text-[10px] text-muted">
                Tillämpas på: {elLabel(target)}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {placements.map((p) => {
                const active = isPlacementActive(p, garment, target);
                return (
                  <button
                    key={p.id}
                    onClick={() => apply(p)}
                    onMouseEnter={() => hoverOn(p)}
                    onMouseLeave={hoverOff}
                    onFocus={() => hoverOn(p)}
                    onBlur={hoverOff}
                    className={`crop-frame group flex flex-col items-start gap-1 rounded-[3px] border p-2.5 text-left transition-colors ${
                      active
                        ? "border-signal ring-1 ring-signal bg-signal/5"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    <PlacementGlyph id={p.id} active={active} />
                    <span className="font-display text-[12px] uppercase leading-tight">
                      {p.label}
                    </span>
                    {area && (
                      <span className="spec text-[9px] text-muted">
                        {placementSpec(p, area)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <p className="spec mt-3 text-[9px] text-muted-2">
          Snäpper elementet till standardläge inom tryckytan. Du kan finjustera
          efteråt genom att dra, skala och rotera på plagget.
        </p>
      </section>
    </div>
  );
}

function elLabel(el: DesignElement): string {
  if (el.type === "text") return `text “${el.text.split("\n")[0] || ""}”`;
  if (el.type === "emoji") return `emoji ${el.char}`;
  return el.aiGenerated ? "AI-grafik" : "bild";
}

/**
 * Liten schematisk plagg-thumbnail som markerar var placeringen hamnar.
 * Rektangeln ritas ungefär där tryckytan sitter (front/back/ärm).
 */
function PlacementGlyph({ id, active }: { id: string; active: boolean }) {
  // position i % inom en 24×30 "plagg"-box
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {
    "left-chest": { x: 22, y: 26, w: 16, h: 16 },
    "right-chest": { x: 62, y: 26, w: 16, h: 16 },
    "center-chest": { x: 30, y: 24, w: 40, h: 18 },
    "full-front": { x: 22, y: 30, w: 56, h: 46 },
    nape: { x: 36, y: 14, w: 28, h: 12 },
    "full-back": { x: 20, y: 26, w: 60, h: 50 },
    sleeve: { x: 38, y: 30, w: 24, h: 34 },
  };
  const s = spots[id] ?? { x: 30, y: 30, w: 40, h: 40 };
  const stroke = active ? "var(--color-signal, #00AEEF)" : "currentColor";
  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-8 w-8 ${active ? "text-signal" : "text-muted-2"}`}
      aria-hidden
    >
      {/* plaggkontur */}
      <rect
        x="18"
        y="10"
        width="64"
        height="82"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.45"
      />
      {/* placeringsfält */}
      <rect
        x={s.x}
        y={s.y}
        width={s.w}
        height={s.h}
        rx="1.5"
        fill={active ? "var(--color-signal, #00AEEF)" : "currentColor"}
        fillOpacity={active ? 0.5 : 0.25}
        stroke={stroke}
        strokeWidth="2.5"
      />
    </svg>
  );
}
