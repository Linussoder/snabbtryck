"use client";

import { useEditor, DesignElement } from "@/lib/store";
import { VIEW_LABEL } from "@/lib/garments";

const ICON: Record<DesignElement["type"], string> = {
  image: "▣",
  text: "T",
  emoji: "☺",
};

function label(el: DesignElement): string {
  if (el.type === "text") return el.text.split("\n")[0] || "Text";
  if (el.type === "emoji") return el.char;
  return el.aiGenerated ? "AI-grafik" : "Bild";
}

export function LayerPanel() {
  const elements = useEditor((s) => s.elements);
  const view = useEditor((s) => s.view);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const moveLayer = useEditor((s) => s.moveLayer);
  const removeEl = useEditor((s) => s.removeEl);

  // översta lagret först
  const viewEls = elements.filter((e) => e.view === view).slice().reverse();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="eyebrow">Lager · {VIEW_LABEL[view]}</h3>
        <span className="spec text-[10px] text-muted">{viewEls.length} st</span>
      </div>
      {viewEls.length === 0 ? (
        <p className="spec rounded-[3px] border border-dashed border-line p-3 text-center text-[11px] text-muted">
          Inga element ännu
        </p>
      ) : (
        <ul className="space-y-1">
          {viewEls.map((el) => {
            const active = el.id === selectedId;
            return (
              <li
                key={el.id}
                onClick={() => select(el.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-[3px] border px-2 py-1.5 ${
                  active ? "border-signal bg-signal/5" : "border-line hover:border-muted"
                }`}
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-[2px] bg-paper-2 font-display text-xs">
                  {ICON[el.type]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{label(el)}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(el.id, "up");
                    }}
                    className="flex h-6 w-6 items-center justify-center text-muted hover:text-ink"
                    title="Flytta upp"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(el.id, "down");
                    }}
                    className="flex h-6 w-6 items-center justify-center text-muted hover:text-ink"
                    title="Flytta ner"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEl(el.id);
                    }}
                    className="flex h-6 w-6 items-center justify-center text-muted hover:text-bad"
                    title="Ta bort"
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
