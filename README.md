# TRYCK — Designa din egen tröja

En svensk DTF-tryckeri-plattform där kunder designar egna kläder direkt i webbläsaren.
Byggd med **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Zustand**.

Varumärke: _verkstad möter tech_ — Signal Orange `#FF4D1C`, Ink Black, Paper White,
Oswald + Inter + IBM Plex Mono, med motiv från tryckprocessen (registreringsmärken,
beskärningslinjer, cm-linjaler, halvtonsraster).

## Kom igång

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produktion
```

## Sidor

| Rutt | Innehåll |
|------|----------|
| `/` | Startsida — hero, plaggkategorier, 3 steg, features, lag, social proof |
| `/designa` | **Designverktyget** — canvas + Bild/Text/Emoji/Lager + live prispanel (mobil: bottom sheets) |
| `/stilguide` | Komponentbibliotek: färger, typografi, motiv, komponenter |
| `/mina-skapelser` | Sparade designs + orderhistorik (kräver inloggning) |
| `/lag` | Lagbeställning — namn/nummer-lista, förhandsgranska, volympris |
| `/kassa` | Checkout — leverans, betalning, ordersammanfattning med mockup |
| `/order/[id]` | Orderbekräftelse — auto-mockups + status (Mottagen → I tryck → Skickad) |
| `/logga-in` | Inloggning/registrering (e-post + Google), företagskonto |
| `/delad/[id]` | Delad design för godkännande (lagkapten-flöde) |

## Arkitektur

- `src/lib/` — logik & data: `garments`, `pricing`, `dpi`, `fonts`, `emoji`, `store` (Zustand-editor),
  `account` (localStorage-persistens), `mockup` (SVG-mockupgenerator), `bgremove`, `aigen`.
- `src/components/editor/` — canvas (`DesignCanvas`, `ElementVisual`) och verktygspaneler.
- `src/components/ui/`, `src/components/layout/`, `src/components/home/` — delade komponenter.

## Byggt på riktigt (kör i webbläsaren)

Designverktyg med äkta drag/skala/rotera, lager, böjd text, fullt emoji-bibliotek,
realtidspris med mängdrabatt, DPI-/kvalitetskontroll, **AI-bakgrundsborttagning**
(`@imgly/background-removal` med lokal fallback), konton, sparade skapelser, delbara
länkar, varukorg, kassa och orderstatus — allt via localStorage.

## Stubbat — koppla in senare (samma gränssnitt kvar)

- **AI-designgenerator** (`src/lib/aigen.ts`) — genererar demo-SVG. Byt `generateDesign()`
  mot en riktig bildmodell (t.ex. via Vercel AI Gateway), behåll retur `{ dataUrl, naturalW, naturalH }`.
- **Betalning** — Swish/kort simuleras i `/kassa`. Koppla Stripe/Swish i `placeOrder()`.
- **Konton & lagring** — localStorage via `src/lib/account.ts`. Byt mot riktig auth + DB
  (t.ex. Supabase) genom att implementera samma funktioner.
- **Produktionskö** — orderstatus lagras lokalt; koppla export av tryckfärdig fil + kö-API.

## Fas 2

Se separat idébacklog (övergiven design-mail, kassa-upsell, QR beställ igen,
bulkpris-kalkylator, marginal-dashboard, shop-in-shop).
