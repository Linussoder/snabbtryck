// Central SEO-konfig + JSON-LD-hjälpare (structured data för Google & AI/GEO).

export const SITE = {
  name: "Snabbtryck",
  legalName: "Snabbtryck",
  url: "https://www.snabbtryck.se",
  locale: "sv_SE",
  lang: "sv",
  areaServed: "SE",
  description:
    "Designa din egen tröja, hoodie eller keps direkt i webbläsaren. Ladda upp logga, lägg till text, placera fritt med standardplaceringar och se priset live per cm² tryckyta. DTF-tryck utan uppläggsavgifter, från 1 plagg — tryckt och skickat inom 48 timmar.",
  tagline: "Designa din egen tröja med DTF-tryck",
  sameAs: [] as string[], // fyll på med sociala profiler när de finns
};

/** Absolut URL från en sökväg (för canonical/OG). */
export function abs(path = "/"): string {
  return new URL(path, SITE.url).toString();
}

/** Metadata-robots för privata sidor som aldrig ska indexeras. */
export const NOINDEX = { index: false, follow: false } as const;

type Json = Record<string, unknown>;

export function organizationLd(): Json {
  return {
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: abs("/icon.svg"),
    },
    image: abs("/opengraph-image"),
    description: SITE.description,
    areaServed: SITE.areaServed,
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function websiteLd(): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "sv-SE",
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

/** Tjänst-schema för kärnerbjudandet (hjälper AI förstå vad sajten gör). */
export function serviceLd(): Json {
  return {
    "@type": "Service",
    "@id": `${SITE.url}/#service`,
    serviceType: "DTF-tryck på kläder (designa själv)",
    provider: { "@id": `${SITE.url}/#organization` },
    areaServed: { "@type": "Country", name: "Sverige" },
    url: SITE.url,
    description:
      "Egendesignade plagg med DTF-tryck i full färg. Designa i webbläsaren, ladda upp logga och text, beställ från 1 plagg utan uppläggsavgifter. Levereras inom 48 timmar.",
    offers: {
      "@type": "Offer",
      priceCurrency: "SEK",
      price: "99",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "SEK",
        minPrice: "99",
        description: "Från 99 kr per plagg, pris beror på plagg och tryckyta.",
      },
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function faqLd(qa: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Steg-för-steg-schema (t.ex. "Så funkar det"). */
export function howToLd(opts: {
  name: string;
  description: string;
  path: string;
  steps: { name: string; text: string }[];
}): Json {
  return {
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Produkt-schema för en plaggtyp med "från"-pris. */
export function productLd(opts: {
  name: string;
  description: string;
  path: string;
  fromPrice: number;
  colors?: string[];
}): Json {
  return {
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    image: abs("/opengraph-image"),
    brand: { "@id": `${SITE.url}/#organization` },
    ...(opts.colors?.length ? { color: opts.colors.join(", ") } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "SEK",
      lowPrice: String(opts.fromPrice),
      offerCount: "1",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE.url}/#organization` },
    },
  };
}

/** Artikel-schema för guider. */
export function articleLd(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string; // YYYY-MM-DD
  dateModified?: string;
}): Json {
  return {
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    image: abs("/opengraph-image"),
    inLanguage: "sv-SE",
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

/** Bygger ett komplett JSON-LD @graph-dokument. */
export function jsonLdGraph(nodes: Json[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}
