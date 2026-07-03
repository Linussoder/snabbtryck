# Snabbtryck — riktig backend (Supabase) + admin

**Datum:** 2026-07-03
**Status:** Design godkänd, väntar på implementationsplan
**Omfattning:** Flytta plattformen från en `localStorage`-prototyp till en produktionsbackend med Supabase (Postgres + Auth + Storage), server-side order-intag och en skyddad admin-panel. Infra: privat GitHub-repo + Vercel med auto-deploy.

---

## 1. Bakgrund & nuläge

Idag är hela "backenden" webbläsarens `localStorage`:

- [src/lib/account.ts](../../../src/lib/account.ts) håller konton, designs, ordrar, varukorg och delade länkar — allt client-side.
- Ordrar "kommer in" genom att `createOrder()` körs i kundens webbläsare i kassan ([src/app/kassa/page.tsx](../../../src/app/kassa/page.tsx)). Inget lämnar datorn.
- Admin = endast [/admin/marginal](../../../src/app/admin/marginal/page.tsx), som läser samma `localStorage` och därför bara ser ordrar lagda i *samma* webbläsare.
- API-rutterna [/api/lead](../../../src/app/api/lead/route.ts) och [/api/email/abandoned](../../../src/app/api/email/abandoned/route.ts) är stubbar som bara loggar.
- Inloggning ([src/app/logga-in/page.tsx](../../../src/app/logga-in/page.tsx)) är en demo som skriver ett objekt till `localStorage`.
- Bildmaterial lagras som base64 data-URL:er inne i design-elementen (`ImageEl.src`), vilket gör snapshots flera MB stora.

**Viktig observation:** Kassans leverans-/kontaktfält (`Field`-komponenterna) har idag ingen state och sparas inte — de är rena demo-fält. Order-intaget måste därför även börja *fånga* kontakt- och fraktuppgifter, inte bara persistera dem.

## 2. Mål

1. Ordrar sparas server-side i Postgres, kopplade till kund (`user_id`), synliga för admin på valfri enhet.
2. Riktig inloggning för både kund och admin via Supabase Auth (magic link).
3. Skyddad admin-panel för att lista/söka/filtrera ordrar och ändra orderstatus.
4. Grafik lagras som riktiga filer i Supabase Storage; tryckeriet kan ladda ner original för tryck.
5. Sparade designer synkas till DB (tillgängliga på alla enheter för inloggad kund).
6. Kodbasen på privat GitHub-repo, Vercel auto-deployar från `main`, PR ger preview-URL.

**Icke-mål (uttalat senare):** Riktig betalning (Stripe/Swish/faktura) förblir demo. Resend-utskick och n8n-flöden kopplas i separat steg (stubbarna dokumenterar var).

## 3. Arkitekturöversikt

**Stack som tillkommer**
- `@supabase/supabase-js` + `@supabase/ssr` — rätt mönster för Next.js 16 App Router: separata klienter för webbläsare, server components/route handlers och middleware (session-refresh via cookies).
- Supabase-projekt "Snabbtryck" (ny, org `padelstarsweden`, region `eu-west-1`).
- Privat GitHub-repo `snabbtryck` som origin.
- Vercel-projekt kopplat till repot.

> **Implementations-notis:** AGENTS.md säger att detta är en modifierad Next.js — läs relevant guide i `node_modules/next/dist/docs/` innan kod skrivs, särskilt för middleware, route handlers och server components. `@supabase/ssr`-mönstren måste matcha den faktiska API:n i denna Next-version, inte antaganden från träningsdata.

**Klient-topologi**
- `lib/supabase/client.ts` — browser-klient (anon key), för client components.
- `lib/supabase/server.ts` — server-klient bunden till request-cookies, för server components och route handlers.
- `lib/supabase/admin.ts` — service-role-klient (endast server, aldrig exponerad), för admin-operationer som kringgår RLS där det behövs.
- `middleware.ts` — refreshar Supabase-session och skyddar `/admin/*`.

## 4. Datamodell (Postgres)

Alla tabeller har RLS aktiverat. Tidsstämplar `created_at`/`updated_at` (`timestamptz default now()`).

**`profiles`** — 1:1 med `auth.users`
| kolumn | typ | not |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | |
| `name` | text | |
| `business` | boolean | företagskonto → priser exkl. moms |
| `company_name` | text null | |
| `org_nr` | text null | |
| `role` | text | `'customer'` \| `'admin'`, default `'customer'` |

