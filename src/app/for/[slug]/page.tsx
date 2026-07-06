import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { GarmentImage } from "@/components/ui/GarmentImage";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { getGarment } from "@/lib/garments";
import { LANDINGS, getLanding } from "@/lib/landings";
import { abs, breadcrumbLd, faqLd, serviceLd, jsonLdGraph } from "@/lib/seo";

export function generateStaticParams() {
  return LANDINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = getLanding(slug);
  if (!l) return {};
  return {
    title: l.metaTitle,
    description: l.metaDescription,
    alternates: { canonical: `/for/${l.slug}` },
    openGraph: { title: l.metaTitle, description: l.metaDescription, url: abs(`/for/${l.slug}`), type: "website" },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLanding(slug);
  if (!l) notFound();

  const ld = jsonLdGraph([
    breadcrumbLd([
      { name: "Hem", path: "/" },
      { name: l.h1, path: `/for/${l.slug}` },
    ]),
    faqLd(l.faq),
    serviceLd(),
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />

      {/* Hero */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto max-w-[1000px] px-4 py-14 md:px-8">
          <div className="flex items-center gap-2">
            <ChevronMark size={14} color="#FFDA00" />
            <span className="eyebrow text-muted">DTF-tryck · från 1 plagg · 48 h</span>
          </div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{l.h1}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{l.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={l.cta.href} className="btn btn-primary">{l.cta.label} →</Link>
            <Link href="/designa" className="btn btn-outline">Öppna verktyget</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] space-y-12 px-4 py-12 md:px-8">
        {/* Fördelar */}
        <section className="grid gap-4 sm:grid-cols-3">
          {l.bullets.map((b) => (
            <div key={b.title} className="card p-5">
              <h2 className="head text-base">{b.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{b.text}</p>
            </div>
          ))}
        </section>

        {/* Plagg */}
        <section>
          <h2 className="head mb-4 text-xl uppercase">Populära plagg</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {l.garments.map((gid) => {
              const g = getGarment(gid);
              return (
                <Link key={gid} href={`/designa?garment=${gid}`} className="card crop-frame overflow-hidden">
                  <div className="aspect-square bg-white">
                    <GarmentImage shape={g.shape} view="front" color={g.colors[0].hex} dark={g.colors[0].dark} alt={g.name} />
                  </div>
                  <div className="border-t border-line px-3 py-2">
                    <p className="head text-sm">{g.name}</p>
                    <p className="spec text-[10px] text-muted">från {g.basePrice} kr</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="head mb-4 text-xl uppercase">Vanliga frågor</h2>
          <div className="space-y-3">
            {l.faq.map((f) => (
              <div key={f.q} className="card p-5">
                <h3 className="head text-base">{f.q}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <h2 className="head text-2xl">Redo att komma igång?</h2>
          <Link href={l.cta.href} className="btn btn-primary">{l.cta.label} →</Link>
        </div>
      </div>
    </PageShell>
  );
}
