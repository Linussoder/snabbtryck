"use client";

// Enkelt läge — guidat trestegsflöde (Välj plagg → Designa → Beställ) byggt för
// att vem som helst ska kunna designa en tröja utan förkunskaper. Avancerat
// läge (EditorShell:s flikar) nås via växlingen i headern eller erbjudandet i
// beställningssteget. Båda lägena delar samma editor-store → förlustfri växling.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, usePrice, DesignElement, TextEl, ImageEl } from "@/lib/store";
import { GARMENTS } from "@/lib/garments";
import {
  getPlacements,
  applyPlacement,
  isPlacementActive,
  clampToArea,
  maxWidthInArea,
} from "@/lib/placements";
import { DESIGN_FONTS } from "@/lib/fonts";
import { evaluateQuality } from "@/lib/dpi";
import { lowContrast } from "@/lib/contrast";
import { removeBackground } from "@/lib/bgremove";
import { textAspect } from "@/lib/text";
import { kr, cm, pct } from "@/lib/format";
import { nextTier } from "@/lib/pricing";
import { setCart } from "@/lib/account";
import { DesignCanvas } from "./DesignCanvas";
import { useSaveDesign } from "./useSaveDesign";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { GarmentPreview } from "@/components/ui/GarmentPreview";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { withOverride, isGarmentActive, garmentStock } from "@/lib/settings";

const STEPS = ["Välj plagg", "Designa", "Beställ"];
const FEATURED = ["tshirt", "hoodie"];
const INTRO_KEY = "snabbtryck.intro.v1";

// Kurerat typsnittsurval (hela listan finns i avancerat läge).
const SIMPLE_FONT_NAMES = ["Oswald", "Anton", "Bebas Neue", "Bangers", "Pacifico", "Caveat"];
const SIMPLE_FONTS = DESIGN_FONTS.filter((f) => SIMPLE_FONT_NAMES.includes(f.name));

const SWATCHES = [
  "#ffffff", "#111114", "#ffda00", "#00aeef", "#ec008c",
  "#1f8a5b", "#1c2a44", "#b3122b", "#d8cbb2", "#57564f",
];

export function SimpleEditor({ onAdvanced }: { onAdvanced: () => void }) {
  const router = useRouter();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [intro, setIntro] = useState(false);

  const elements = useEditor((s) => s.elements);
  const setView = useEditor((s) => s.setView);
  const undo = useEditor((s) => s.undo);
  const canUndo = useEditor((s) => s.past.length > 0);
  const qty = useEditor((s) => s.qty);
  const serialize = useEditor((s) => s.serialize);
  const price = usePrice();
  const { profile } = useAuth();
  const business = profile?.business ?? false;

  const frontEls = elements.filter((e) => e.view === "front");

  // Enkelt läge arbetar alltid mot framsidan.
  useEffect(() => {
    setView("front");
    try {
      if (!localStorage.getItem(INTRO_KEY)) setIntro(true);
    } catch {
      /* localStorage otillgängligt — hoppa över guiden */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeIntro() {
    setIntro(false);
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignorera */
    }
  }

  function addToCart() {
    if (!useEditor.getState().elements.length) {
      push({ kind: "warn", title: "Tom design", msg: "Lägg till minst ett tryck först." });
      return;
    }
    setCart({ design: serialize(), qty });
    router.push("/kassa");
  }

  return (
    <>
      {/* topprad: steg + trygghet */}
      <header className="flex h-14 flex-none items-center gap-3 border-b border-line px-3 md:px-6">
        <div className="w-full max-w-sm">
          <StepIndicator steps={STEPS} current={step} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="spec hidden text-[10px] text-muted md:inline" title="Ditt utkast sparas automatiskt i webbläsaren">
            Sparas automatiskt ✓
          </span>
          {step === 1 && (
            <button
              onClick={undo}
              disabled={!canUndo}
              className="btn btn-outline btn-sm disabled:opacity-40"
              title="Ångra senaste ändring"
            >
              ↺ Ångra
            </button>
          )}
          <button
            onClick={onAdvanced}
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
            title="Fler texter/bilder, tryck på ryggen, lager m.m."
          >
            Avancerat »
          </button>
        </div>
      </header>

      {/* steginnehåll */}
      <div className="min-h-0 flex-1 overflow-y-auto thin-scroll bg-paper-2 grid-field">
        {step === 0 && <StepGarment />}
        {step === 1 && <StepDesign />}
        {step === 2 && <StepOrder onAdvanced={onAdvanced} />}
      </div>

      {/* botten: pris + nästa steg */}
      <footer className="flex flex-none items-center gap-3 border-t border-line bg-paper px-3 py-3 md:px-6">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn btn-ghost">
            ← Tillbaka
          </button>
        )}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="eyebrow leading-none">{business ? "Totalt exkl. moms" : "Totalt"}</p>
            <PriceDisplay
              value={Math.round(business ? price.subtotalExclVat : price.subtotalInclVat)}
              size="sm"
            />
          </div>
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && frontEls.length === 0}
              className="btn btn-primary disabled:opacity-40"
              title={step === 1 && frontEls.length === 0 ? "Lägg till en bild eller text först" : undefined}
            >
              {step === 0 ? "Nästa: Designa →" : "Nästa: Beställ →"}
            </button>
          ) : (
            <button onClick={addToCart} className="btn btn-primary">
              {business ? "Begär offert →" : "Lägg i varukorg →"}
            </button>
          )}
        </div>
      </footer>

      {intro && <IntroOverlay onClose={closeIntro} />}
    </>
  );
}

