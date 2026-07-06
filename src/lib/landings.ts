// Innehåll för SEO-landningssidor (/for/[slug]). Grundat i verkliga användningsfall.

export interface Landing {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  bullets: { title: string; text: string }[];
  garments: string[]; // garment-ids att lyfta
  faq: { q: string; a: string }[];
  cta: { label: string; href: string };
}

export const LANDINGS: Landing[] = [
  {
    slug: "foreningstrojor",
    metaTitle: "Föreningströjor & lagkläder med tryck – namn & nummer | Snabbtryck",
    metaDescription:
      "Tryck föreningens logga på tröjor, hoodies och kepsar. Namn och nummer per spelare, volympris direkt och leverans inom 48 timmar. Från 1 plagg, inga uppläggsavgifter.",
    h1: "Föreningströjor med eget tryck",
    intro:
      "Samla laget i matchande plagg. Ladda upp föreningens logga, lägg till namn och nummer per spelare och se volympriset direkt. Perfekt för fotboll, innebandy, padel och alla föreningar.",
    bullets: [
      { title: "Namn & nummer per spelare", text: "Lägg in hela truppen på en gång — vi trycker varje plagg individuellt." },
      { title: "Volympris direkt", text: "Ju fler tröjor desto lägre styckpris — du ser rabatten live i kalkylatorn." },
      { title: "Från 1 plagg", text: "Behöver ni bara en ledartröja extra? Inga minimikrav, inga uppläggsavgifter." },
    ],
    garments: ["tshirt", "hoodie", "longsleeve", "cap"],
    faq: [
      { q: "Kan vi ha olika namn och nummer på varje tröja?", a: "Ja — i lagbeställningen fyller du i namn och nummer per spelare och varje plagg trycks individuellt." },
      { q: "Hur snabbt får vi tröjorna?", a: "Vi trycker och skickar inom 48 timmar. Frakten tillkommer, fri frakt över tröskeln." },
      { q: "Vad kostar det?", a: "Priset beror på plagg och tryckyta, med volymrabatt. Se exakt pris direkt i designverktyget." },
    ],
    cta: { label: "Starta lagbeställning", href: "/lag" },
  },
  {
    slug: "foretagsklader",
    metaTitle: "Företagskläder & profilkläder med logga | Snabbtryck",
    metaDescription:
      "Profilkläder med företagets logga – t-shirts, hoodies, kepsar och väskor. DTF-tryck i full färg, fakturabetalning för företag och leverans inom 48 timmar.",
    h1: "Företagskläder med er logga",
    intro:
      "Klä personalen, mässmonter eller kunderna i profilkläder. Ladda upp loggan, välj plagg och färg, och beställ med faktura. Företagskonto ger priser exklusive moms.",
    bullets: [
      { title: "Faktura & priser ex. moms", text: "Skapa företagskonto för fakturabetalning med 30 dagar och priser utan moms." },
      { title: "Full färg, skarp logga", text: "DTF-tryck återger loggan i full färg — även på mörka plagg." },
      { title: "Allt från arbetskläder till giveaways", text: "T-shirts, hoodies, kepsar och tygväskor med samma tryck." },
    ],
    garments: ["tshirt", "hoodie", "cap", "bag"],
    faq: [
      { q: "Kan vi betala mot faktura?", a: "Ja, med företagskonto får ni faktura med 30 dagars betalningsvillkor och priser exklusive moms." },
      { q: "Kan vi lägga en återkommande beställning?", a: "Spara designen på kontot och beställ om med ett klick när ni behöver fylla på." },
      { q: "Trycker ni på mörka plagg?", a: "Ja — DTF-tryck ger full täckning och färg även på svart och mörka färger." },
    ],
    cta: { label: "Designa profilkläder", href: "/designa" },
  },
  {
    slug: "eventklader",
    metaTitle: "Eventkläder & festtröjor med tryck – svensexa, möhippa, kickoff | Snabbtryck",
    metaDescription:
      "Tröjor för svensexa, möhippa, kickoff och event. Välj en färdig mall eller designa egen, beställ från 1 plagg och få dem inom 48 timmar.",
    h1: "Eventkläder & festtröjor",
    intro:
      "Gör tillfället minnesvärt med matchande tröjor. Svensexa, möhippa, kickoff eller festival — börja från en färdig mall och gör den till er egen på minuter.",
    bullets: [
      { title: "Färdiga mallar", text: "Slipp den tomma ytan — välj en mall för svensexa, möhippa eller student och byt text." },
      { title: "Beställ från 1 plagg", text: "Bara en tröja eller hela gänget — inga minimikrav." },
      { title: "Snabb leverans", text: "Tryckt och skickat inom 48 timmar så det hinner fram till festen." },
    ],
    garments: ["tshirt", "tank", "cap"],
    faq: [
      { q: "Har ni färdiga designer?", a: "Ja, i mallbiblioteket finns designer för svensexa, möhippa, student och mer — anpassa fritt." },
      { q: "Hur snabbt kan jag få dem?", a: "Vi trycker och skickar inom 48 timmar. Beställ i god tid före eventet." },
    ],
    cta: { label: "Bläddra bland mallar", href: "/mallar" },
  },
  {
    slug: "studentklader",
    metaTitle: "Studentkläder & studenttröjor med tryck 2026 | Snabbtryck",
    metaDescription:
      "Studenttröjor med eget tryck för klassen eller gänget. Namn, år och egen design. Från 1 plagg, volympris och leverans inom 48 timmar.",
    h1: "Studentkläder med eget tryck",
    intro:
      "Fira studenten i matchande tröjor. Sätt klassens namn, år och egen design — beställ till hela gänget med volymrabatt.",
    bullets: [
      { title: "Hela klassen", text: "Volympris ju fler ni är, med individuella namn om ni vill." },
      { title: "Egen design eller mall", text: "Börja från en student-mall eller skapa något helt eget." },
      { title: "Klart i tid", text: "Tryckt och skickat inom 48 timmar." },
    ],
    garments: ["tshirt", "hoodie"],
    faq: [
      { q: "Kan alla i klassen ha sitt namn?", a: "Ja — använd lagbeställningen för att lägga in namn per person." },
      { q: "Finns det student-mallar?", a: "Ja, kolla mallbiblioteket för färdiga student-designer." },
    ],
    cta: { label: "Skapa studenttröja", href: "/mallar" },
  },
];

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}
