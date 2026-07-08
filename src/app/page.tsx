import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GarmentShape } from "@/components/ui/GarmentShape";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { GARMENTS } from "@/lib/garments";
import { kr } from "@/lib/format";
import { HeroStage } from "@/components/home/HeroStage";
import { SocialProof } from "@/components/home/SocialProof";
import { serviceLd, faqLd, jsonLdGraph } from "@/lib/seo";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Vad är DTF-tryck?",
    a: "DTF (Direct-to-Film) är en tryckmetod där motivet skrivs ut på en film och pressas på plagget. Det ger slitstarkt tryck i full färg som fungerar på i princip alla tyger och färger — även mörka plagg — utan de begränsningar som screentryck har vid små upplagor.",
  },
  {
    q: "Vad kostar det att trycka egna kläder?",
    a: "Priset beror på plagg, hur stor tryckytan är (cm²) och antal. Det börjar runt 99 kr per plagg och visas live medan du designar. Fler plagg ger mängdrabatt och inga uppläggsavgifter tillkommer.",
  },
  {
    q: "Hur snabbt får jag mina plagg?",
    a: "Beställningar trycks och skickas normalt inom 48 timmar.",
  },
  {
    q: "Finns det något minsta antal?",
    a: "Nej — du kan beställa från 1 plagg. Inga minimiantal och inga startavgifter.",
  },
  {
    q: "Kan jag beställa matchtröjor med namn och nummer till ett lag?",
    a: "Ja. Ladda upp en namn- och nummerlista, förhandsgranska varje plagg och få volympris direkt. Perfekt för padel-, fotbolls- och innebandylag samt föreningar.",
  },
  {
    q: "Vilka filer kan jag ladda upp?",
    a: "PNG, SVG och JPG. För skarpt tryck rekommenderas 300 DPI — verktyget gör en automatisk DPI-koll och varnar om upplösningen är för låg.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdGraph([serviceLd(), faqLd(FAQ)]) }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <Categories />
        <Steps />
        <TeamBanner />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------ FAQ */
function Faq() {
  return (
    <section className="border-t border-line bg-paper-2">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <SectionHead index="05" title="Vanliga frågor" sub="Det kunderna oftast undrar över DTF-tryck." />
        <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.q} className="border-t border-line-2 pt-4">
              <dt className="font-head text-lg">{item.q}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Hero */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="halftone halftone-fade absolute inset-0 opacity-[0.06]" />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise">
          <div className="mb-5 flex items-center gap-2">
            <span className="eyebrow text-cyan">
              DTF-tryck · Design i webbläsaren · Sverige
            </span>
          </div>
          <h1 className="display text-[12vw] leading-[0.94] sm:text-6xl lg:text-[4.8rem]">
            Designa din tröja
            <br />
            på <span className="mark-yellow">2 minuter</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-soft">
            Ladda upp en logga, skriv din text och välj bland färdiga standardplaceringar — placera fritt
            på plagget och se priset räknas ut medan du jobbar. Inga minimiantal,
            ingen väntan på offert.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/designa" className="btn btn-primary">
              Börja designa <span aria-hidden>→</span>
            </Link>
            <Link href="/lag" className="btn btn-outline">
              Beställ till laget
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["1 st", "Minsta antal"],
              ["3–5", "Arbetsdagar"],
              ["300", "DPI-koll"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl leading-none">{n}</dt>
                <dd className="eyebrow mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroStage />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Marquee */
function Marquee() {
  const items = [
    "LADDA UPP LOGGA",
    "AI TAR BORT BAKGRUNDEN",
    "BÖJD TEXT",
    "FULLT EMOJI-BIBLIOTEK",
    "PRIS I REALTID",
    "NAMN & NUMMER",
    "MÄNGDRABATT",
    "TRYCKFÄRDIG FIL",
  ];
  return (
    <div className="panel-ink overflow-hidden border-b border-ink-line py-3">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <span key={k} className="flex items-center">
            {items.map((it) => (
              <span key={it} className="flex items-center">
                <span className="mx-5 text-base font-bold leading-none text-yellow" aria-hidden>
                  »
                </span>
                <span className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-paper/90">
                  {it}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Categories */
function Categories() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
      <SectionHead index="01" title="Välj ditt plagg" sub="Nio plagg, alla redo för tryck fram, bak och på ärm." />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {GARMENTS.map((g) => (
          <Link
            key={g.id}
            href={`/designa?garment=${g.id}`}
            className="card group overflow-hidden transition-all hover:-translate-y-1 hover:border-ink"
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-white">
              <GarmentImage
                shape={g.shape}
                view="front"
                color={g.colors[0].hex}
                dark={g.colors[0].dark}
                alt={g.name}
                className="transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <span className="font-head text-sm">{g.name}</span>
              <span className="spec text-[11px] text-muted">från {kr(g.basePrice)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Steps */
function Steps() {
  const steps: [string, string, string, string][] = [
    ["Ladda upp", "Släpp in loggan eller bilden — eller beskriv din idé och låt AI:n rita den. Bakgrunden tas bort med ett klick.", "var(--color-cyan)", "PNG · SVG · 300 DPI"],
    ["Placera", "Dra, skala och rotera bild och text på plagget – eller välj en standardplacering som vänster bröst, helsida fram eller över axelbladen. Tryckytorna visas som streckade guider och DPI-kollen håller koll på skärpan.", "var(--color-ink)", "Live-pris per cm²"],
    ["Beställ", "Priset är redan uträknat. Lägg i varukorgen, betala — vi trycker och skickar. Följ status Mottagen → I tryck → Skickad.", "var(--color-ink)", "Tryckt inom 48 h"],
  ];
  return (
    <section className="border-y border-line bg-paper-2">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <SectionHead index="02" title="Hur det funkar" sub="Tre steg. Ingen designerfarenhet krävs." />
        <ol className="mt-10 grid gap-7 md:grid-cols-3">
          {steps.map(([t, d, color, tag], i) => (
            <li key={t} style={{ borderTop: `2px solid ${color}` }} className="pt-5">
              <span className="font-display text-6xl leading-none" style={{ color }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-head text-xl">{t}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{d}</p>
              <span className="spec mt-4 inline-block rounded-full border border-line-2 px-3 py-1.5 text-[11px] uppercase text-ink-soft">
                {tag}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Team banner */
function TeamBanner() {
  return (
    <section className="panel-ink on-ink relative overflow-hidden">
      <div className="grid-field-ink absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-4 py-16 md:px-8 lg:grid-cols-[1fr_auto]">
        <div>
          <span className="eyebrow text-signal">För lag &amp; föreningar</span>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            Hela laget. Namn, nummer, ett pris.
          </h2>
          <p className="mt-4 max-w-xl text-paper/70">
            Ladda upp en lista med namn och nummer, förhandsgranska varenda tröja
            och få volympriset direkt. Padel, fotboll, innebandy — vi har klätt
            fler lag än vi kan räkna.
          </p>
          <Link href="/lag" className="btn btn-primary mt-6">
            Starta lagbeställning →
          </Link>
        </div>
        <div className="flex gap-3">
          {["10", "23", "7"].map((n, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-28 w-20 sm:h-36 sm:w-24">
                <GarmentShape shape="tshirt" view="back" color={["#b3122b", "#1c2a44", "#141414"][i]} dark className="h-full w-full" />
              </div>
              <span className="mt-1 font-display text-2xl text-signal">#{n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Final CTA */
function FinalCta() {
  return (
    <section className="border-t border-line bg-yellow text-yellow-ink">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-4 py-20 text-center md:px-8">
        <span className="eyebrow text-yellow-ink/70">Från logga till plagg</span>
        <h2 className="display text-4xl sm:text-6xl">Din idé. Ditt plagg.</h2>
        <p className="text-lg text-yellow-ink/80 md:whitespace-nowrap">
          Öppna verktyget och ha en tryckfärdig design innan kaffet kallnat.
        </p>
        <Link
          href="/designa"
          className="btn bg-ink text-paper hover:text-paper"
        >
          Designa nu <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ shared */
function SectionHead({ index, title, sub }: { index: string; title: string; sub: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <span className="eyebrow text-cyan">{index} · SNABBTRYCK</span>
        <h2 className="head mt-2 text-3xl sm:text-[2.6rem]">{title}</h2>
      </div>
      <p className="max-w-xs text-sm text-muted">{sub}</p>
    </div>
  );
}