/* ---------------------------------------------------------------- steg 1 */

function StepGarment() {
  const { products } = useSettings();
  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const setGarment = useEditor((s) => s.setGarment);
  const setColor = useEditor((s) => s.setColor);
  const [showAll, setShowAll] = useState(false);
  const color = garment.colors[colorIndex] ?? garment.colors[0];

  const active = GARMENTS.filter((g) => isGarmentActive(products, g.id));
  const featured = active.filter((g) => FEATURED.includes(g.id));
  const rest = active.filter((g) => !FEATURED.includes(g.id));
  // Visa alltid ett redan valt "övrigt" plagg (t.ex. återöppnat utkast).
  const shown = showAll
    ? [...featured, ...rest]
    : [...featured, ...rest.filter((g) => g.id === garment.id)];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-4 pb-8 md:p-8">
      <div>
        <h1 className="font-display text-2xl uppercase md:text-3xl">Vad vill du trycka på?</h1>
        <p className="mt-1 text-sm text-muted">
          Välj plagg och färg. Storlek och antal väljer du i sista steget.
        </p>
      </div>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((g) => {
            const isActive = g.id === garment.id;
            const stock = garmentStock(products, g.id);
            const soldOut = stock === "out";
            return (
              <button
                key={g.id}
                onClick={() => !soldOut && setGarment(g.id)}
                disabled={soldOut}
                className={`group relative overflow-hidden rounded-[10px] border-2 bg-paper text-left transition-colors ${
                  isActive ? "border-signal ring-1 ring-signal" : "border-line hover:border-muted"
                } ${soldOut ? "cursor-not-allowed opacity-55" : ""}`}
              >
                <div className="aspect-square w-full overflow-hidden bg-white">
                  <GarmentImage
                    shape={g.shape}
                    view="front"
                    color={isActive ? color.hex : g.colors[0].hex}
                    dark={isActive ? color.dark : g.colors[0].dark}
                    alt={g.name}
                  />
                </div>
                {isActive && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-signal text-sm text-white">
                    ✓
                  </span>
                )}
                {stock !== "in_stock" && (
                  <span
                    className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 spec text-[8px] uppercase ${
                      stock === "out"
                        ? "bg-ink text-paper"
                        : stock === "backorder"
                        ? "bg-cyan text-white"
                        : "bg-warn/90 text-ink"
                    }`}
                  >
                    {stock === "out" ? "Slut" : stock === "backorder" ? "10–15 dgr" : "Få kvar"}
                  </span>
                )}
                <div className="px-2 py-2 text-center">
                  <span className="block font-display text-sm uppercase leading-tight">{g.name}</span>
                  <span className="spec block text-[10px] text-muted">
                    från {kr(withOverride(g, products).basePrice)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {!showAll && rest.length > 0 && (
          <button onClick={() => setShowAll(true)} className="btn btn-outline mt-3 w-full">
            Visa fler plagg ({rest.length}) ↓
          </button>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-2">Färg — {color.name}</h2>
        <div className="flex flex-wrap gap-2.5">
          {garment.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setColor(i)}
              title={c.name}
              aria-label={c.name}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${
                i === colorIndex ? "border-signal" : "border-line"
              }`}
              style={{ background: c.hex }}
            >
              {i === colorIndex && (
                <span className={c.dark ? "text-white" : "text-ink"}>✓</span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- steg 2 */

function StepDesign() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();
  const addImage = useEditor((s) => s.addImage);
  const addText = useEditor((s) => s.addText);
  const elements = useEditor((s) => s.elements);
  const selectedRaw = useEditor((s) => s.selected());

  const frontEls = elements.filter((e) => e.view === "front");
  const sel = selectedRaw && selectedRaw.view === "front" ? selectedRaw : null;

  // Nya element ska aldrig börja utanför tryckytan — kapa och flytta in dem.
  function fitNewElement() {
    const s = useEditor.getState();
    const el = s.selected();
    const area = s.garment().areas.find((a) => a.key === "front");
    if (!el || !area) return;
    const w = Math.min(el.w, maxWidthInArea(area, el.ar));
    s.updateEl(el.id, { w, ...clampToArea(el.x, el.y, w, el.ar, area) });
  }

  function addFittedText() {
    addText("DIN TEXT");
    fitNewElement();
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      push({ kind: "error", title: "Fel filtyp", msg: "Ladda upp en bild (PNG/JPG/SVG)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        addImage(src, img.naturalWidth, img.naturalHeight);
        fitNewElement();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 p-3 md:grid-cols-[minmax(0,1fr)_340px] md:p-6">
      {/* canvas */}
      <div className="relative">
        <div className="relative mx-auto aspect-square w-full max-w-[560px]">
          <DesignCanvas simple />

          {/* tom design → två stora startknappar */}
          {frontEls.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex w-full max-w-[260px] flex-col gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-primary h-14 w-full text-base shadow-lg"
                >
                  📷 Lägg till din bild
                </button>
                <button
                  onClick={addFittedText}
                  className="btn h-14 w-full border-2 border-ink bg-paper text-base shadow-lg hover:bg-paper-2"
                >
                  ✏️ Skriv din text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* panel */}
      <div className="space-y-3 pb-6">
        {frontEls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm">
              + Bild
            </button>
            <button onClick={addFittedText} className="btn btn-outline btn-sm">
              + Text
            </button>
          </div>
        )}

        {sel ? (
          <SelectedPanel el={sel} />
        ) : frontEls.length > 0 ? (
          <p className="spec rounded-[3px] border border-dashed border-line bg-paper p-4 text-center text-[11px] text-muted">
            Tryck på din bild eller text på tröjan för att ändra den.
          </p>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SelectedPanel({ el }: { el: DesignElement }) {
  const garment = useEditor((s) => s.garment());
  const updateEl = useEditor((s) => s.updateEl);
  const removeEl = useEditor((s) => s.removeEl);
  const select = useEditor((s) => s.select);

  const area = garment.areas.find((a) => a.key === "front");
  const maxW = area ? maxWidthInArea(area, el.ar) : 1;

  function setWidth(w: number) {
    if (!area) {
      updateEl(el.id, { w });
      return;
    }
    const ww = Math.min(Math.max(w, 0.06), maxW);
    updateEl(el.id, { w: ww, ...clampToArea(el.x, el.y, ww, el.ar, area) });
  }

  function center() {
    if (!area) return;
    updateEl(el.id, {
      x: area.x + area.w / 2,
      y: area.y + area.h / 2,
    });
  }

  return (
    <div className="space-y-5 rounded-[10px] border border-line bg-paper p-4">
      {el.type === "text" && <SimpleTextControls el={el} />}
      {el.type === "image" && <SimpleImageControls el={el} />}

      {/* placering */}
      <section>
        <h3 className="eyebrow mb-2">Var på plagget?</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {getPlacements(garment, "front").map((p) => {
            const active = isPlacementActive(p, garment, el);
            return (
              <button
                key={p.id}
                onClick={() => {
                  const a = applyPlacement(p, garment, el.ar);
                  if (a) updateEl(el.id, { x: a.x, y: a.y, w: a.w, view: a.view });
                }}
                className={`rounded-[3px] border px-2 py-2.5 font-display text-[12px] uppercase leading-tight transition-colors ${
                  active ? "border-signal bg-signal/10 text-ink" : "border-line hover:border-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* storlek */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="eyebrow">Storlek på trycket</h3>
          <span className="spec text-[10px] text-muted">{cm(el.w * garment.printRefWidthCm)} bred</span>
        </div>
        <input
          type="range"
          min={0.06}
          max={maxW}
          step={0.005}
          value={Math.min(el.w, maxW)}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="brand w-full"
          aria-label="Storlek på trycket"
        />
        <div className="mt-1 flex justify-between spec text-[9px] text-muted-2">
          <span>Mindre</span>
          <span>Större</span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={center} className="btn btn-outline btn-sm">
          ◎ Centrera
        </button>
        <button
          onClick={() => {
            removeEl(el.id);
            select(null);
          }}
          className="btn btn-ghost btn-sm"
        >
          🗑 Ta bort
        </button>
      </div>
    </div>
  );
}

function SimpleTextControls({ el }: { el: TextEl }) {
  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const updateEl = useEditor((s) => s.updateEl);
  const garmentColor = garment.colors[colorIndex] ?? garment.colors[0];

  function patch(p: Partial<TextEl>) {
    const next = { ...el, ...p };
    updateEl(el.id, { ...p, ar: textAspect(next.text, next.lineHeight) });
  }

  const badContrast = lowContrast(el.color, garmentColor.hex);
  const suggestions = SWATCHES.filter((c) => !lowContrast(c, garmentColor.hex)).slice(0, 4);

  return (
    <>
      <section>
        <h3 className="eyebrow mb-2">Din text</h3>
        <textarea
          value={el.text}
          onChange={(e) => patch({ text: e.target.value })}
          rows={2}
          className="field resize-none font-display text-lg uppercase"
          autoFocus
        />
      </section>

      <section>
        <h3 className="eyebrow mb-2">Stil</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {SIMPLE_FONTS.map((f) => {
            const active = f.name === el.font;
            return (
              <button
                key={f.name}
                onClick={() => patch({ font: f.name })}
                className={`flex h-12 items-center justify-center overflow-hidden rounded-[3px] border px-2 transition-colors ${
                  active ? "border-signal bg-signal/5" : "border-line hover:border-muted"
                }`}
                style={{ fontFamily: `${f.family}, sans-serif` }}
                title={f.name}
              >
                <span className="truncate text-xl leading-none">
                  {el.text.split("\n")[0].slice(0, 9) || f.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="eyebrow mb-2">Färg</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => patch({ color: c })}
              aria-label={c}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                el.color.toLowerCase() === c ? "border-signal" : "border-line"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
        {badContrast && (
          <div className="mt-2 rounded-[3px] border border-warn bg-warn/10 p-2.5">
            <p className="text-[12px] leading-snug text-ink/80">
              ⚠ Den här färgen syns knappt på plagget — prova en av dessa:
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {suggestions.map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ color: c })}
                  aria-label={`Byt till ${c}`}
                  className="h-7 w-7 rounded-full border-2 border-line transition-transform hover:scale-110"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function SimpleImageControls({ el }: { el: ImageEl }) {
  const { push } = useToast();
  const garment = useEditor((s) => s.garment());
  const updateEl = useEditor((s) => s.updateEl);
  const [bgLoad, setBgLoad] = useState(false);

  const wcm = el.w * garment.printRefWidthCm;
  const q = evaluateQuality(el.naturalW, el.naturalH, wcm, wcm * el.ar);
  const area = garment.areas.find((a) => a.key === "front");

  // "Gör lagom stor" — krymp till största bredd som fortfarande blir skarp.
  const fitW = area
    ? Math.min(q.maxWidthCm / garment.printRefWidthCm, maxWidthInArea(area, el.ar))
    : q.maxWidthCm / garment.printRefWidthCm;
  const canFit = q.level !== "good" && fitW >= 0.06;

  function makeSharp() {
    if (!area) return;
    updateEl(el.id, { w: fitW, ...clampToArea(el.x, el.y, fitW, el.ar, area) });
  }

  async function removeBg() {
    setBgLoad(true);
    try {
      const after = await removeBackground(el.src);
      updateEl(el.id, { src: after, bgRemoved: true });
      push({ kind: "success", title: "Bakgrund borttagen", msg: "Blev det fel? Tryck ↺ Ångra." });
    } catch {
      push({ kind: "error", title: "Kunde inte ta bort bakgrunden" });
    } finally {
      setBgLoad(false);
    }
  }

  const cfg =
    q.level === "good" ? "var(--color-good)" : q.level === "warn" ? "var(--color-warn)" : "var(--color-bad)";

  return (
    <>
      {/* kvalitets-trafikljus i klarspråk */}
      <section className="rounded-[3px] border p-3" style={{ borderColor: cfg }}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-none rounded-full" style={{ background: cfg }} />
          <p className="text-[13px] leading-snug">
            {q.level === "good"
              ? "Skarp bild — blir snyggt i tryck!"
              : q.level === "warn"
              ? "Helt okej — kan bli lite mjuk i kanterna så här stor."
              : "Bilden blir suddig så här stor."}
          </p>
        </div>
        {canFit && (
          <button onClick={makeSharp} className="btn btn-outline btn-sm mt-2 w-full">
            Gör lagom stor ({cm(fitW * garment.printRefWidthCm)})
          </button>
        )}
        {q.level !== "good" && !canFit && (
          <p className="spec mt-2 text-[10px] text-muted">
            Tips: välj en större eller skarpare bildfil för bästa resultat.
          </p>
        )}
      </section>

      <section>
        <button onClick={removeBg} disabled={bgLoad} className="btn btn-outline btn-sm w-full">
          {bgLoad ? "Bearbetar…" : el.bgRemoved ? "✨ Ta bort bakgrund igen" : "✨ Ta bort bakgrund"}
        </button>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- steg 3 */

function StepOrder({ onAdvanced }: { onAdvanced: () => void }) {
  const { push } = useToast();
  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const size = useEditor((s) => s.size);
  const setSize = useEditor((s) => s.setSize);
  const qty = useEditor((s) => s.qty);
  const setQty = useEditor((s) => s.setQty);
  const serialize = useEditor((s) => s.serialize);
  const price = usePrice();
  const { profile } = useAuth();
  const business = profile?.business ?? false;
  const save = useSaveDesign();
  const [saving, setSaving] = useState(false);

  const color = garment.colors[colorIndex] ?? garment.colors[0];
  const next = nextTier(qty);

  async function onSave() {
    setSaving(true);
    try {
      await save();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 p-4 pb-8 md:grid-cols-2 md:p-8">
      {/* förhandsvisning */}
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-[10px] border border-line bg-white">
          <GarmentPreview design={serialize()} view="front" />
        </div>
        <p className="text-center text-sm text-muted">
          {garment.name} · {color.name}
        </p>
        <button onClick={onSave} disabled={saving} className="btn btn-ghost btn-sm w-full">
          {saving ? "Sparar…" : "💾 Spara designen till senare"}
        </button>
      </div>

      {/* val + pris */}
      <div className="space-y-6">
        <section>
          <h2 className="eyebrow mb-2">Storlek</h2>
          <div className="flex flex-wrap gap-1.5">
            {garment.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-[46px] rounded-[10px] border px-3 py-2.5 font-display text-sm uppercase transition-colors ${
                  s === size ? "border-ink bg-ink text-paper" : "border-line hover:border-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="eyebrow">Antal</h2>
            {price.discountPct > 0 && (
              <span className="rounded-full bg-signal px-2 py-0.5 spec text-[10px] text-white">
                −{pct(price.discountPct)} mängdrabatt
              </span>
            )}
          </div>
          <div className="flex items-stretch gap-2">
            <button onClick={() => setQty(qty - 1)} className="btn btn-outline h-12 w-14 text-xl">
              −
            </button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
              className="field w-full text-center font-display text-xl"
              aria-label="Antal"
            />
            <button onClick={() => setQty(qty + 1)} className="btn btn-outline h-12 w-14 text-xl">
              +
            </button>
          </div>
          {next && (
            <p className="spec mt-2 text-[11px] text-muted">
              Beställ {next.min - qty} st till → −{pct(next.pct)} rabatt på allihop
            </p>
          )}
        </section>

        <section className="rounded-[3px] border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-3 py-2 text-sm">
            <span className="text-muted">Pris per tröja</span>
            <span className="tabular-nums">{kr(price.unitAfterDiscount)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-display text-sm uppercase">
              {business ? "Totalt exkl. moms" : "Totalt inkl. moms"}
            </span>
            <PriceDisplay
              value={Math.round(business ? price.subtotalExclVat : price.subtotalInclVat)}
              size="lg"
            />
          </div>
        </section>

        {/* avancerat-erbjudande innan kassan */}
        <section className="rounded-[10px] border border-line bg-paper p-4">
          <p className="font-display text-sm uppercase">Vill du göra mer med designen?</p>
          <p className="mt-1 text-[13px] leading-snug text-muted">
            Fler texter och bilder, tryck på ryggen eller ärmen, böjd text och exakta mått finns i
            avancerat läge.
          </p>
          <button onClick={onAdvanced} className="btn btn-outline btn-sm mt-3 w-full">
            Öppna avancerat läge »
          </button>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- förstagångsguide */

function IntroOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        className="crop-frame w-full max-w-sm rounded-[10px] border border-line bg-paper p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl uppercase">Designa din tröja</h2>
        <p className="mt-1 text-sm text-muted">Klart på ett par minuter — så funkar det:</p>
        <ol className="mt-4 space-y-3">
          {[
            "Välj plagg och färg",
            "Lägg till din bild eller text — flytta med fingret",
            "Välj storlek och antal — klart!",
          ].map((t, i) => (
            <li key={t} className="flex items-start gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-signal font-display text-sm text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-sm leading-snug">{t}</span>
            </li>
          ))}
        </ol>
        <p className="spec mt-4 text-[10px] text-muted">
          Allt du gör sparas automatiskt — du kan inte råka förstöra något.
        </p>
        <button onClick={onClose} className="btn btn-primary mt-4 w-full">
          Sätt igång →
        </button>
      </div>
    </div>
  );
}
