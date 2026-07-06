import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { abs, faqLd, breadcrumbLd, jsonLdGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Så funkar det – designa och beställ egen tröja | Snabbtryck",
  description:
    "Så gör du: välj plagg, ladda upp logga eller skriv text, se priset live och beställ. DTF-tryck från 1 plagg, levererat inom 48 timmar. Storleksguide och vanliga frågor.",
  alternates: { canonical: "/sa-funkar-det" },
  openGraph: { title: "Så funkar det | Snabbtryck", description: "Designa och beställ egen tröja i fyra steg.", url: abs("/sa-funkar-det"), type: "website" },
};

const STEPS = [
  { n: "01", t: "Välj plagg & färg", d: "T-shirt, hoodie, keps eller väska — i den färg du vill. Priset utgår från plagget." },
  { n: "02", t: "Skapa din design", d: "Ladda upp din logga, skriv text och lägg till emoji. Placera och skala fritt på plagget." },
  { n: "03", t: "Se priset live", d: "Priset räknas ut direkt per cm² tryckyta, med volymrabatt ju fler du beställer." },
  { n: "04", t: "Beställ – klart på 48 h", d: "Vi genererar tryckfilen automatiskt, trycker med DTF och skickar inom 48 timmar." },
];

const SIZES = [
  { size: "S", chest: "48", length: "70" },
  { size: "M", chest: "51", length: "72" },
  { size: "L", chest: "54", length: "74" },
  { size: "XL", chest: "57", length: "76" },
  { size: "2XL", chest: "60", length: "78" },
];

const FAQ = [
  { q: "Vad är DTF-tryck?", a: "Direct-to-Film: designen skrivs ut på en film och pressas på plagget. Ger full färg, mjuk yta och håller för tvätt — även på mörka plagg." },
  { q: "Hur bra behöver min bild vara?", a: "Ju högre upplösning desto skarpare tryck. Verktyget varnar om en bild riskerar att bli suddig vid din valda storlek — sikta på minst 150 DPI i tryckstorlek." },
  { q: "Kostar det något att lägga upp?", a: "Nej, inga uppläggs- eller startavgifter. Du betalar bara för plagget och tryckytan." },
  { q: "Kan jag beställa bara ett plagg?", a: "Ja, från 1 plagg. Beställer du fler sjunker styckpriset automatiskt." },
  { q: "Hur snabbt levereras det?", a: "Vi trycker och skickar inom 48 timmar. Leveranstiden beror sedan på valt fraktsätt." },
];

export default function SaFunkarDet() {
  const ld = jsonLdGraph([
    breadcrumbLd([{ name: "Hem", path: "/" }, { name: "Så funkar det", path: "/sa-funkar-det" }]),
    faqLd(FAQ),
  ]);
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <PageHead index="GUIDE" title="Så funkar det" sub="Från idé till tryckt plagg på fyra steg — och svar på det du undrar." />

      <div className="mx-auto max-w-[1000px] space-y-14 px-4 py-12 md:px-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-5">
              <p className="font-display text-3xl text-signal">{s.n}</p>
              <h2 className="head mt-2 text-base">{s.t}</h2>
              <p className="mt-1.5 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center gap-3 text-center">
          <Link href="/designa" className="btn btn-primary">Testa själv — öppna verktyget →</Link>
          <Link href="/mallar" className="spec text-muted hover:text-ink">…eller börja från en färdig mall</Link>
        </section>

        <section>
          <h2 className="head mb-4 text-xl uppercase">Storleksguide</h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 font-normal eyebrow">Storlek</th>
                  <th className="px-4 py-3 font-normal eyebrow">Bredd (cm)</th>
                  <th className="px-4 py-3 font-normal eyebrow">Längd (cm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.size} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 head uppercase">{s.size}</td>
                    <td className="px-4 py-3 tabular-nums">{s.chest}</td>
                    <td className="px-4 py-3 tabular-nums">{s.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spec mt-2 text-[11px] text-muted">Ungefärliga mått för t-shirt. Mät gärna en tröja du gillar och jämför.</p>
        </section>

        <section>
          <h2 className="head mb-4 text-xl uppercase">Vanliga frågor</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="card p-5">
                <h3 className="head text-base">{f.q}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
