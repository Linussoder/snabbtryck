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
  /** Garment-id som sidan fokuserar på → Product-schema (JSON-LD) på sidan. */
  garmentFocus?: string;
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
      { title: "Egen design på minuter", text: "Skriv festens namn, lägg till emoji och en rolig text — placera fritt på plagget." },
      { title: "Beställ från 1 plagg", text: "Bara en tröja eller hela gänget — inga minimikrav." },
      { title: "Snabb leverans", text: "Tryckt och skickat inom 48 timmar så det hinner fram till festen." },
    ],
    garments: ["tshirt", "tank", "cap"],
    faq: [
      { q: "Kan jag designa helt själv?", a: "Ja — skriv egen text, lägg till emoji och ladda upp bilder direkt i verktyget och se resultatet på plagget live." },
      { q: "Hur snabbt kan jag få dem?", a: "Vi trycker och skickar inom 48 timmar. Beställ i god tid före eventet." },
    ],
    cta: { label: "Designa din festtröja", href: "/designa" },
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
      { title: "Egen design", text: "Skapa er egen studentdesign med text, år och bilder — helt fritt i verktyget." },
      { title: "Klart i tid", text: "Tryckt och skickat inom 48 timmar." },
    ],
    garments: ["tshirt", "hoodie"],
    faq: [
      { q: "Kan alla i klassen ha sitt namn?", a: "Ja — använd lagbeställningen för att lägga in namn per person." },
      { q: "Kan vi göra en helt egen design?", a: "Ja, designa fritt i verktyget med text, årtal och egna bilder." },
    ],
    cta: { label: "Skapa studenttröja", href: "/designa" },
  },
  {
    slug: "tshirt-med-eget-tryck",
    metaTitle: "T-shirt med eget tryck – designa online, från 1 st | Snabbtryck",
    metaDescription:
      "Designa din t-shirt med eget tryck direkt i webbläsaren. Från 169 kr med tryck, 8 färger, inga uppläggsavgifter och leverans inom 48 timmar. Beställ från 1 st.",
    h1: "T-shirt med eget tryck",
    intro:
      "Ladda upp en bild, skriv en text eller börja från en mall — och se din t-shirt ta form live. DTF-tryck i full färg som håller tvätt efter tvätt, på både ljusa och mörka plagg.",
    bullets: [
      { title: "Från 169 kr med tryck", text: "T-shirten kostar 149 kr och trycket från 20 kr — priset räknas ut live per cm² medan du designar." },
      { title: "8 färger, XS–3XL", text: "Svart, vit, grafit, marin, ceriseröd, flaskgrön, sand och signal — fram- och baksidestryck." },
      { title: "Tryckt inom 48 timmar", text: "Vi trycker och skickar inom 48 timmar. Från 1 st, inga uppläggsavgifter." },
    ],
    garments: ["tshirt", "longsleeve", "tank", "hoodie"],
    garmentFocus: "tshirt",
    faq: [
      { q: "Vad kostar en t-shirt med eget tryck?", a: "T-shirten kostar 149 kr och trycket från 20 kr, beroende på tryckets storlek (0,23 kr per cm²). En t-shirt med bröstlogga hamnar typiskt på 169–199 kr. Beställer du 5 eller fler sjunker styckpriset med mängdrabatt." },
      { q: "Kan jag trycka på både fram- och baksida?", a: "Ja — designverktyget har fram- och baksida med alla vanliga placeringar: vänster bröst, helsida fram, rygg och ärm." },
      { q: "Håller trycket i tvätten?", a: "Ja. DTF-tryck är slitstarkt och klarar maskintvätt i 40 grader. Vänd plagget ut och in och undvik torktumlare så håller det längst." },
      { q: "Hur snabbt får jag min t-shirt?", a: "Vi trycker och skickar inom 48 timmar. Med postombud (2–4 dagar) har du den normalt inom en vecka — oftast snabbare." },
    ],
    cta: { label: "Designa din t-shirt", href: "/designa?garment=tshirt" },
  },
  {
    slug: "hoodie-med-eget-tryck",
    metaTitle: "Hoodie med eget tryck – designa din egen hoodie | Snabbtryck",
    metaDescription:
      "Skapa en hoodie med eget tryck i full färg. Från 419 kr med tryck, 8 färger, tryck fram och bak. Inga uppläggsavgifter, från 1 st, skickas inom 48 timmar.",
    h1: "Hoodie med eget tryck",
    intro:
      "En rejäl hoodie med din design — logga på bröstet, stort motiv på ryggen eller båda. Designa direkt i webbläsaren och se priset live medan du jobbar.",
    bullets: [
      { title: "Från 419 kr med tryck", text: "Hoodien kostar 399 kr och trycket från 20 kr beroende på storlek — exakt pris visas live." },
      { title: "Bröst, rygg & ärm", text: "Alla klassiska placeringar med full färg — DTF-trycket syns lika bra på svart som på vitt." },
      { title: "Från 1 hoodie", text: "Beställ en enda eller till hela gänget — från 5 st får du 10 % mängdrabatt, från 10 st 18 %." },
    ],
    garments: ["hoodie", "tshirt", "longsleeve", "cap"],
    garmentFocus: "hoodie",
    faq: [
      { q: "Vad kostar en hoodie med eget tryck?", a: "Hoodien kostar 399 kr och trycket från 20 kr (0,23 kr per cm²). En hoodie med bröstlogga hamnar runt 419–449 kr; ett ryggtryck på 20×30 cm lägger till 138 kr. Mängdrabatt från 5 st." },
      { q: "Vilka färger finns hoodien i?", a: "Svart, vit, grafit, marin, ceriseröd, flaskgrön, sand och signal — i storlekar XS till 3XL." },
      { q: "Kan vi beställa hoodies till hela laget eller klassen?", a: "Ja — använd lagbeställningen så lägger du in namn och nummer per person och får volympris direkt." },
    ],
    cta: { label: "Designa din hoodie", href: "/designa?garment=hoodie" },
  },
  {
    slug: "keps-med-eget-tryck",
    metaTitle: "Keps med eget tryck – egen logga eller text | Snabbtryck",
    metaDescription:
      "Keps med eget tryck från 149 kr. Tryck logga eller text fram och bak, 8 färger. Inga uppläggsavgifter, från 1 st och leverans inom 48 timmar.",
    h1: "Keps med eget tryck",
    intro:
      "Sätt loggan, teamnamnet eller en rolig text på en keps. Perfekt som profilprodukt, till laget eller som present — designa på någon minut direkt i webbläsaren.",
    bullets: [
      { title: "Från 149 kr med tryck", text: "Kepsen kostar 129 kr och trycket från 20 kr — litet motiv fram (max 12×6 cm) och bak." },
      { title: "8 färger, one size", text: "Svart, vit, grafit, marin, ceriseröd, flaskgrön, sand och signal." },
      { title: "Snabbt klart", text: "Tryckt och skickat inom 48 timmar — från 1 keps, utan startavgifter." },
    ],
    garments: ["cap", "tshirt", "hoodie", "bag"],
    garmentFocus: "cap",
    faq: [
      { q: "Vad kostar en keps med eget tryck?", a: "Kepsen kostar 129 kr och trycket från 20 kr — de flesta kepsar med logga hamnar på ca 149 kr. Från 5 st får du 10 % rabatt, från 10 st 18 %." },
      { q: "Hur stort kan trycket vara på en keps?", a: "Fronttrycket kan vara upp till 12×6 cm och baksidan upp till 9×5 cm — lagom för en logga eller kort text." },
      { q: "Passar kepsen både vuxna och ungdomar?", a: "Kepsen är one size med justerbart spänne och passar de flesta från ungdom och uppåt." },
    ],
    cta: { label: "Designa din keps", href: "/designa?garment=cap" },
  },
  {
    slug: "arbetsklader-med-tryck",
    metaTitle: "Arbetskläder med tryck – logga på t-shirt, hoodie & jacka | Snabbtryck",
    metaDescription:
      "Arbetskläder med företagets logga: t-shirts, hoodies, långärmat och jackor. DTF-tryck som tål tvätt, fakturabetalning och leverans inom 48 timmar. Från 1 plagg.",
    h1: "Arbetskläder med tryck",
    intro:
      "Klä teamet i arbetskläder med er logga — utan minimikvantiteter och utan uppläggsavgifter. Beställ exakt så många ni behöver och fyll på när ny personal börjar.",
    bullets: [
      { title: "Fyll på när du behöver", text: "Ingen minsta order — beställ 1 extra t-shirt när en ny kollega börjar, till samma tryckkvalitet." },
      { title: "Tål arbetsdagen", text: "DTF-tryck är slitstarkt, flexibelt och klarar frekvent tvätt — loggan sitter kvar." },
      { title: "Faktura & ex. moms", text: "Företagskonto ger fakturabetalning med 30 dagar och priser exklusive moms." },
    ],
    garments: ["tshirt", "longsleeve", "hoodie", "jacket"],
    faq: [
      { q: "Vilka plagg passar som arbetskläder?", a: "T-shirt (149 kr), långärmad (199 kr), hoodie (399 kr) och jacka (549 kr) — alla med logga på bröst, rygg eller ärm. Priser inkl. moms, exkl. tryck från 20 kr." },
      { q: "Kan vi beställa fler plagg senare med samma tryck?", a: "Ja — designen sparas på ert konto så att ni kan beställa om exakt samma plagg när ni behöver fylla på." },
      { q: "Får vi rabatt när vi beställer till hela personalen?", a: "Ja, mängdrabatten stiger automatiskt: 10 % från 5 plagg, 18 % från 10, 25 % från 25 och upp till 40 % från 100 plagg." },
    ],
    cta: { label: "Designa era arbetskläder", href: "/designa" },
  },
  {
    slug: "padelklader",
    metaTitle: "Padelkläder med eget tryck – matchtröjor för padelteam | Snabbtryck",
    metaDescription:
      "Padeltröjor och teamkläder med eget tryck: klubblogga, namn och nummer. Linnen, t-shirts och hoodies från 1 plagg, volympris och leverans inom 48 timmar.",
    h1: "Padelkläder med eget tryck",
    intro:
      "Matcha teamet på banan. Tryck klubbloggan på tröjor och linnen, lägg till namn och nummer per spelare och beställ till hela teamet med volympris — eller bara till dig själv.",
    bullets: [
      { title: "Namn & nummer", text: "Lägg in alla spelare på en gång via lagbeställningen — varje plagg trycks individuellt." },
      { title: "Plagg för banan", text: "Lätta t-shirts och linnen för spel, hoodies för uppvärmning och kepsar för solen." },
      { title: "Snabbt ombyte", text: "Tryckt och skickat inom 48 timmar — hinner fram till helgens americano." },
    ],
    garments: ["tshirt", "tank", "hoodie", "cap"],
    faq: [
      { q: "Kan vi ha olika namn på varje tröja?", a: "Ja — i lagbeställningen fyller du i namn och nummer per spelare, och varje plagg trycks individuellt utan extra avgift per variant." },
      { q: "Vad kostar padeltröjor till ett helt team?", a: "En t-shirt med klubblogga kostar från 169 kr. Från 5 plagg får ni 10 % rabatt och från 10 plagg 18 % — volympriset visas direkt i verktyget." },
      { q: "Kan klubben få en egen butik?", a: "Ja — med en klubbutik kan medlemmarna själva beställa klubbens plagg med rätt tryck, utan att någon behöver samla ihop beställningar." },
    ],
    cta: { label: "Starta lagbeställning", href: "/lag" },
  },
];

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}
