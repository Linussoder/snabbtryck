"use client";

import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from "react";
import { useEditor, DesignElement } from "@/lib/store";
import { ElementVisual } from "./ElementVisual";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { evaluateQuality } from "@/lib/dpi";
import { cm } from "@/lib/format";
import type { GarmentShape as Shape, ViewKey } from "@/lib/garments";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface DragState {
  mode: "move" | "scale" | "rotate";
  id: string;
  rectL: number;
  rectT: number;
  W: number;
  H: number;
  startX: number;
  startY: number;
  ox: number;
  oy: number;
  ow: number;
  orot: number;
  cxpx: number;
  cypx: number;
  startDist: number;
  startAngle: number;
}

export function DesignCanvas({ interactive = true }: { interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const drag = useRef<DragState | null>(null);

  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const view = useEditor((s) => s.view);
  const elements = useEditor((s) => s.elements);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const updateEl = useEditor((s) => s.updateEl);
  const removeEl = useEditor((s) => s.removeEl);

  const color = garment.colors[colorIndex] ?? garment.colors[0];
  const areas = garment.areas.filter((a) => a.key === view);
  const viewEls = elements.filter((e) => e.view === view);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(() => {
      const r = node.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  function startDrag(
    e: RPointerEvent,
    id: string,
    mode: DragState["mode"],
    el: DesignElement
  ) {
    if (!interactive) return;
    e.stopPropagation();
    const node = ref.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    const cxpx = r.left + el.x * r.width;
    const cypx = r.top + el.y * r.height;
    drag.current = {
      mode,
      id,
      rectL: r.left,
      rectT: r.top,
      W: r.width,
      H: r.height,
      startX: e.clientX,
      startY: e.clientY,
      ox: el.x,
      oy: el.y,
      ow: el.w,
      orot: el.rotation,
      cxpx,
      cypx,
      startDist: Math.hypot(e.clientX - cxpx, e.clientY - cypx) || 1,
      startAngle: (Math.atan2(e.clientY - cypx, e.clientX - cxpx) * 180) / Math.PI,
    };
    select(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: RPointerEvent) {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "move") {
      const dx = (e.clientX - d.startX) / d.W;
      const dy = (e.clientY - d.startY) / d.H;
      updateEl(d.id, { x: clamp(d.ox + dx, 0.02, 0.98), y: clamp(d.oy + dy, 0.02, 0.98) });
    } else if (d.mode === "scale") {
      const dist = Math.hypot(e.clientX - d.cxpx, e.clientY - d.cypx);
      updateEl(d.id, { w: clamp((d.ow * dist) / d.startDist, 0.04, 1.1) });
    } else if (d.mode === "rotate") {
      const ang = (Math.atan2(e.clientY - d.cypx, e.clientX - d.cxpx) * 180) / Math.PI;
      let rot = d.orot + (ang - d.startAngle);
      if (e.shiftKey) rot = Math.round(rot / 15) * 15;
      updateEl(d.id, { rotation: Math.round(rot) });
    }
  }

  function endDrag() {
    drag.current = null;
  }

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {/* rulers */}
      <div className="pointer-events-none absolute left-10 right-4 top-2 flex items-end justify-between">
        <span className="spec text-[10px] text-muted">0</span>
        <div className="ruler mx-2 h-2 flex-1 opacity-70" />
        <span className="spec text-[10px] text-muted">{garment.printRefWidthCm} cm</span>
      </div>

      <div
        ref={ref}
        onPointerDown={() => interactive && select(null)}
        className="relative aspect-square w-full max-w-[560px] touch-none"
      >
        {/* garment */}
        <div className="absolute inset-0">
          <GarmentBg
            shape={garment.shape}
            view={view}
            color={color.hex}
            dark={color.dark}
          />
        </div>

        {/* print-area guides */}
        {areas.map((a) => (
          <div
            key={a.label}
            className="pointer-events-none absolute"
            style={{
              left: `${a.x * 100}%`,
              top: `${a.y * 100}%`,
              width: `${a.w * 100}%`,
              height: `${a.h * 100}%`,
            }}
          >
            <div
              className="absolute inset-0 border border-dashed"
              style={{ borderColor: color.dark ? "rgba(255,255,255,0.45)" : "rgba(10,10,10,0.4)" }}
            />
            <span
              className="absolute -top-4 left-0 spec text-[9px] uppercase tracking-wider"
              style={{ color: color.dark ? "rgba(255,255,255,0.6)" : "rgba(10,10,10,0.5)" }}
            >
              {a.label} · {a.maxWcm}×{a.maxHcm}
            </span>
          </div>
        ))}

        {/* elements */}
        {viewEls.map((el) => {
          const selected = el.id === selectedId;
          const wPct = el.w * 100;
          const hPx = el.w * size.w * el.ar;
          return (
            <div
              key={el.id}
              onPointerDown={(e) => startDrag(e, el.id, "move", el)}
              className="absolute cursor-move"
              style={{
                left: `${el.x * 100}%`,
                top: `${el.y * 100}%`,
                width: `${wPct}%`,
                height: hPx,
                transform: `translate(-50%,-50%) rotate(${el.rotation}deg)`,
              }}
            >
              <ElementVisual el={el} />

              {selected && interactive && (
                <>
                  <div className="pointer-events-none absolute -inset-1 border border-signal" />
                  {/* rotate */}
                  <div
                    className="absolute left-1/2 -top-7 h-6 w-px -translate-x-1/2 bg-signal"
                    aria-hidden
                  />
                  <button
                    onPointerDown={(e) => startDrag(e, el.id, "rotate", el)}
                    className="absolute left-1/2 -top-9 h-4 w-4 -translate-x-1/2 cursor-grab rounded-full border-2 border-signal bg-paper"
                    title="Rotera"
                    aria-label="Rotera"
                  />
                  {/* scale */}
                  <button
                    onPointerDown={(e) => startDrag(e, el.id, "scale", el)}
                    className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize border-2 border-signal bg-paper"
                    title="Skala"
                    aria-label="Skala"
                  />
                  {/* delete */}
                  <button
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      removeEl(el.id);
                      select(null);
                    }}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper text-xs leading-none"
                    title="Ta bort"
                    aria-label="Ta bort element"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* registration marks (decor) */}
        <RegCorner className="left-1 top-1" />
        <RegCorner className="right-1 top-1" />
        <RegCorner className="left-1 bottom-1" />
        <RegCorner className="right-1 bottom-1" />
      </div>

      {/* selected image DPI badge */}
      <SelectedDpiBadge sizeW={size.w} />

      {viewEls.length === 0 && interactive && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <p className="spec text-muted">
            Tomt på {view === "front" ? "framsidan" : view === "back" ? "baksidan" : "ärmen"} — lägg
            till bild, text eller emoji
          </p>
        </div>
      )}
    </div>
  );
}

function GarmentBg(props: {
  shape: Shape;
  view: ViewKey;
  color: string;
  dark: boolean;
}) {
  // Riktigt plaggfoto (modellfritt) — contain så hela plagget syns; ärm-vyn
  // faller tillbaka på SVG-silhuetten inuti GarmentImage.
  return (
    <GarmentImage
      shape={props.shape}
      view={props.view}
      color={props.color}
      dark={props.dark}
      fit="contain"
      className="h-full w-full"
    />
  );
}

function RegCorner({ className }: { className: string }) {
  return (
    <span
      className={`reg-mark pointer-events-none absolute text-muted/40 ${className}`}
      style={{ width: 12, height: 12 }}
      aria-hidden
    >
      <span className="reg-ring" />
    </span>
  );
}

function SelectedDpiBadge({ sizeW }: { sizeW: number }) {
  const sel = useEditor((s) => s.selected());
  const garment = useEditor((s) => s.garment());
  if (!sel || sel.type !== "image" || !sizeW) return null;
  const wcm = sel.w * garment.printRefWidthCm;
  const hcm = wcm * sel.ar;
  const q = evaluateQuality(sel.naturalW, sel.naturalH, wcm, hcm);
  const cfg =
    q.level === "good"
      ? "var(--color-good)"
      : q.level === "warn"
      ? "var(--color-warn)"
      : "var(--color-bad)";
  return (
    <div
      className="absolute left-3 top-3 flex items-center gap-2 rounded-[3px] border bg-paper/90 px-2.5 py-1.5 backdrop-blur"
      style={{ borderColor: cfg }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: cfg }} />
      <span className="spec text-[11px]">
        {Math.round(q.dpi)} DPI · {cm(wcm)}
      </span>
    </div>
  );
}
