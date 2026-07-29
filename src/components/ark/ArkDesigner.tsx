"use client";

// Tryck på ark — byggd enligt gang sheet-mönstret från branschledarna
// (Ninja Transfers, ShirtSpace m.fl.): ladda upp motiv, ange storlek och antal
// kopior, så packar vi arket automatiskt. Ingen manuell placering behövs.
// Beställningen skickas som förfrågan (lead) — betalning sker efter bekräftelse.

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHead } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useToast } from "@/components/ui/Toast";
import { evaluateQuality } from "@/lib/dpi";
import { CHAR_W } from "@/lib/text";

/* ---------- format & pris ---------- */

type Format = "A4" | "A3";

const FORMATS: Record<Format, { label: string; w: number; h: number; base: number }> = {
  A4: { label: "A4", w: 21, h: 29.7, base: 99 },
  A3: { label: "A3", w: 29.7, h: 42, base: 149 },
};

const MARGIN_CM = 0.5; // kant runt arket
const GAP_CM = 0.4; // luft mellan motiv (klippmarginal)

/* ---------- motiv-modell ---------- */

interface ArkItem {
  id: string;
  type: "image" | "text";
  url?: string; // object-URL (förhandsvisning)
  naturalW?: number;
  naturalH?: number;
  text?: string;
  color?: string;
  ar: number; // bredd/höjd
  wcm: number; // bredd per kopia i cm
  copies: number;
}

interface Placed {
  item: ArkItem;
  x: number; // cm från arkets vänsterkant
  y: number;
  w: number;
  h: number;
}

const TEXT_COLORS = ["#111114", "#00AEEF", "#FFDA00", "#FFFFFF", "#E5484D"];

let seq = 0;
const uid = () => `ark_${Date.now().toString(36)}_${(seq++).toString(36)}`;

/* Shelf-packning (samma princip som produktionens gang sheet-packare):
   sortera på höjd, fyll rad för rad, nytt ark när höjden tar slut. */
function packSheets(items: ArkItem[], fmt: { w: number; h: number }) {
  const innerW = fmt.w - MARGIN_CM * 2;
  const innerH = fmt.h - MARGIN_CM * 2;
  const rects: { item: ArkItem; w: number; h: number }[] = [];
  for (const it of items) {
    const w = Math.min(it.wcm, innerW);
    const h = w / it.ar;
    for (let i = 0; i < it.copies; i++) rects.push({ item: it, w, h: Math.min(h, innerH) });
  }
  rects.sort((a, b) => b.h - a.h);

  const sheets: Placed[][] = [];
  let cur: Placed[] = [];
  let x = 0;
  let y = 0;
  let shelfH = 0;
  const newSheet = () => {
    if (cur.length) sheets.push(cur);
    cur = [];
    x = 0;
    y = 0;
    shelfH = 0;
  };
  for (const r of rects) {
    if (x + r.w > innerW) {
      x = 0;
      y += shelfH + GAP_CM;
      shelfH = 0;
    }
    if (y + r.h > innerH) newSheet();
    cur.push({ item: r.item, x: MARGIN_CM + x, y: MARGIN_CM + y, w: r.w, h: r.h });
    x += r.w + GAP_CM;
    shelfH = Math.max(shelfH, r.h);
  }
  if (cur.length) sheets.push(cur);
  if (sheets.length === 0) sheets.push([]);

  const used = rects.reduce((s, r) => s + r.w * r.h, 0);
  const fill = Math.min(1, used / (innerW * innerH * sheets.length));
  return { sheets, fill };
}

