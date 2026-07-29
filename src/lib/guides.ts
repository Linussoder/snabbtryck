// Innehåll för guide-sidorna (/guider/[slug]). Skrivna för att vara direkt
// citerbara av både Google och AI-assistenter: konkreta priser, tabeller och
// Q&A. Priserna speglar DEFAULT_PRICING/GARMENTS — uppdatera här om de ändras.

export interface GuideSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
  table?: { caption?: string; headers: string[]; rows: string[][] };
}

export interface Guide {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  related: { label: string; href: string }[];
  cta: { label: string; href: string };
}

export const GUIDES: Guide[] = [
  {
    slug: "vad-kostar-det-att-trycka-trojor",
    metaTitle: "Vad kostar det att trycka tröjor? Priser 2026 | Snabbtryck",
    metaDescription:
      "Komplett prisguide: t-shirt med tryck från 169 kr, hoodie från 419 kr. Så räknas priset ut (plagg + 0,23 kr/cm² tryckyta), mängdrabatter upp till 40 % och frakt.",
    h1: "Vad kostar det att trycka tröjor?",
    intro:
      "Priset för en tryckt tröja består av två delar: plagget och trycket. Hos Snabbtryck kostar trycket 0,23 kr per cm² tryckyta (minst 20 kr per plagg) — utan uppläggsavgifter eller startkostnader. Här är hela kalkylen, med exakta priser.",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    sections: [
      {
        h2: "Prisformeln: plagg + tryckyta",
        paragraphs: [
          "Pris per plagg = plaggets grundpris + tryckets yta i cm² × 0,23 kr (minst 20 kr per tryckt plagg). Allt inklusive moms. Det finns inga uppläggsavgifter, klichékostnader eller startavgifter — det som visas i designverktyget är det du betalar.",
          "En bröstlogga på 10×10 cm (100 cm²) kostar alltså 23 kr i tryck. Ett stort ryggmotiv på 30×40 cm (1 200 cm²) kostar 276 kr. Priset uppdateras live medan du designar, så du ser alltid exakt vad din design kostar innan du beställer.",
        ],
      },
      {
        h2: "Plaggpriser (inkl. moms, exkl. tryck)",
        paragraphs: [
          "Grundpriserna per plagg. Lägg till tryckkostnaden (från 20 kr) för det färdiga priset.",
        ],
        table: {
          caption: "Grundpriser per plagg hos Snabbtryck (2026)",
          headers: ["Plagg", "Grundpris", "Med bröstlogga (ca 10×10 cm)"],
          rows: [
            ["Tygväska", "99 kr", "122 kr"],
            ["Keps", "129 kr", "149 kr (fronttryck)"],
            ["Linne", "139 kr", "162 kr"],
            ["T-shirt", "149 kr", "172 kr"],
            ["Shorts", "179 kr", "202 kr"],
            ["Långärmad", "199 kr", "222 kr"],
            ["Byxor", "299 kr", "322 kr"],
            ["Hoodie", "399 kr", "422 kr"],
            ["Jacka", "549 kr", "572 kr"],
          ],
        },
      },
      {
        h2: "Mängdrabatt: upp till 40 % lägre styckpris",
        paragraphs: [
          "Beställer du flera plagg sjunker styckpriset automatiskt. Rabatten räknas på hela antalet i beställningen, även om plaggen har olika storlekar eller olika namn och nummer.",
        ],
        table: {
          caption: "Mängdrabatter",
          headers: ["Antal plagg", "Rabatt", "Exempel: t-shirt med bröstlogga (172 kr)"],
          rows: [
            ["1–4", "0 %", "172 kr/st"],
            ["5–9", "10 %", "155 kr/st"],
            ["10–24", "18 %", "141 kr/st"],
            ["25–49", "25 %", "129 kr/st"],
            ["50–99", "32 %", "117 kr/st"],
            ["100+", "40 %", "103 kr/st"],
          ],
        },
      },
      {
        h2: "Frakt och leveranstid",
        paragraphs: [
          "Alla beställningar trycks och skickas inom 48 timmar. Frakt till postombud kostar 59 kr (2–4 dagar) och hemleverans 79 kr (1–3 dagar). Vid beställningar över 800 kr är frakten gratis.",
        ],
      },
      {
        h2: "Därför blir småupplagor billigare med DTF",
        paragraphs: [
          "Traditionellt screentryck kräver att en schablon (kliché) tillverkas per färg och motiv — ofta 300–900 kr i uppläggsavgift innan första tröjan ens är tryckt. Det gör små upplagor dyra. DTF-tryck (Direct-to-Film) skrivs ut digitalt, så kostnaden är densamma per plagg oavsett om du beställer 1 eller 100. Därför kan en enda t-shirt med fullfärgstryck kosta 172 kr i stället för över tusenlappen.",
        ],
      },
    ],
    faq: [
      { q: "Vad kostar det att trycka en egen t-shirt?", a: "Hos Snabbtryck kostar en t-shirt 149 kr och trycket från 20 kr — en t-shirt med bröstlogga hamnar på ca 172 kr inklusive moms. Priset beräknas per cm² tryckyta (0,23 kr/cm²) och visas live i designverktyget." },
      { q: "Tillkommer några uppläggsavgifter eller startkostnader?", a: "Nej. Till skillnad från screentryck har DTF-tryck inga uppläggsavgifter, klichékostnader eller minimiantal. Du betalar bara för plagget och tryckytan." },
      { q: "Blir det billigare per tröja om vi beställer många?", a: "Ja — mängdrabatten stiger automatiskt: 10 % från 5 plagg, 18 % från 10, 25 % från 25, 32 % från 50 och 40 % från 100 plagg." },
      { q: "Kostar tryck på både fram- och baksida dubbelt?", a: "Du betalar per cm² total tryckyta. Två tryck à 100 cm² kostar lika mycket som ett på 200 cm² — 46 kr." },
    ],
    related: [
      { label: "DTF-tryck vs screentryck", href: "/guider/dtf-tryck-vs-screentryck" },
      { label: "Bulkpriskalkylatorn", href: "/bulkpris" },
      { label: "T-shirt med eget tryck", href: "/for/tshirt-med-eget-tryck" },
    ],
    cta: { label: "Se ditt pris live i verktyget", href: "/designa" },
  },
  {
    slug: "dtf-tryck-vs-screentryck",
    metaTitle: "DTF-tryck vs screentryck vs vinyl – vilket ska du välja? | Snabbtryck",
    metaDescription:
      "Jämförelse av tryckmetoder: DTF, screentryck och vinyl (flex). Färger, hållbarhet, känsla, pris för små och stora upplagor — och när varje metod passar bäst.",
    h1: "DTF-tryck vs screentryck vs vinyl",
    intro:
      "De tre vanligaste metoderna för att trycka på kläder är DTF (Direct-to-Film), screentryck och vinyl/flextryck. Alla tre ger bra resultat — men de passar olika situationer. Här är skillnaderna, utan säljsnack.",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    sections: [
      {
        h2: "Så fungerar metoderna",
        paragraphs: [
          "DTF (Direct-to-Film): motivet skrivs ut digitalt i full färg på en specialfilm med lim­pulver och värmepressas sedan på plagget. Fungerar på i princip alla tyger och färger, utan förbehandling.",
          "Screentryck: färg pressas genom en finmaskig schablon (en per färg i motivet) direkt på tyget. Kräver att schabloner tillverkas innan tryckningen — en fast startkostnad per motiv och färg.",
          "Vinyl/flex: motivet skärs ut ur en färgad plastfilm och värmepressas på plagget. Varje färg är ett eget lager som skärs och rensas för hand.",
        ],
      },
      {
        h2: "Jämförelsen",
        paragraphs: [],
        table: {
          caption: "DTF vs screentryck vs vinyl",
          headers: ["", "DTF", "Screentryck", "Vinyl/flex"],
          rows: [
            ["Antal färger", "Obegränsat (fullfärg + foton)", "Kostnad per färg", "1–3 färger praktiskt"],
            ["Små upplagor (1–25 st)", "Bäst — inga startkostnader", "Dyrt — uppläggsavgift per färg", "OK för enkla motiv"],
            ["Stora upplagor (500+)", "Bra", "Bäst — lägst styckpris", "Opraktiskt"],
            ["Detaljer & gradienter", "Utmärkt", "Bra (raster)", "Begränsat — bara hela ytor"],
            ["Mörka plagg", "Ja, full täckning", "Ja, med undertryck", "Ja"],
            ["Känsla på tyget", "Tunn, flexibel yta", "Mjukast (färg i tyget)", "Tjockare plastkänsla"],
            ["Tvätthållbarhet", "Mycket god (40 °C)", "Mycket god", "God, kan spricka med tiden"],
            ["Namn & nummer individuellt", "Ja, utan extra kostnad", "Nej (ny schablon per variant)", "Ja, men handarbete"],
          ],
        },
      },
      {
        h2: "När ska du välja vad?",
        paragraphs: [],
        list: [
          "Välj DTF när du beställer 1–100 plagg, har ett motiv i flera färger eller med detaljer/foton, eller behöver individuella namn och nummer. Det är därför Snabbtryck använder DTF.",
          "Välj screentryck när du beställer många hundra plagg med samma enkla motiv och styckpriset är viktigast.",
          "Välj vinyl för enstaka plagg med enkel text i en färg — eller reflextryck, som är vinylens styrka.",
        ],
      },
      {
        h2: "Vanliga missuppfattningar",
        paragraphs: [
          "\"Digitalt tryck bleknar snabbt\" — det gällde äldre direkttryck (DTG) på mörka plagg. Modernt DTF-tryck har mycket god tvätthållbarhet och spricker inte vid normal användning.",
          "\"Screentryck är alltid bäst kvalitet\" — screentryck ger den mjukaste ytan, men klarar inte fotorealistiska motiv eller gradienter lika bra som DTF, och blir oproportionerligt dyrt i små upplagor.",
        ],
      },
    ],
    faq: [
      { q: "Vad är skillnaden mellan DTF och DTG?", a: "DTG (Direct-to-Garment) skriver ut direkt på plagget och kräver förbehandlad bomull. DTF skriver ut på en film som pressas på plagget — det fungerar på fler material (bomull, polyester, blandningar) och ger starkare färger på mörka plagg." },
      { q: "Håller DTF-tryck i tvätten?", a: "Ja. DTF-tryck klarar maskintvätt i 40 grader utan att blekna eller spricka vid normal användning. Tvätta plagget ut och in och undvik torktumlare så håller trycket längst." },
      { q: "Varför är screentryck dyrt för små upplagor?", a: "Varje färg i motivet kräver en egen schablon som måste tillverkas innan tryckningen — ofta 300–900 kr per färg i uppläggsavgift. För 5 tröjor blir startkostnaden större än plaggen. DTF har ingen startkostnad alls." },
      { q: "Vilken metod är bäst för lagtröjor med namn och nummer?", a: "DTF — varje plagg skrivs ut individuellt, så olika namn och nummer kostar inget extra. Med screentryck skulle varje variant kräva en egen schablon." },
    ],
    related: [
      { label: "Vad kostar det att trycka tröjor?", href: "/guider/vad-kostar-det-att-trycka-trojor" },
      { label: "Så tvättar du tryckta kläder", href: "/guider/tvatta-tryckta-klader" },
      { label: "Så funkar det", href: "/sa-funkar-det" },
    ],
    cta: { label: "Testa DTF-tryck själv", href: "/designa" },
  },
  {
    slug: "tvatta-tryckta-klader",
    metaTitle: "Tvätta tryckta kläder – så håller trycket längst | Snabbtryck",
    metaDescription:
      "Skötselråd för DTF-tryckta kläder: tvätta i max 40 °C ut och in, undvik torktumlare och stryk aldrig direkt på trycket. Hela guiden för tryck som håller.",
    h1: "Så tvättar du tryckta kläder",
    intro:
      "Ett DTF-tryck håller genom plaggets hela livslängd — om det sköts rätt. Reglerna är enkla: skonsam tvätt, ingen torktumlare och aldrig ett strykjärn direkt på trycket.",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    sections: [
      {
        h2: "Fem regler för tryck som håller",
        paragraphs: [],
        list: [
          "Tvätta i max 40 °C — gärna 30 °C. Höga temperaturer sliter på tryckets vidhäftning.",
          "Vänd plagget ut och in före tvätt. Det skyddar tryckytan från nötning mot andra plagg.",
          "Hoppa över torktumlaren. Värmen och nötningen i en tumlare är det som sliter mest på alla typer av tryck — hängtorka i stället.",
          "Stryk aldrig direkt på trycket. Behöver plagget strykas: vänd det ut och in eller lägg en bakplåtspappersliknande skyddsduk emellan, och använd låg värme.",
          "Undvik kemtvätt och blekmedel. Vanligt tvättmedel fungerar bra; sköljmedel behövs inte och kan påverka vidhäftningen över tid.",
        ],
      },
      {
        h2: "Första tvätten",
        paragraphs: [
          "Vänta gärna 24 timmar efter att du fått plagget innan första tvätten, så att trycket är helt härdat. Tvätta sedan enligt reglerna ovan — trycket tål maskintvätt från dag ett, men försiktighet i början förlänger livslängden.",
        ],
      },
      {
        h2: "Hur länge håller ett DTF-tryck?",
        paragraphs: [
          "Med rätt skötsel håller ett DTF-tryck normalt 50+ tvättar utan att blekna, spricka eller släppa — i praktiken plaggets livslängd. DTF-film är dessutom elastisk, så trycket följer med när tyget sträcks i stället för att spricka, vilket gör det lämpligt även för träningskläder.",
        ],
      },
      {
        h2: "Om trycket ändå släpper",
        paragraphs: [
          "Ett tryck som bubblar eller släpper i kanterna efter få tvättar är ett produktionsfel, inte något du orsakat. Kontakta oss på hej@snabbtryck.se med en bild så trycker vi om plagget.",
        ],
      },
    ],
    faq: [
      { q: "Kan man torktumla tryckta kläder?", a: "Undvik det. Torktumlarens värme och nötning är den vanligaste orsaken till att tryck spricker eller släpper i förtid. Hängtorka i stället — plaggen torkar över natten." },
      { q: "Vilken temperatur ska man tvätta tryckta tröjor i?", a: "Max 40 °C, gärna 30 °C, med plagget vänt ut och in. Det gäller DTF-tryck och de flesta andra tryckmetoder." },
      { q: "Kan man stryka en tröja med tryck?", a: "Ja, men aldrig direkt på trycket. Vänd plagget ut och in eller lägg en skyddsduk över trycket, och stryk på låg värme." },
      { q: "Hur många tvättar håller ett DTF-tryck?", a: "Normalt 50+ maskintvättar med rätt skötsel — i praktiken hela plaggets livslängd. Trycket är elastiskt och spricker inte när tyget sträcks." },
    ],
    related: [
      { label: "DTF-tryck vs screentryck", href: "/guider/dtf-tryck-vs-screentryck" },
      { label: "Designa din egen tröja", href: "/designa" },
    ],
    cta: { label: "Designa ett plagg som håller", href: "/designa" },
  },
  {
    slug: "basta-filformatet-for-tryck",
    metaTitle: "Bästa filformatet för tryck på kläder: PNG, SVG eller JPG? | Snabbtryck",
    metaDescription:
      "PNG med transparent bakgrund är bäst för tryck på kläder. SVG skalar perfekt för loggor, JPG funkar för foton. Så väljer du rätt format och upplösning (300 DPI).",
    h1: "Bästa filformatet för tryck på kläder",
    intro:
      "Kort svar: PNG med transparent bakgrund för de flesta motiv, SVG för loggor, JPG bara för foton. Och sikta på 300 DPI i tryckstorleken — verktyget varnar automatiskt om upplösningen är för låg.",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    sections: [
      {
        h2: "Formaten i korthet",
        paragraphs: [],
        table: {
          caption: "Filformat för tryck",
          headers: ["Format", "Bäst för", "Transparent bakgrund", "Skalbart"],
          rows: [
            ["PNG", "Loggor, illustrationer, det mesta", "Ja", "Nej — upplösningen avgör"],
            ["SVG", "Loggor och grafik i vektorformat", "Ja", "Ja — oändligt utan kvalitetsförlust"],
            ["JPG", "Fotografier", "Nej — alltid en rektangulär bakgrund", "Nej"],
          ],
        },
      },
      {
        h2: "Varför transparent bakgrund spelar roll",
        paragraphs: [
          "Ett tryck skrivs ut exakt som filen ser ut. En JPG av din logga har alltid en vit (eller färgad) rektangel bakom sig — och den rektangeln trycks med på plagget. En PNG eller SVG med transparent bakgrund trycker bara själva motivet.",
          "Har du bara en JPG? Snabbtrycks designverktyg har inbyggd bakgrundsborttagning — ladda upp bilden och ta bort bakgrunden med ett klick.",
        ],
      },
      {
        h2: "Upplösning: 300 DPI är målet",
        paragraphs: [
          "DPI (dots per inch) avgör hur skarpt trycket blir. 300 DPI i den storlek motivet trycks ger skarpt resultat; 150–300 DPI är godkänt för de flesta motiv; under 150 DPI blir trycket synbart suddigt.",
          "Praktiskt exempel: en bild på 1200×1200 pixlar håller 300 DPI upp till ca 10×10 cm tryckstorlek, och 150 DPI upp till ca 20×20 cm. Designverktyget räknar ut detta åt dig och varnar direkt om din bild är för liten för den valda tryckstorleken.",
        ],
      },
      {
        h2: "Checklista innan du laddar upp",
        paragraphs: [],
        list: [
          "Använd originalfilen, inte en skärmdump eller en bild hämtad från en webbsida (de är ofta komprimerade och små).",
          "Har din logga en egen \"tryckfil\" från en designer? Det är oftast en PNG eller SVG med transparent bakgrund — använd den.",
          "Kontrollera att inget viktigt ligger precis i kanten av bilden; lämna lite luft runt motivet.",
          "Ladda upp och lita på DPI-kontrollen — grönt betyder skarpt tryck.",
        ],
      },
    ],
    faq: [
      { q: "Vilket filformat är bäst för tryck på tröjor?", a: "PNG med transparent bakgrund är bäst för de flesta motiv. SVG är ännu bättre för loggor eftersom vektorformat skalar utan kvalitetsförlust. JPG fungerar för foton men har alltid en bakgrund som trycks med." },
      { q: "Vilken upplösning behöver bilden ha?", a: "Sikta på 300 DPI i tryckstorleken — t.ex. minst 1200×1200 pixlar för ett 10×10 cm-tryck. Snabbtrycks verktyg varnar automatiskt om upplösningen är för låg för den storlek du valt." },
      { q: "Kan jag ta bort bakgrunden från min bild?", a: "Ja — designverktyget har inbyggd bakgrundsborttagning. Ladda upp en JPG eller PNG med bakgrund och ta bort den med ett klick, direkt i webbläsaren." },
      { q: "Fungerar en skärmdump av loggan?", a: "Oftast dåligt — skärmdumpar är lågupplösta och har bakgrund. Be om originalfilen (PNG/SVG) eller använd verktygets bakgrundsborttagning och DPI-kontroll för att se om kvaliteten räcker." },
    ],
    related: [
      { label: "Så funkar det", href: "/sa-funkar-det" },
      { label: "Vad kostar det att trycka tröjor?", href: "/guider/vad-kostar-det-att-trycka-trojor" },
    ],
    cta: { label: "Ladda upp din design", href: "/designa" },
  },
  {
    slug: "trycka-trojor-till-laget",
    metaTitle: "Trycka tröjor till laget – komplett guide för lag & föreningar | Snabbtryck",
    metaDescription:
      "Så beställer du lagtröjor med namn och nummer: samla in storlekar, designa en gång, få volympris direkt. Från 141 kr/st vid 10+ tröjor, levererat inom 48 timmar.",
    h1: "Trycka tröjor till laget — så gör du",
    intro:
      "Lagtröjor brukar betyda en kalkyl i Excel, jagande efter storlekar och en faktura ingen vill äga. Så här gör du i stället: designa en gång, låt spelarna fylla i sina egna uppgifter och få volympris på hela beställningen direkt.",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    sections: [
      {
        h2: "Steg 1: Designa tröjan en gång",
        paragraphs: [
          "Ladda upp klubbloggan i designverktyget, välj plagg och färg och placera loggan — på bröstet, ryggen eller båda. Namn och nummer läggs till per spelare i nästa steg, så designen behöver bara göras en gång.",
        ],
      },
      {
        h2: "Steg 2: Samla in namn, nummer och storlekar",
        paragraphs: [
          "I lagbeställningen lägger du in hela truppen på en gång: namn, nummer och storlek per spelare. Slipp jaga svar — skicka insamlingslänken till laget så fyller varje spelare i sina egna uppgifter, och du ser i realtid vilka som svarat.",
        ],
      },
      {
        h2: "Steg 3: Volympriset räknas ut direkt",
        paragraphs: [
          "Rabatten räknas på hela beställningen, även om tröjorna har olika storlekar, namn och nummer. Individuella tryck kostar inget extra — varje plagg skrivs ut för sig med DTF.",
        ],
        table: {
          caption: "Exempel: t-shirt med klubblogga på bröstet (172 kr styck)",
          headers: ["Antal", "Rabatt", "Pris per tröja", "Totalt"],
          rows: [
            ["5", "10 %", "155 kr", "775 kr"],
            ["10", "18 %", "141 kr", "1 410 kr"],
            ["15", "18 %", "141 kr", "2 115 kr"],
            ["25", "25 %", "129 kr", "3 225 kr"],
          ],
        },
      },
      {
        h2: "Steg 4: Leverans inom 48 timmar",
        paragraphs: [
          "Beställningen trycks och skickas inom 48 timmar — matchställ till helgen går att ordna om beställningen läggs i början av veckan. Frakten är gratis över 800 kr, vilket en beställning på 10+ tröjor alltid når.",
        ],
      },
      {
        h2: "För föreningar: öppna en klubbutik",
        paragraphs: [
          "Beställer klubben flera gånger per säsong? Med en klubbutik får föreningen en egen sida där medlemmarna själva beställer klubbens plagg med rätt tryck — nya spelare köper sin tröja direkt, utan att någon lagförälder behöver samla ihop beställningar.",
        ],
      },
    ],
    faq: [
      { q: "Kan varje spelare ha eget namn och nummer?", a: "Ja — varje plagg trycks individuellt med DTF, så olika namn och nummer kostar inget extra. Du lägger in hela truppen i lagbeställningen eller låter spelarna fylla i själva via en insamlingslänk." },
      { q: "Vad kostar lagtröjor med tryck?", a: "En t-shirt med klubblogga kostar 172 kr styck, och vid 10 eller fler sjunker priset till 141 kr styck (18 % rabatt). Vid 25+ blir det 129 kr styck. Namn och nummer ingår utan extra kostnad." },
      { q: "Måste alla tröjor ha samma storlek eller färg?", a: "Nej — blanda storlekar fritt, och rabatten räknas ändå på hela antalet. Olika färger går också bra så länge designen är densamma." },
      { q: "Hinner tröjorna fram till helgens match?", a: "Vi trycker och skickar inom 48 timmar. Beställ senast måndag–tisdag så hinner tröjorna normalt fram till helgen med postombud (2–4 dagar)." },
      { q: "Kan föreningen betala mot faktura?", a: "Ja — med ett företagskonto (fungerar även för föreningar) betalar ni mot faktura med 30 dagars villkor." },
    ],
    related: [
      { label: "Starta lagbeställning", href: "/lag" },
      { label: "Föreningströjor", href: "/for/foreningstrojor" },
      { label: "Klubbutiker", href: "/butik" },
      { label: "Vad kostar det att trycka tröjor?", href: "/guider/vad-kostar-det-att-trycka-trojor" },
    ],
    cta: { label: "Starta lagbeställning", href: "/lag" },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