Skapas via trigger `on auth.users insert`. Admin sätts genom att uppdatera `role` (seed via env-allowlist vid första inloggning, se §6).

**`designs`** — sparade utkast (motsvarar `DesignSnapshot`)
| kolumn | typ | not |
|---|---|---|
| `id` | text PK | behåller `dsn_*`-id från klienten |
| `user_id` | uuid FK profiles | |
| `name` | text | |
| `garment_id` | text | |
| `color_index` | int | |
| `size` | text | |
| `qty` | int | |
| `elements` | jsonb | bild-`src` = Storage-URL:er, inte base64 |
| `updated_at` | timestamptz | |

**`orders`** — immutabel orderpost
| kolumn | typ | not |
|---|---|---|
| `id` | text PK | `ord_*` |
| `ref` | text unik | kundvänligt `TR-######` |
| `user_id` | uuid FK profiles null | null = gäst (om vi tillåter gästköp senare) |
| `status` | text | `'Mottagen'` \| `'I tryck'` \| `'Skickad'` |
| `total` | int | **beräknas server-side** |
| `business` | boolean | |
| `contact` | jsonb | namn, e-post, adress, postnr, ort, ev. org.nr |
| `shipping` | jsonb | leveranssätt + fraktkostnad |
| `design` | jsonb | fryst snapshot vid köp |
| `lines` | jsonb | `OrderLine[]` (huvudplagg + addons) |

**`shared_designs`** — ersätter `localStorage`-delning för `/delad/[id]`
| `token` text PK | `design` jsonb | `created_at` |

**`leads`** — gör `/api/lead`-stubben riktig
| `id` uuid PK | `email` text | `garment_id` text | `qty` int | `estimate` int | `created_at` |

**Storage:** privat bucket `artwork`. Sökväg `artwork/{user_id}/{design_id}/{element_id}.png`. Läsning via signed URLs (giltiga i timmar) för kundens egen rendering; admin kan generera nedladdningslänk för original.

## 5. RLS-policyer (princip)

- `profiles`: SELECT/UPDATE endast egen rad (`id = auth.uid()`). Admin (`role = 'admin'`) SELECT alla.
- `designs`: full CRUD där `user_id = auth.uid()`. Admin SELECT alla.
- `orders`: kund SELECT där `user_id = auth.uid()`. INSERT sker via server (service-role eller policy med server-side prisvalidering). UPDATE (status) endast admin.
- `shared_designs`: SELECT publikt via token (ingen auth krävs för att öppna en delad länk), INSERT av inloggad ägare.
- `leads`: INSERT publikt (anon), SELECT endast admin.

Admin-kontroll i policyer via helper `is_admin()` (SQL-funktion som slår `profiles.role`).

## 6. Auth

- **Metod:** Supabase Auth, e-post magic link (OTP). Ersätter demo-login och `signIn/signOut/getAccount` i `account.ts`.
- **`logga-in`-sidan** byggs om: skickar magic link, hanterar callback, skapar/uppdaterar `profiles` (namn, business, företag). "Fortsätt med Google" kan aktiveras som Supabase OAuth-provider senare (utanför denna omgång).
- **Admin-behörighet:** `profiles.role = 'admin'`. En env-variabel `ADMIN_EMAILS` (kommaseparerad allowlist) låter en profil-trigger/route sätta `role='admin'` vid inloggning för matchande e-post. Ingen självservice-admin.
- **Skydd:** `middleware.ts` blockerar `/admin/*` för icke-admin (redirect till `/logga-in?next=...`).
- **Session i UI:** [SiteHeader](../../../src/components/layout/SiteHeader.tsx) visar inloggad status från Supabase-session istället för `localStorage`.

## 7. Order kommer in (server-flöde)

1. I kassan trycker kund "Betala". Klienten:
   a. Laddar upp all grafik som ännu är base64 → Storage, byter `src` mot Storage-URL i snapshoten.
   b. Samlar nu **faktiska** kontakt-/fraktfält (kassan måste få state på dessa fält).
   c. `POST /api/orders` med `{ design, lines, contact, shipping }` — **inte** `total`.
