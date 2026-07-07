# Registerförteckning – behandling av personuppgifter

*Enligt artikel 30 i dataskyddsförordningen (GDPR). Internt dokument – ska hållas uppdaterat och kunna visas för Integritetsskyddsmyndigheten (IMY) på begäran.*

**Senast uppdaterad:** 2026-07-07

## Personuppgiftsansvarig
- **Företag:** Söderstjerna Fastigheter AB
- **Org.nr:** 559242-2629
- **Adress:** Kvartsgatan 2, 267 35 Bjuv
- **Kontakt i dataskyddsfrågor:** hej@snabbtryck.se
- **Verksamhet:** Snabbtryck (snabbtryck.se) – DTF-tryck på kläder, designverktyg och e-handel.

*(Dataskyddsombud (DPO) krävs sannolikt inte för denna verksamhet, men utvärdera vid ökad omfattning.)*

## Behandlingar

### 1. Kundkonton
- **Ändamål:** Skapa och hantera konto, spara designer, hantera ordrar.
- **Laglig grund:** Avtal (art. 6.1 b) samt berättigat intresse.
- **Registrerade:** Privatpersoner och företagskontakter som registrerar konto.
- **Kategorier av uppgifter:** Namn, e-post, krypterat lösenord, ev. företagsnamn och org.nr, marknadsföringssamtycke.
- **Lagringstid:** Tills användaren raderar sitt konto (självbetjäning under Mitt konto).
- **Mottagare:** Supabase (databas/auth).

### 2. Beställningar och betalning
- **Ändamål:** Genomföra köp, produktion, leverans och kundservice.
- **Laglig grund:** Avtal (art. 6.1 b); bokföring – rättslig förpliktelse (art. 6.1 c, bokföringslagen).
- **Registrerade:** Kunder.
- **Kategorier:** Namn, adress, e-post, orderrader, belopp, designfiler, fraktuppgifter, betalstatus.
- **Lagringstid:** Order- och fakturaunderlag 7 år (bokföringslagen). Vid kontoradering frikopplas ordern från kontot men behålls anonymiserad för bokföring.
- **Mottagare:** Supabase (lagring), betalleverantör (vid aktivering), fraktleverantör (vid aktivering).

### 3. Transaktions- och kontomejl
- **Ändamål:** Orderbekräftelse, statusuppdatering, kontomejl (lösenordsåterställning, e-postbyte).
- **Laglig grund:** Avtal (art. 6.1 b).
- **Kategorier:** Namn, e-post, orderreferens.
- **Lagringstid:** Enligt leverantörens loggar (Resend), i övrigt ingen separat lagring.
- **Mottagare:** Resend (utskick).

### 4. Marknadsföringsmejl
- **Ändamål:** Erbjudanden, nyheter, påminnelse om sparad design.
- **Laglig grund:** Samtycke (art. 6.1 a) – uttrycklig opt-in.
- **Kategorier:** Namn, e-post, samtyckesstatus.
- **Lagringstid:** Tills samtycket återkallas (avprenumerera-länk i varje utskick eller under Mitt konto).
- **Mottagare:** Resend.

### 5. Prisförfrågningar (leads)
- **Ändamål:** Ge prisuppskattning och följa upp förfrågan.
- **Laglig grund:** Berättigat intresse / samtycke.
- **Kategorier:** E-post, plaggval, uppskattat belopp.
- **Lagringstid:** Tills uppföljning är klar eller på begäran; se över regelbundet.
- **Mottagare:** Supabase.

## Personuppgiftsbiträden (underleverantörer)
| Biträde | Ändamål | Plats | Överföring 3:e land | DPA |
|---|---|---|---|---|
| Supabase | Databas, konton, lagring | EU (Irland) | Nej | Ja – acceptera i dashboard |
| Vercel | Webbhotell/drift | EU-region | Kontrollera regioninställning | Ja |
| Resend | E-postutskick | EU (Irland) | Nej | Ja |

## Tekniska och organisatoriska säkerhetsåtgärder
- Åtkomststyrning på radnivå (Row Level Security) i databasen.
- Kryptering under överföring (HTTPS/TLS) och krypterade lösenord.
- Administratörsåtkomst begränsad till behöriga konton.
- Automatiskt genererade tryckfiler i privat lagringsyta (signerade, tidsbegränsade länkar).
- Rutin för personuppgiftsincident (se incidentrutin.md).

## Registrerades rättigheter – hur de tillgodoses
Åtkomst/portabilitet, rättelse, radering och återkallat samtycke sköts i självbetjäning under **Mitt konto** (/konto), eller via hej@snabbtryck.se. Se integritetspolicyn på snabbtryck.se/integritetspolicy.