export function ArkDesigner() {
  const { push } = useToast();
  const [format, setFormat] = useState<Format>("A4");
  const [items, setItems] = useState<ArkItem[]>([]);
  const [draft, setDraft] = useState("");
  const [draftColor, setDraftColor] = useState(TEXT_COLORS[0]);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = FORMATS[format];

  const urlsRef = useRef<string[]>([]);
  useEffect(() => {
    const urls = urlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const { sheets, fill } = useMemo(() => packSheets(items, fmt), [items, fmt]);
  const sheetCount = items.length ? sheets.length : 1;
  const price = sheetCount * fmt.base;
  const totalCopies = items.reduce((s, i) => s + i.copies, 0);

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      const img = new Image();
      img.onload = () => {
        const ar = img.naturalWidth / img.naturalHeight || 1;
        setItems((prev) => [
          ...prev,
          {
            id: uid(),
            type: "image",
            url,
            naturalW: img.naturalWidth,
            naturalH: img.naturalHeight,
            ar,
            wcm: Math.min(8, fmt.w - MARGIN_CM * 2),
            copies: 1,
          },
        ]);
      };
      img.src = url;
    });
  }

  function addText() {
    const t = draft.trim();
    if (!t) return;
    const ar = Math.max(0.2, t.length * CHAR_W); // bredd/höjd för en textrad
    setItems((prev) => [
      ...prev,
      { id: uid(), type: "text", text: t, color: draftColor, ar, wcm: 10, copies: 1 },
    ]);
    setDraft("");
  }

  function patch(id: string, p: Partial<ArkItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }
  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.url) {
        URL.revokeObjectURL(it.url);
        urlsRef.current = urlsRef.current.filter((u) => u !== it.url);
      }
      return prev.filter((x) => x.id !== id);
    });
  }

  async function sendRequest() {
    if (!items.length) {
      push({ kind: "warn", title: "Tomt ark", msg: "Lägg till minst ett motiv först." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailErr("Fyll i en giltig e-postadress");
      return;
    }
    setEmailErr(null);
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          garmentId: `ark-${format.toLowerCase()}`,
          qty: sheetCount,
          estimate: price,
          payload: {
            typ: "tryckark",
            format,
            antalArk: sheetCount,
            fyllnadsgrad: Math.round(fill * 100),
            motiv: items.map((i) => ({
              typ: i.type,
              text: i.text,
              bredd_cm: Math.round(i.wcm * 10) / 10,
              hojd_cm: Math.round((i.wcm / i.ar) * 10) / 10,
              kopior: i.copies,
              bildfil: i.type === "image" ? `${i.naturalW}×${i.naturalH}px` : undefined,
            })),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error();
      setSent(email.trim());
    } catch {
      push({ kind: "error", title: "Kunde inte skicka", msg: "Försök igen om en stund." });
    } finally {
      setSending(false);
    }
  }

  /* ---------- render ---------- */

  return (
    <>
      <PageHead
        index="ARK"
        title="Beställ tryck på ark"
        sub="Ladda upp dina motiv, välj storlek och antal — vi packar arket automatiskt och du pressar hemma. DTF-transfers i A4 eller A3."
      />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
        {/* så funkar det */}
        <ol className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            ["Ladda upp", "Bilder (PNG/JPG) eller text — flera motiv på samma ark."],
            ["Vi packar arket", "Motiven läggs automatiskt så tätt som möjligt."],
            ["Pressa hemma", "Du får färdiga DTF-transfers att värmepressa på plagg."],
          ].map(([t, d], i) => (
            <li key={t} className="card flex items-start gap-3 p-4">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-signal font-display text-sm text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-display text-sm uppercase">{t}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* VÄNSTER: motiv */}
          <div className="space-y-6">
            {/* format */}
            <section className="card p-5">
              <h2 className="eyebrow mb-3">Arkformat</h2>
              <div className="flex flex-wrap items-center gap-2">
                {(Object.keys(FORMATS) as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-[10px] border-2 px-4 py-2.5 font-display text-sm uppercase transition-colors ${
                      format === f ? "border-signal bg-signal/10" : "border-line hover:border-muted"
                    }`}
                  >
                    {f} · {kr0(FORMATS[f].base)}
                  </button>
                ))}
                <span className="spec ml-1 text-[10px] text-muted">
                  {fmt.w} × {fmt.h} cm
                </span>
              </div>
            </section>

            {/* ladda upp / text */}
            <section className="card p-5">
              <h2 className="eyebrow mb-3">Dina motiv</h2>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFiles(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                className="crop-frame flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[3px] border-2 border-dashed border-line p-6 text-center transition-colors hover:border-muted"
              >
                <span className="text-2xl">↥</span>
                <p className="font-display text-sm uppercase">Släpp bilder här — eller klicka</p>
                <p className="spec text-[10px] text-muted">PNG · JPG · flera filer samtidigt</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              <div className="mt-4 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addText()}
                  placeholder="…eller skriv en text"
                  className="field flex-1"
                />
                <div className="flex items-center gap-1">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraftColor(c)}
                      aria-label={c}
                      className={`h-6 w-6 rounded-full border-2 ${
                        draftColor === c ? "border-signal" : "border-line"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <button onClick={addText} disabled={!draft.trim()} className="btn btn-outline btn-sm">
                  + Text
                </button>
              </div>

              {/* motivlista */}
              {items.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {items.map((it) => {
                    const hcm = it.wcm / it.ar;
                    const q =
                      it.type === "image" && it.naturalW && it.naturalH
                        ? evaluateQuality(it.naturalW, it.naturalH, it.wcm, hcm)
                        : null;
                    return (
                      <li key={it.id} className="rounded-[10px] border border-line p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-[3px] border border-line bg-paper-2">
                            {it.type === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={it.url} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <span
                                className="font-display text-[10px] uppercase leading-none"
                                style={{ color: it.color }}
                              >
                                {(it.text ?? "").slice(0, 6)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">
                              {it.type === "image" ? "Bild" : `”${it.text}”`}
                              <span className="spec ml-2 text-[10px] text-muted">
                                {Math.round(it.wcm * 10) / 10} × {Math.round(hcm * 10) / 10} cm
                              </span>
                            </p>
                            {q && (
                              <p className="spec mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    background:
                                      q.level === "good"
                                        ? "var(--color-good)"
                                        : q.level === "warn"
                                        ? "var(--color-warn)"
                                        : "var(--color-bad)",
                                  }}
                                />
                                {q.level === "good"
                                  ? "Skarpt tryck"
                                  : q.level === "warn"
                                  ? "Okej — kan bli lite mjukt"
                                  : `Suddigt — max ${Math.round(q.maxWidthCm * 10) / 10} cm för skarpt`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(it.id)}
                            className="text-muted hover:text-bad"
                            title="Ta bort motiv"
                            aria-label="Ta bort motiv"
                          >
                            ×
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="flex justify-between spec text-[10px] text-muted">
                              <span>Bredd</span>
                              <span>{Math.round(it.wcm * 10) / 10} cm</span>
                            </span>
                            <input
                              type="range"
                              min={2}
                              max={Math.min(20, fmt.w - MARGIN_CM * 2)}
                              step={0.5}
                              value={it.wcm}
                              onChange={(e) => patch(it.id, { wcm: Number(e.target.value) })}
                              className="brand mt-1 w-full"
                            />
                          </label>
                          <div>
                            <span className="spec block text-[10px] text-muted">Antal kopior</span>
                            <div className="mt-1 flex items-stretch gap-1.5">
                              <button
                                onClick={() => patch(it.id, { copies: Math.max(1, it.copies - 1) })}
                                className="btn btn-outline btn-sm w-10"
                              >
                                −
                              </button>
                              <span className="flex min-w-[44px] items-center justify-center rounded-[3px] border border-line font-display">
                                {it.copies}
                              </span>
                              <button
                                onClick={() => patch(it.id, { copies: Math.min(99, it.copies + 1) })}
                                className="btn btn-outline btn-sm w-10"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* förhandsvisning */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="head text-lg">
                  Ditt ark {sheetCount > 1 ? `(${sheetCount} st)` : ""}
                </h2>
                {items.length > 0 && (
                  <span className="spec text-[11px] text-muted">
                    {totalCopies} tryck · {Math.round(fill * 100)} % fyllt
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {sheets.map((placed, si) => (
                  <div key={si} className="relative">
                    <span className="spec absolute -top-2 left-2 z-10 bg-paper px-1 text-[9px] text-muted">
                      {fmt.label} · ark {si + 1}
                    </span>
                    <div
                      className="relative w-full overflow-hidden rounded-[3px] border border-line bg-white shadow-sm"
                      style={{ aspectRatio: `${fmt.w} / ${fmt.h}` }}
                    >
                      {/* tryckyta (streckad) */}
                      <div
                        className="pointer-events-none absolute border border-dashed border-line"
                        style={{
                          left: pct(MARGIN_CM / fmt.w),
                          top: pct(MARGIN_CM / fmt.h),
                          right: pct(MARGIN_CM / fmt.w),
                          bottom: pct(MARGIN_CM / fmt.h),
                        }}
                      />
                      {placed.map((p, i) => (
                        <div
                          key={i}
                          className="absolute flex items-center justify-center"
                          style={{
                            left: pct(p.x / fmt.w),
                            top: pct(p.y / fmt.h),
                            width: pct(p.w / fmt.w),
                            height: pct(p.h / fmt.h),
                          }}
                        >
                          {p.item.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.item.url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <svg viewBox={`0 0 ${p.item.ar * 100} 100`} className="h-full w-full">
                              <text
                                x="50%"
                                y="52%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="Anton, Oswald, sans-serif"
                                fontSize={86}
                                fill={p.item.color}
                                stroke={p.item.color === "#FFFFFF" ? "#d0d0d0" : "none"}
                                strokeWidth={p.item.color === "#FFFFFF" ? 1 : 0}
                              >
                                {p.item.text}
                              </text>
                            </svg>
                          )}
                        </div>
                      ))}
                      {items.length === 0 && (
                        <p className="absolute inset-0 flex items-center justify-center spec text-[11px] text-muted">
                          Ladda upp motiv så packar vi arket
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* HÖGER: pris + förfrågan */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <h2 className="eyebrow mb-3">Pris</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">
                    {fmt.label}-ark × {sheetCount}
                  </span>
                  <span className="tabular-nums">{kr0(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Motiv & kopior</span>
                  <span className="tabular-nums">ingår</span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
                <span className="eyebrow">Inkl. moms</span>
                <PriceDisplay value={price} size="lg" />
              </div>

              {sent ? (
                <div className="mt-4 rounded-[10px] border border-good bg-good/10 p-4 text-sm">
                  <p className="font-display uppercase">Förfrågan skickad ✓</p>
                  <p className="mt-1 leading-snug text-ink/80">
                    Vi återkommer till <strong>{sent}</strong> med bekräftelse och
                    hur du skickar originalfilerna. Du betalar först när allt är
                    godkänt.
                  </p>
                </div>
              ) : (
                <>
                  <label className="mt-4 block">
                    <span className="eyebrow mb-1 block">Din e-post</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailErr(null);
                      }}
                      placeholder="namn@exempel.se"
                      className="field"
                      style={emailErr ? { borderColor: "var(--color-bad)" } : undefined}
                    />
                    {emailErr && (
                      <span className="mt-1 block text-[12px] text-bad">⚠ {emailErr}</span>
                    )}
                  </label>
                  <button
                    onClick={sendRequest}
                    disabled={sending}
                    className="btn btn-primary mt-3 w-full"
                  >
                    {sending ? "Skickar…" : "Skicka förfrågan →"}
                  </button>
                  <p className="mt-3 spec text-[10px] text-muted">
                    Ingen betalning nu — vi bekräftar via mejl, du godkänner och
                    betalar när arket är klart. Originalfiler skickas efter
                    bekräftelsen.
                  </p>
                </>
              )}
            </div>
            <p className="mt-3 flex items-center gap-2 spec text-[11px] text-muted">
              <ChevronMark size={14} color="#00AEEF" /> Tips: fyll arket — priset är
              per ark, inte per motiv.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}

function pct(n: number): string {
  return `${n * 100}%`;
}
function kr0(n: number): string {
  return `${n} kr`;
}
