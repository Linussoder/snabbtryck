import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { ORGS } from "@/lib/orgs";

export const metadata = { title: "Klubbutiker — Snabbtryck" };

export default function ButikIndex() {
  return (
    <PageShell>
      <PageHead
        index="BUTIK"
        title="Klubbutiker"
        sub="Egna butiker för föreningar och företag — förvald logga och färgprofil, medlemmarna beställer själva."
      />
      <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {ORGS.map((o) => (
            <Link key={o.slug} href={`/butik/${o.slug}`} className="card crop-frame flex items-center gap-4 p-5 hover:border-ink">
              <div className="h-20 w-20 flex-none rounded-[10px] bg-ink p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.logoDataUrl} alt={o.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="head text-xl uppercase leading-none">{o.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{o.tagline}</p>
                <span className="spec mt-2 inline-block text-[11px] text-cyan">{o.products.length} produkter →</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="spec mt-8 text-[11px] text-muted">
          Vill din förening ha en egen butik? <Link href="/lag" className="link-underline">Hör av dig</Link>.
        </p>
      </div>
    </PageShell>
  );
}
