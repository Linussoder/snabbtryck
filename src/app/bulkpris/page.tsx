"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { QualityIndicator } from "@/components/ui/QualityIndicator";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { GARMENTS, getGarment } from "@/lib/garments";
import { computePrice, nextTier } from "@/lib/pricing";
import { evaluateQuality } from "@/lib/dpi";
import { submitLead } from "@/lib/leads";
import { kr, num, pct } from "@/lib/format";

const PRINT_SIZES = [
  { key: "brost", label: "Bröstlogga", cm2: 300, width: 20, height: 15 },
  { key: "stor", label: "Stor front", cm2: 600, width: 28, height: 21 },
  { key: "rygg", label: "Ryggtryck A3", cm2: 900, width: 30, height: 30 },
];

export default function BulkPris() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [garmentId, setGarmentId] = useState("hoodie");
  const [qty, setQty] = useState(20);
  const [sizeKey, setSizeKey] = useState("brost");
  const [logo, setLogo] = useState<{ src: string; w: number; h: number } | null>(null);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const garment = getGarment(garmentId);
  const psize = PRINT_SIZES.find((p) => p.key === sizeKey)!;
  const price = computePrice(garment, psize.cm2, qty);
  const next = nextTier(qty);

  const quality = useMemo(() => {
    if (!logo) return null;
    return evaluateQuality(logo.w, logo.h, psize.width, psize.height);
  }, [logo, psize]);

  function handleLogo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => setLogo({ src: r.result as string, w: img.naturalWidth, h: img.naturalHeight });
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    await submitLead({
      email,
      company: company || undefined,
      garmentId,
      qty,
      estimate: Math.round(price.subtotalInclVat),
      logo: !!logo,
    });
    setBusy(false);
    setSent(true);
  }

  return (
    <PageShell>
      {/* hero */}
      <section className="border-b border-line bg-paper-2">
        <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
          <div className="mb-3 flex items-center gap-2">
            <ChevronMark size={14} color="#00AEEF" />
            <span className="eyebrow">Företag · Bulkpris på 30 sekunder</span>
          </div>
          <h1 className="display max-w-2xl text-4xl sm:text-5xl">
            Vad kostar {qty} {garment.name.toLowerCase()} med er logga?
          </h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Räkna ut direkt — inget konto, ingen väntan på offert. Ladda upp loggan om du vill, så
            kollar vi trycket också.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_360px]">
        {/* config */}
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Plagg</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {GARMENTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGarmentId(g.id)}
                  className={`group overflow-hidden rounded-[10px] border transition-colors ${
                    g.id === garmentId ? "border-ink ring-1 ring-ink" : "border-line hover:border-muted"
                  }`}
                >
                  <div className={`aspect-square w-full overflow-hidden bg-white transition-opacity ${g.id === garmentId ? "" : "opacity-70 group-hover:opacity-100"}`}>
                    <GarmentImage shape={g.shape} view="front" color={g.colors[0].hex} dark={g.colors[0].dark} alt={g.name} />
                  </div>
                  <span className="block py-1.5 text-center font-head text-[11px]">{g.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="eyebrow">Antal</h2>
              <span className="font-display text-2xl">{num(qty)} st</span>
            </div>
            <input type="range" min={5} max={500} step={5} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="brand w-full" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[10, 25, 50, 100, 250].map((n) => (
                <button key={n} onClick={() => setQty(n)} className="rounded-[8px] border border-line px-2 py-1 spec text-[11px] hover:border-ink">{n}</button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="eyebrow mb-3">Trycksstorlek</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {PRINT_SIZES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSizeKey(p.key)}
                  className={`rounded-[10px] border p-3 text-left ${p.key === sizeKey ? "border-cyan bg-cyan/5" : "border-line hover:border-muted"}`}
                >
                  <span className="block head text-sm uppercase">{p.label}</span>
                  <span className="spec text-[11px] text-muted">{p.width}×{p.height} cm · {p.cm2} cm²</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="eyebrow mb-3">Er logga (valfritt)</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => inputRef.current?.click()} className="btn btn-outline btn-sm">
                {logo ? "Byt logga" : "Ladda upp logga"}
              </button>
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.src} alt="logga" className="h-14 w-14 rounded-[8px] border border-line object-contain" />
              )}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files)} />
            </div>
            {quality && <div className="mt-3"><QualityIndicator result={quality} /></div>}
          </section>
        </div>

        {/* estimate + lead */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <h2 className="eyebrow mb-2">Ditt uppskattade pris</h2>
            <div className="flex items-end justify-between">
              <PriceDisplay value={Math.round(price.subtotalInclVat)} size="lg" />
              <span className="spec text-[11px] text-muted">inkl. moms</span>
            </div>
            <p className="spec mt-1 text-[11px] text-muted">
              {kr(price.unitAfterDiscount)} / st · {num(psize.cm2)} cm² tryck
              {price.discountPct > 0 && ` · −${pct(price.discountPct)} rabatt`}
            </p>
            {next && (
              <p className="spec mt-1 text-[11px] text-cyan">+ {next.min - qty} st → −{pct(next.pct)} rabatt</p>
            )}

            <div className="my-4 h-px bg-line" />

            {sent ? (
              <div className="text-center">
                <ChevronMark size={28} color="#FFDA00" className="mx-auto" />
                <p className="mt-2 head text-lg uppercase">Tack!</p>
                <p className="text-sm text-muted">Vi hör av oss med en skarp offert inom en arbetsdag.</p>
                <Link href="/designa" className="btn btn-outline btn-sm mt-4">Börja designa själv</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-2">
                <p className="text-sm text-ink-soft">Vill du ha en exakt offert? Skicka så återkommer vi.</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Jobbmejl" className="field" />
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Företag (valfritt)" className="field" />
                <button type="submit" disabled={busy} className="btn btn-primary w-full">
                  {busy ? "Skickar…" : "Få exakt offert →"}
                </button>
                <p className="spec text-[10px] text-muted">Vi sparar bara det du fyller i för att kunna svara.</p>
              </form>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
