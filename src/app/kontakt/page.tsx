import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Kontakt & om oss | Snabbtryck",
  description: "Kontakta Snabbtryck — DTF-tryck av egna kläder i Sverige. Företagsuppgifter och support.",
  alternates: { canonical: "/kontakt" },
};

export default function Kontakt() {
  return (
    <PageShell>
      <PageHead index="KONTAKT" title="Kontakt & om oss" sub="Vi hjälper dig från idé till färdigt plagg." />

      <div className="mx-auto max-w-[760px] space-y-8 px-4 py-12 md:px-8">
        <section className="space-y-2 text-sm leading-relaxed text-ink-soft">
          <p>
            Snabbtryck är en svensk tjänst för att designa och beställa egna tryckta kläder med DTF-tryck —
            i full färg, från 1 plagg, utan uppläggsavgifter. Du skapar din design direkt i webbläsaren och vi
            trycker och skickar normalt inom 48 timmar.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h2 className="eyebrow mb-2">Support</h2>
            <p className="text-sm text-ink-soft">
              Frågor om en order, design eller faktura?
            </p>
            <a href="mailto:hej@snabbtryck.se" className="mt-2 inline-block font-display text-lg lowercase text-signal hover:underline">
              hej@snabbtryck.se
            </a>
            <p className="spec mt-2 text-[11px] text-muted">Vi svarar normalt inom en arbetsdag.</p>
          </div>
          <div className="card p-5">
            <h2 className="eyebrow mb-2">Företagsuppgifter</h2>
            <ul className="space-y-1 text-sm text-ink-soft">
              <li><strong>Söderstjerna Fastigheter AB</strong></li>
              <li>Org.nr: 559242-2629</li>
              <li>Kvartsgatan 2, 267 35 Bjuv</li>
              <li>Driver varumärket Snabbtryck</li>
            </ul>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="eyebrow mb-2">Vanliga vägar</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <li><Link href="/sa-funkar-det" className="link-underline">Så funkar det</Link></li>
            <li><Link href="/designa" className="link-underline">Designverktyget</Link></li>
            <li><Link href="/lag" className="link-underline">Lagbeställning</Link></li>
            <li><Link href="/bulkpris" className="link-underline">Bulkpriskalkylator</Link></li>
            <li><Link href="/kopvillkor" className="link-underline">Köpvillkor</Link></li>
            <li><Link href="/integritetspolicy" className="link-underline">Integritetspolicy</Link></li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
