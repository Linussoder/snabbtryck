import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { GUIDES, getGuide, type GuideSection } from "@/lib/guides";
import { abs, articleLd, breadcrumbLd, faqLd, jsonLdGraph } from "@/lib/seo";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: `/guider/${g.slug}` },
    openGraph: {
      title: g.metaTitle,
      description: g.metaDescription,
      url: abs(`/guider/${g.slug}`),
      type: "article",
      publishedTime: g.datePublished,
      modifiedTime: g.dateModified,
    },
  };
}

function Section({ s }: { s: GuideSection }) {
  return (
    <section>
      <h2 className="head text-xl uppercase">{s.h2}</h2>
      {s.paragraphs.map((p) => (
        <p key={p.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {p}
        </p>
      ))}
      {s.list && (
        <ul className="mt-3 space-y-2">
          {s.list.map((item) => (
            <li key={item.slice(0, 40)} className="flex gap-2 text-[15px] leading-relaxed text-ink-soft">
              <span className="mt-1.5 flex-none"><ChevronMark size={10} color="#FFDA00" /></span>
              {item}
            </li>
          ))}
        </ul>
      )}
      {s.table && (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            {s.table.caption && <caption className="sr-only">{s.table.caption}</caption>}
            <thead>
              <tr className="border-b border-line text-left">
                {s.table.headers.map((h, i) => (
                  <th key={`${h}-${i}`} className="px-4 py-3 font-normal eyebrow">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-line last:border-0">
                  {row.map((cell, i) => (
                    <td key={`${cell}-${i}`} className={i === 0 ? "px-4 py-3 head" : "px-4 py-3 tabular-nums"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const ld = jsonLdGraph([
    breadcrumbLd([
      { name: "Hem", path: "/" },
      { name: "Guider", path: "/guider" },
      { name: g.h1, path: `/guider/${g.slug}` },
    ]),
    articleLd({
      headline: g.h1,
      description: g.metaDescription,
      path: `/guider/${g.slug}`,
      datePublished: g.datePublished,
      dateModified: g.dateModified,
    }),
    faqLd(g.faq),
  ]);

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />

      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto max-w-[800px] px-4 py-14 md:px-8">
          <nav className="spec text-[11px] text-muted">
            <Link href="/guider" className="hover:text-signal">GUIDER</Link> / {g.slug.toUpperCase().replaceAll("-", " ")}
          </nav>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{g.h1}</h1>
          <p className="mt-4 text-lg text-ink-soft">{g.intro}</p>
          <p className="spec mt-4 text-[11px] text-muted">Uppdaterad {g.dateModified}</p>
        </div>
      </div>

      <article className="mx-auto max-w-[800px] space-y-12 px-4 py-12 md:px-8">
        {g.sections.map((s) => (
          <Section key={s.h2} s={s} />
        ))}

        <section>
          <h2 className="head mb-4 text-xl uppercase">Vanliga frågor</h2>
          <div className="space-y-3">
            {g.faq.map((f) => (
              <div key={f.q} className="card p-5">
                <h3 className="head text-base">{f.q}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card flex flex-col items-center gap-3 p-10 text-center">
          <h2 className="head text-2xl">Redo att testa själv?</h2>
          <Link href={g.cta.href} className="btn btn-primary">{g.cta.label} →</Link>
        </section>

        <nav>
          <h2 className="eyebrow mb-3 text-muted">Läs vidare</h2>
          <ul className="flex flex-wrap gap-3">
            {g.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="btn btn-outline text-sm">{r.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </PageShell>
  );
}
