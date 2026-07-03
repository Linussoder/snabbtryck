"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHead } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useToast } from "@/components/ui/Toast";

/* ---------- format & pris-modell ---------- */

type Format = "A4" | "A3";

const FORMATS: Record<
  Format,
  { label: string; w: number; h: number; base: number; ratio: string }
> = {
  A4: { label: "A4", w: 210, h: 297, base: 99, ratio: "210 / 297" },
  A3: { label: "A3", w: 297, h: 420, base: 149, ratio: "297 / 420" },
};

const PER_ELEMENT = 10; // kr per tillagt element

/* ---------- element-modell (lokal state, ej kopplad till editor-store) ---------- */

type ElType = "text" | "image";

interface ArkElement {
  id: string;
  type: ElType;
  x: number; // 0..1, centrumposition på arket
  y: number; // 0..1
  scale: number; // andel av arkets bredd
  text?: string;
  color?: string;
  url?: string; // object-URL för bild
  ar?: number; // bildens bredd/höjd
}

const TEXT_COLORS = ["#111114", "#00AEEF", "#FFDA00", "#FFFFFF", "#E5484D"];

let seq = 0;
const uid = () => `ark_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function ArkDesigner() {
  const { push } = useToast();
  const [format, setFormat] = useState<Format>("A4");
  const [elements, setElements] = useState<ArkElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [draftColor, setDraftColor] = useState(TEXT_COLORS[0]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    startPx: number;
    startPy: number;
    elemX: number;
    elemY: number;
    rectW: number;
    rectH: number;
  } | null>(null);

  const fmt = FORMATS[format];
  const selected = elements.find((e) => e.id === selectedId) ?? null;

  /* rensa object-URL:er när komponenten avmonteras */
  const urlsRef = useRef<string[]>([]);
  useEffect(() => {
    const urls = urlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  /* ---------- pris ---------- */
  const price = useMemo(() => {
    const elementsCost = elements.length * PER_ELEMENT;
    return fmt.base + elementsCost;
  }, [fmt.base, elements.length]);

  /* ---------- lägg till element ---------- */
  function addText() {
    const t = draft.trim();
    if (!t) return;
    const el: ArkElement = {
      id: uid(),
      type: "text",
      x: 0.5,
      y: 0.5,
      scale: 0.5,
      text: t,
      color: draftColor,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
    setDraft("");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    urlsRef.current.push(url);
    const img = new Image();
    img.onload = () => {
      const el: ArkElement = {
        id: uid(),
        type: "image",
        x: 0.5,
        y: 0.5,
        scale: 0.45,
        url,
        ar: img.naturalWidth / img.naturalHeight || 1,
      };
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
    };
    img.src = url;
    e.target.value = ""; // tillåt samma fil igen
  }

  function removeEl(id: string) {
    setElements((prev) => {
      const el = prev.find((x) => x.id === id);
      if (el?.url) {
        URL.revokeObjectURL(el.url);
        urlsRef.current = urlsRef.current.filter((u) => u !== el.url);
      }
      return prev.filter((x) => x.id !== id);
    });
    setSelectedId((s) => (s === id ? null : s));
  }

  function patch(id: string, p: Partial<ArkElement>) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...p } : e)));
  }

  /* ---------- drag (pointer events) ---------- */
  const onPointerDown = useCallback(
    (e: React.PointerEvent, el: ArkElement) => {
      e.stopPropagation();
      setSelectedId(el.id);
      const rect = sheetRef.current?.getBoundingClientRect();
      if (!rect) return;
      dragRef.current = {
        id: el.id,
        pointerId: e.pointerId,
        startPx: e.clientX,
        startPy: e.clientY,
        elemX: el.x,
        elemY: el.y,
        rectW: rect.width,
        rectH: rect.height,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = (e.clientX - d.startPx) / d.rectW;
    const dy = (e.clientY - d.startPy) / d.rectH;
    const nx = Math.min(1, Math.max(0, d.elemX + dx));
    const ny = Math.min(1, Math.max(0, d.elemY + dy));
    setElements((prev) =>
      prev.map((el) => (el.id === d.id ? { ...el, x: nx, y: ny } : el))
    );
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }, []);

  /* ---------- tangentbord: ta bort valt element ---------- */
  function onSheetKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
      e.preventDefault();
      removeEl(selectedId);
    }
  }

  function addToCart() {
    push({
      kind: "success",
      title: "Tillagt i varukorgen",
      msg: `${fmt.label}-ark · ${elements.length} element · ${price} kr`,
    });
  }

  /* ---------- render ---------- */
  const inX = (5 / fmt.w) * 100; // ~5 mm bleed i procent
  const inY = (5 / fmt.h) * 100;

  return (
    <>
      <PageHead
        index="ARK"
        title="Beställ tryck på ark"
        sub="Designa dina egna DTF-tryckark i A4 eller A3 — placera text och bilder fritt, se priset direkt och pressa hemma."
      />

      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_320px]">
        {/* VÄNSTER: verktyg + ark */}
        <div className="space-y-8">
          {/* format-toggle */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Format</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 rounded-full border border-line p-1">
                {(Object.keys(FORMATS) as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    aria-pressed={format === f}
                    className={`rounded-full px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                      format === f ? "bg-ink text-paper" : "text-muted hover:text-ink"
                    }`}
                  >
                    {FORMATS[f].label}
                  </button>
                ))}
              </div>
              <span className="spec text-[11px] text-muted">
                {fmt.w} × {fmt.h} mm · stående
              </span>
            </div>
          </section>

          {/* lägg till text / bild */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Lägg till</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addText();
                  }}
                  placeholder="Skriv text…"
                  className="field flex-1 min-w-[160px]"
                />
                <button
                  onClick={addText}
                  disabled={!draft.trim()}
                  className="btn btn-outline btn-sm"
                >
                  + Text
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="spec text-[10px] text-muted">Textfärg</span>
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraftColor(c)}
                    aria-label={`Färg ${c}`}
                    className={`h-6 w-6 rounded-full border-2 ${
                      draftColor === c ? "border-cyan" : "border-line"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="border-t border-line pt-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-outline btn-sm"
                >
                  ⬆ Ladda upp bild
                </button>
              </div>
            </div>
          </section>

          {/* ark-preview */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg uppercase">Ditt ark</h2>
              <span className="spec text-[11px] text-muted hidden sm:inline">
                Dra element · streckad linje = tryckyta
              </span>
            </div>
            <div className="flex justify-center rounded-[14px] border border-line bg-paper-2 p-4 sm:p-8">
              <div
                ref={sheetRef}
                tabIndex={0}
                onKeyDown={onSheetKeyDown}
                onPointerDown={() => setSelectedId(null)}
                className="relative w-full max-w-[380px] touch-none select-none bg-white shadow-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-cyan"
                style={{ aspectRatio: fmt.ratio }}
                role="group"
                aria-label={`Ark ${fmt.label}`}
              >
                {/* tryckyta / bleed-guide */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute border border-dashed border-cyan/60"
                  style={{
                    top: `${inY}%`,
                    bottom: `${inY}%`,
                    left: `${inX}%`,
                    right: `${inX}%`,
                  }}
                />
                {/* mm-etikett */}
                <span className="spec pointer-events-none absolute left-2 top-2 text-[9px] text-muted">
                  {fmt.w}×{fmt.h} mm
                </span>

                {elements.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                    <span className="spec text-[11px] text-muted-2">
                      Lägg till text eller bild — dra för att placera
                    </span>
                  </div>
                )}

                {elements.map((el) => {
                  const isSel = el.id === selectedId;
                  const common: React.CSSProperties = {
                    left: `${el.x * 100}%`,
                    top: `${el.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${el.scale * 100}%`,
                  };
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => onPointerDown(e, el)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      className={`absolute cursor-grab active:cursor-grabbing ${
                        isSel ? "outline outline-2 outline-cyan" : ""
                      }`}
                      style={common}
                    >
                      {el.type === "text" ? (
                        <span
                          className="block whitespace-nowrap text-center font-display uppercase leading-none"
                          style={{
                            color: el.color,
                            fontSize: `calc(${el.scale} * 60px)`,
                            textShadow:
                              el.color === "#FFFFFF"
                                ? "0 0 1px rgba(0,0,0,.4)"
                                : undefined,
                          }}
                        >
                          {el.text}
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={el.url}
                          alt=""
                          draggable={false}
                          className="pointer-events-none block w-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* kontroller för valt element */}
            {selected && (
              <div className="card mt-4 flex flex-wrap items-center gap-4 p-4">
                <span className="spec text-[11px] text-muted">
                  {selected.type === "text" ? "Text" : "Bild"} vald
                </span>
                <label className="flex flex-1 items-center gap-3 min-w-[180px]">
                  <span className="spec text-[10px] text-muted">Storlek</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={selected.scale}
                    onChange={(e) =>
                      patch(selected.id, { scale: Number(e.target.value) })
                    }
                    className="flex-1 accent-[var(--color-cyan)]"
                  />
                </label>
                <button
                  onClick={() => removeEl(selected.id)}
                  className="btn btn-ghost btn-sm text-bad"
                >
                  × Ta bort
                </button>
              </div>
            )}
          </section>

          {/* förklaring */}
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ChevronMark size={14} color="#00AEEF" />
              <h2 className="eyebrow">Vad är ett DTF-ark?</h2>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Du får färdiga tryckark att pressa på plagg hemma — med strykjärn
              eller värmepress. Placera flera motiv på samma ark för att utnyttja
              ytan maximalt (så kallad gang sheet). Perfekt för t-shirts,
              tygkassar, huvtröjor och mer.
            </p>
          </section>
        </div>

        {/* HÖGER: lager + pris */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* lager */}
          <div className="card p-5">
            <h2 className="eyebrow mb-3">Lager · {elements.length}</h2>
            {elements.length === 0 ? (
              <p className="spec text-[11px] text-muted">Inga element ännu.</p>
            ) : (
              <ul className="space-y-1">
                {elements.map((el, i) => (
                  <li key={el.id}>
                    <div
                      className={`flex items-center gap-2 rounded-[10px] border px-2 py-1.5 text-sm ${
                        el.id === selectedId
                          ? "border-cyan bg-cyan/5"
                          : "border-line"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedId(el.id)}
                        className="flex flex-1 items-center gap-2 truncate text-left"
                      >
                        <span className="spec text-[10px] text-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {el.type === "text" ? (
                          <span className="truncate">
                            <span aria-hidden>T </span>
                            {el.text}
                          </span>
                        ) : (
                          <span className="truncate">▣ Bild</span>
                        )}
                      </button>
                      <button
                        onClick={() => removeEl(el.id)}
                        className="text-muted hover:text-bad"
                        aria-label="Ta bort"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* pris */}
          <div className="card p-5">
            <h2 className="eyebrow mb-3">Pris</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{fmt.label}-ark (grundpris)</span>
                <span className="tabular-nums">{fmt.base} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">
                  Element × {elements.length} (à {PER_ELEMENT} kr)
                </span>
                <span className="tabular-nums">
                  {elements.length * PER_ELEMENT} kr
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
              <div>
                <span className="eyebrow">Totalt</span>
                <p className="spec text-[11px] text-muted">Inkl. moms · per ark</p>
              </div>
              <PriceDisplay value={price} size="lg" />
            </div>
            <button
              onClick={addToCart}
              className="btn btn-primary mt-4 w-full"
            >
              Lägg i varukorg <span aria-hidden>→</span>
            </button>
            <p className="mt-3 spec text-[10px] text-muted">
              Grundpris {FORMATS.A4.base} kr (A4) / {FORMATS.A3.base} kr (A3) +{" "}
              {PER_ELEMENT} kr per motiv.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
