import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { GUIDES } from "@/lib/guides";
import { abs, breadcrumbLd, jsonLdGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guider – allt om tryck på kläder",
  description:
    "Guider om tryck på kläder: vad det kostar, DTF vs screentryck, rätt filformat, tvättråd och hur du beställer lagtröjor. Konkreta priser och raka svar.",
  alternates: { canonical: "/guider" },
  openGraph: {
    title: "Guider – allt om tryck på kläder | Snabbtryck",
    description: "Vad kostar tryck? DTF vs screentryck? Rätt filformat? Raka svar i våra guider.",
    url: abs("/guider"),
    type: "website",
  },
};

export default function GuiderIndex() {
  const ld = jsonLdGraph([
    breadcrumbLd([{ name: "Hem", path: "/" }, { name: "Guider", path: "/guider" }]),
  ]);
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <PageHead
        index="GUIDER"
        title="Allt om tryck på kläder"
        sub="Priser, tryckmetoder, filformat och tvättråd — raka svar utan säljsnack."
      />
      <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guider/${g.slug}`} className="card group p-6">
              <h2 className="head text-lg group-hover:text-signal transition-colors">{g.h1}</h2>
              <p className="mt-2 text-sm text-muted">{g.metaDescription}</p>
              <p className="spec mt-4 text-[11px] text-muted">Läs guiden →</p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
