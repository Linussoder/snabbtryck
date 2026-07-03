# Claude Design-brief: Designa-din-egen-tröja-plattform

## Om projektet
Bygg en komplett visuell identitet och webbdesign för ett svenskt tryckeri (DTF-tryck) där kunder designar egna kläder direkt i webbläsaren. Kunden kan ladda upp en logga eller bild, skriva egen text (valfritt typsnitt, färg, rak eller böjd) och lägga till standard-emojis — och fritt kombinera alla tre element på valt plagg (t-shirt, hoodie, shorts, jacka, keps m.fl.). Kunden får pris uträknat i realtid, kan spara sina skapelser via konto och beställa direkt.

Målgrupp: privatpersoner, idrottslag/föreningar (padel, fotboll), småföretag och hantverkare i Sverige. Tonalitet: rak, självsäker, lite lekfull — aldrig stel eller "corporate". All copy på svenska.

## Varumärke

### Färger
- **Signal Orange** `#FF4D1C` — primär accentfärg, CTA-knappar, aktiva states, prisuppdateringar
- **Ink Black** `#0A0A0A` — primär text, mörka sektioner, footer
- **Paper White** `#F5F5F0` — bakgrund, ljusa ytor
- Komplettera med 2–3 neutrala grå-nyanser för borders, disabled states och sekundär text

### Typografi
- **Oswald** — rubriker, priser, knappar (versaler, tight tracking)
- **Inter** — brödtext, formulär, UI-element

### Känsla
Verkstad möter tech. Tänk bläck, tryckpress, precision — men i ett modernt, snabbt webbgränssnitt. Grafiska element får gärna referera till tryckprocessen: registreringsmärken, beskärningslinjer, cm-mått, halvtonsraster. Undvik generisk e-handelskänsla.

## Funktioner som ska synas i designen

1. **Live mockup-canvas** — Dra, skala och rotera bilder, texter och emojis direkt på plagget med markerade tryckytor (bröst, rygg, ärm) som guide-linjer.
2. **Automatisk kvalitetskontroll** — DPI beräknas mot vald tryckstorlek; tydlig grön/gul/röd-indikator med besked i stil med "Din bild blir suddig i 25 cm bredd — max rekommenderat 18 cm."
3. **AI-bakgrundsborttagning** — En knapp som tar bort bakgrunden på uppladdade bilder, med före/efter-förhandsvisning.
4. **Prisuträkning i realtid** — Plaggpris + tryckkostnad baserad på total tryckyta i cm² + antal med synlig mängdrabatt-trappa. Priset animeras när kunden ändrar något.
5. **Text- och emojiverktyg** — Egen text med typsnitt, färg och båge samt fullt emoji-bibliotek, kombinerbart med uppladdade bilder.
6. **Sparade skapelser + delbara länkar** — Konto där designs sparas, med delbar länk så t.ex. en lagkapten kan skicka designen för godkännande.
7. **Lagbeställningar med namn & nummer** — Ladda upp eller fyll i lista med namn/nummer per plagg, förhandsgranska hela laget, volympris.
8. **AI-designgenerator** — "Har du ingen bild? Beskriv din idé" — genererar tryckfärdig grafik direkt i verktyget.
9. **Automatiska mockup-foton** — Vid beställning genereras snygga produktbilder av kundens design som visas i orderbekräftelsen och kan delas på sociala medier.
10. **B2B-läge** — Företagskonto med offertförfrågan, priser exkl. moms, fakturabetalning och sparade företagsloggor.
11. **Sömlöst orderflöde** — Beställningen exporterar automatiskt tryckfärdig fil och går rakt in i produktionskön (syns för kunden som orderstatus: Mottagen → I tryck → Skickad).

## Sidor att designa

1. **Startsida** — Hero med interaktiv känsla ("Designa din tröja på 2 minuter"), plaggkategorier, hur-det-funkar i 3 steg (Ladda upp → Placera → Beställ), lagbeställnings-sektion, social proof.

2. **Designverktyget (viktigast!)** — Fullskärmslayout:
   - Vänster: plaggval (typ, färg, storlek), vy-växlare (fram/bak/ärm) samt verktygsflikar: **Bild** (ladda upp), **Text** och **Emoji**
   - Mitten: stor canvas med plagget där alla element (bilder, texter, emojis) kan dras/skalas/roteras fritt och lager-ordnas, tryckytans gränser markerade med streckade guide-linjer
   - Höger: prispanel som uppdateras live (plagg + total tryckyta i cm² + antal), kvalitetsvarning vid för låg upplösning, "Spara design" och "Lägg i varukorg"
   - **Textverktyget:** fritextfält, 10–15 utvalda typsnitt (blandning av kraftfulla display-fonter, script och rena sans-serifer), färgväljare, konturfärg, rak/böjd text (bågform för t.ex. ryggtryck), radavstånd
   - **Emojiverktyget:** sökbar väljare med alla standard-emojis (fulla Unicode-setet, renderade i hög upplösning för tryck), kategoriflikar och "senast använda"
   - Mobilanpassad variant med paneler som bottom sheets

3. **Mina skapelser** — Inloggat läge, grid med sparade designs som mockup-miniatyrer, knappar för redigera / duplicera / dela länk / beställ igen.

4. **Lagbeställning** — Flöde där man laddar upp namn- och nummerlista, förhandsgranskar alla plagg och får volympris.

5. **Kassa** — Enkel checkout: leverans, betalning (kort/Swish/faktura för företag), ordersammanfattning med mockup-bild av designen.

6. **Inloggning/registrering** — Minimal, med e-post + Google. Företagskonto som val (visar priser exkl. moms).

## Komponenter att ta fram
- Knappar (primär orange, sekundär outline, disabled)
- Prisdisplay med live-uppdateringsanimation
- Kvalitetsindikator för uppladdad bild (grön/gul/röd med DPI-info)
- Plaggväljarkort med färgswatchar
- Typsnittsväljare med live-förhandsvisning av kundens text
- Emoji-picker (sökfält, kategoriflikar, senast använda)
- Lagerpanel för elementens ordning (bild/text/emoji)
- Mockup-kort för sparade designs
- Varningar och toasts i varumärkets ton
- Steg-indikator för beställningsflödet

## Leverabler
1. Startsida (desktop + mobil)
2. Designverktyget (desktop + mobil)
3. Mina skapelser
4. Kassa
5. Komponentbibliotek/style guide-sida med färger, typografi och alla komponenter

## Avgränsningar
- Ingen engelska i UI-copy
- Inga stockfoto-klichéer (handskakningar, kontorsmänniskor)
- CTA-färgen är alltid Signal Orange — använd den sparsamt så den behåller sin kraft
- Priser visas alltid i SEK, inkl. moms som standard (exkl. moms i B2B-läge)
