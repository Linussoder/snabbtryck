# Rutin vid personuppgiftsincident

*Internt dokument. En personuppgiftsincident är en säkerhetsincident som leder till oavsiktlig eller olaglig förstöring, förlust, ändring eller obehörigt röjande av/åtkomst till personuppgifter.*

**Ansvarig:** Söderstjerna Fastigheter AB (org.nr 559242-2629). Kontakt: hej@snabbtryck.se
**Senast uppdaterad:** 2026-07-07

## Exempel på incidenter
- Obehörig åtkomst till databasen eller ett adminkonto.
- Läckt eller stulen API-nyckel / lösenord.
- Felaktig delning av kunduppgifter (t.ex. fel mottagare).
- Förlust av data utan säkerhetskopia.
- Sårbarhet som exponerat uppgifter (t.ex. felkonfigurerad åtkomst).

## Steg-för-steg

### 1. Upptäck & rapportera (omedelbart)
Den som upptäcker en misstänkt incident meddelar ansvarig direkt (hej@snabbtryck.se). Notera tidpunkt och vad som observerats.

### 2. Begränsa skadan (inom timmar)
- Återkalla/rotera komprometterade nycklar och lösenord (Supabase, Resend, Vercel, admin).
- Stäng av berörda konton eller åtkomster.
- Isolera det drabbade systemet om möjligt.

### 3. Utred & bedöm (inom 24 h)
Dokumentera: vad hände, när, vilka uppgifter och hur många personer berörs, hur allvarligt (risk för de registrerade). Använd Supabase-loggar (auth/postgres/storage) för att kartlägga.

### 4. Anmäl till IMY (inom 72 timmar)
Om incidenten sannolikt medför en risk för de registrerades rättigheter → anmäl till **Integritetsskyddsmyndigheten (IMY)** inom 72 timmar från upptäckt, via imy.se. Anmäl även om alla detaljer inte är klara – komplettera i efterhand. Om ingen risk föreligger: dokumentera bedömningen (varför anmälan inte gjordes).

### 5. Informera de drabbade (utan onödigt dröjsmål)
Om incidenten sannolikt medför **hög risk** (t.ex. läckta lösenord, känsliga uppgifter) → informera berörda personer direkt, i klarspråk: vad hänt, vilka uppgifter, vad de bör göra (t.ex. byta lösenord) och kontaktväg.

### 6. Dokumentera & åtgärda
- För in incidenten i incidentloggen nedan (även incidenter som inte anmäls).
- Genomför åtgärder som förhindrar upprepning (t.ex. nya rutiner, hårdare åtkomst).

## Incidentlogg
| Datum | Beskrivning | Berörda uppgifter/antal | Riskbedömning | Anmäld IMY (J/N) | Åtgärd |
|---|---|---|---|---|---|
| | | | | | |

## Viktiga kontakter
- **IMY:** imy.se (anmälan personuppgiftsincident)
- **Supabase support/status:** supabase.com/dashboard – status.supabase.com
- **Resend:** resend.com – support
- **Vercel:** vercel.com/help