2. Route handler (`/api/orders`):
   a. Läser session (kund eller gäst).
   b. **Räknar om pris/total server-side** med `lib/pricing.ts` (redan ren, körbar på servern) + fraktregel — litar aldrig på klienten.
   c. Genererar `ref` (`TR-######`), infogar `orders`-rad.
   d. Returnerar `{ id, ref }`.
3. `/order/[id]` blir server component: hämtar ordern från DB (RLS: ägare eller admin), renderar bekräftelse + status-timeline. "Simulera nästa status"-knappen tas bort i produktionsläge (status ändras nu i admin).
4. `/mina-skapelser` hämtar kundens ordrar + designer från DB.

**Prisintegritet:** total i DB kommer alltid från serverns omräkning. Om klientens uppskattning avviker loggas det men serverns värde gäller.

## 8. Admin-panel (Fas 2)

- **`/admin`** (skyddad): orderlista med statusfilter (Mottagen/I tryck/Skickad), sök på `ref`/e-post, sortering på datum. Radklick → orderdetalj.
- **Orderdetalj:** design-mockup, rader, kund/kontakt, totaler, statusväxlare (uppdaterar `orders.status`), nedladdning av original-grafik från Storage för tryck.
- **`/admin/marginal`** byts till att läsa `orders` från DB via server component istället för `localStorage`. Marginallogiken i [margin.ts](../../../src/lib/margin.ts) är oförändrad.
- Navigering: enkel admin-layout/shell runt `/admin/*`.

## 9. Infrastruktur

- **GitHub:** privat repo `snabbtryck`. Nuvarande lokala historik (`Initial commit`) pushas. `.env*` i `.gitignore` (verifieras).
- **Vercel:** projekt kopplat till repot via Vercel-GitHub-appen (auktoriseras i webbläsaren av användaren). `main` → produktion, PR → preview.
- **Env-variabler** (Vercel + lokal `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (endast server)
  - `ADMIN_EMAILS`
- Supabase Auth redirect-URL:er konfigureras för localhost + Vercel-domän(er).

## 10. Faser (bygg-ordning)

Varje fas får egen implementationsplan; leverar körbart tillstånd.

- **Fas 0 — Fundament & infra:** Skapa Supabase-projekt, GitHub-repo, Vercel-koppling, env-vars. Installera Supabase-klienter + middleware. Schema-migration (tabeller + RLS + trigger + Storage-bucket). Byt `localStorage`-auth mot Supabase Auth (logga-in + header-session).
- **Fas 1 — Order kommer in:** Storage-upload-pipeline. Kassan får state på kontakt/frakt. `POST /api/orders` med server-side prisberäkning. `order/[id]` + `mina-skapelser` läser DB. Designs-synk till DB.
- **Fas 2 — Admin-panel:** Skyddad `/admin` orderhantering + status + tryckfil-nedladdning. `/admin/marginal` läser DB. `shared_designs` + `leads` på riktigt.

## 11. Felhantering

- API-rutter: validera indata, returnera `{ ok:false, error }` med rätt statuskod (mönstret finns redan i stubbarna).
- Order-insert i transaktion; vid fel visas fel i kassan och varukorgen behålls (ingen `clearCart()` förrän servern bekräftat).
- Storage-upload-fel: blockera orderläggning med tydligt meddelande hellre än att spara en order utan grafik.
- Auth: middleware failar säkert (redirect till login) om session saknas/ogiltig.

## 12. Test / verifiering

- **Migration:** applicera på Supabase, verifiera tabeller + RLS med `list_tables`/`get_advisors` (säkerhets- och prestandaråd).
- **RLS-test:** kund A ser inte kund B:s ordrar; admin ser alla; anon kan öppna delad länk men inte lista ordrar.
- **Order-flöde end-to-end:** designa → kassa → order i DB → syns i `/mina-skapelser` och `/admin`.
- **Prisintegritet:** manipulerad klient-total ignoreras; serverns total gäller.
- **Deploy:** Vercel preview bygger grönt; env-vars lästa; auth-redirect fungerar mot preview-domän.

## 13. Öppna frågor (medvetet uppskjutna)

- Gästköp utan konto: schema tillåter `user_id null`, men UX beslutas i Fas 1.
- Riktig betalning (Stripe/Swish/faktura): separat projekt.
- Resend + n8n-automation: stubbarna pekar redan ut kopplingspunkterna.
- Bild-migrering av ev. befintliga base64-designer: ej relevant (ingen produktionsdata finns än).
