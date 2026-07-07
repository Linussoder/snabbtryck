"use client";

import { DesignSnapshot } from "@/lib/store";
import { getGarment, VIEW_LABEL } from "@/lib/garments";
import { evaluateQuality } from "@/lib/dpi";

const r1 = (n: number) => Math.round(n * 10) / 10;

function elName(el: DesignSnapshot["elements"][number]): string {
  if (el.type === "text") return `Text “${el.text.split("\n")[0] || ""}”`;
  if (el.type === "emoji") return `Emoji ${el.char}`;
  return el.aiGenerated ? "AI-grafik" : "Logga / bild";
}

/**
 * Exakta tryckmått per element (logga/text) i ordern — bredd × höjd i cm,
 * samt DPI-kvalitet för bilder. Gruppperat per vy.
 */
export function PrintSpecList({ design }: { design: DesignSnapshot }) {
  const g = getGarment(design.garmentId);
  const views = g.views.filter((v) => design.elements.some((e) => e.view === v));
  if (!design.elements.length) return null;

  return (
    <div className="space-y-4">
      {views.map((v) => {
        const els = design.elements.filter((e) => e.view === v);
        return (
          <div key={v}>
            <p className="eyebrow mb-1.5 text-muted">{VIEW_LABEL[v]}</p>
            <ul className="divide-y divide-line rounded-[3px] border border-line">
              {els.map((el) => {
                const wcm = el.w * g.printRefWidthCm;
                const hcm = wcm * el.ar;
                const q =
                  el.type === "image"
                    ? evaluateQuality(el.naturalW, el.naturalH, wcm, hcm)
                    : null;
                const dpiColor =
                  q?.level === "good"
                    ? "var(--color-good)"
                    : q?.level === "warn"
                    ? "var(--color-warn)"
                    : "var(--color-bad)";
                return (
                  <li key={el.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{elName(el)}</span>
                    <span className="spec tabular-nums text-[12px] text-ink">
                      {r1(wcm)} × {r1(hcm)} cm
                    </span>
                    {el.rotation !== 0 && (
                      <span className="spec text-[11px] text-muted">{el.rotation}°</span>
                    )}
                    {q && (
                      <span
                        className="spec inline-flex items-center gap-1 text-[11px]"
                        style={{ color: dpiColor }}
                        title={q.message}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: dpiColor }} />
                        {Math.round(q.dpi)} DPI
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
