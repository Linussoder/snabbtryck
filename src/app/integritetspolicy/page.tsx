import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Integritetspolicy | Snabbtryck",
  description: "Så samlar Snabbtryck in, använder och skyddar dina personuppgifter enligt GDPR — och dina rättigheter.",
  alternates: { canonical: "/integritetspolicy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="head text-lg uppercase">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function Integritetspolicy() {
  return (
    <PageShell>
      <PageHead index="JURIDIK" title="Integritetspolicy" sub="Hur vi hanterar dina personuppgifter enligt dataskyddsförordningen (GDPR)." />

      <div className="mx-auto max-w-[760px] space-y-8 px-4 py-12 md:px-8">
        <p className="spec text-[11px] text-muted">Senast uppdaterad: 2026-07-07</p>

        <Section title="Personuppgiftsansvarig">
          <p>
            <strong>Söderstjerna Fastigheter AB</strong>, org.nr <strong>559242-2629</strong>, Kvartsgatan 2, 267 35 Bjuv,
            driver Snabbtryck (snabbtryck.se) och ansvarar för behandlingen av dina personuppgifter. Kontakt:
            <a href="mailto:hej@snabbtryck.se" className="link-underline"> hej@snabbtryck.se</a>.
          </p>
        </Section>

        <Section title="Vilka uppgifter vi samlar in">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Konto:</strong> namn, e-postadress, lösenord (krypterat), samt företagsnamn och org.nr om du har företagskonto.</li>
            <li><strong>Beställningar:</strong> leverans- och kontaktuppgifter, orderrader, belopp och din design.</li>
            <li><strong>Sparade designer</strong> som du skapar i verktyget.</li>
            <li><strong>Teknisk data</strong> som krävs för inloggning (nödvändiga cookies/sessioner).</li>
            <li><strong>Prisförfrågningar (leads)</strong> om du använder priskalkylatorn.</li>
          </ul>
        </Section>

        <Section title="Varför och med vilken laglig grund">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Fullgöra köp och leverans</strong> — laglig grund: avtal.</li>
            <li><strong>Konto och sparade designer</strong> — avtal / berättigat intresse.</li>
            <li><strong>Order- och statusmejl</strong> — avtal.</li>
            <li><strong>Bokföring av ordrar och fakturor</strong> — rättslig förpliktelse (bokföringslagen).</li>
            <li><strong>Marknadsföringsmejl</strong> — endast med ditt <strong>samtycke</strong> (opt-in), som du när som helst kan återkalla.</li>
          </ul>
        </Section>

        <Section title="Hur länge vi sparar">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Konto och sparade designer:</strong> tills du raderar dem eller ditt konto.</li>
            <li><strong>Order- och fakturaunderlag:</strong> 7 år efter räkenskapsårets slut (bokföringslagen), därefter gallras det.</li>
            <li>När du raderar ditt konto tas konto, profil och designer bort, medan lagda ordrar behålls anonymt för bokföring.</li>
          </ul>
        </Section>

        <Section title="Vilka vi delar med (personuppgiftsbiträden)">
          <p>Vi säljer aldrig dina uppgifter. Vi använder betrodda leverantörer som behandlar data åt oss, inom EU/EES:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> — databas, konton och lagring (EU, Irland).</li>
            <li><strong>Vercel</strong> — drift av webbplatsen.</li>
            <li><strong>Resend</strong> — utskick av order- och kontomejl (EU, Irland).</li>
          </ul>
          <p>Databehandlaravtal (DPA) finns med respektive leverantör.</p>
        </Section>

        <Section title="Cookies">
          <p>
            Vi använder endast <strong>nödvändiga cookies</strong> för inloggning och grundläggande funktion — dessa kräver inte samtycke.
            Vi använder i dagsläget inga tredjeparts spårnings- eller annonscookies. Skulle vi införa analys- eller marknadsföringscookies
            inhämtar vi ditt samtycke först.
          </p>
        </Section>

        <Section title="Dina rättigheter">
          <p>Enligt GDPR har du rätt att:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>få <strong>tillgång till</strong> och en <strong>kopia</strong> av dina uppgifter (dataportabilitet),</li>
            <li>få felaktiga uppgifter <strong>rättade</strong>,</li>
            <li>få dina uppgifter <strong>raderade</strong> ("rätten att bli glömd"),</li>
            <li><strong>invända mot</strong> eller <strong>begränsa</strong> behandling,</li>
            <li><strong>återkalla samtycke</strong> till marknadsföring när som helst.</li>
          </ul>
          <p>
            Det mesta sköter du själv på <Link href="/konto" className="link-underline">Mitt konto</Link> — där kan du redigera uppgifter,
            ladda ner all din data, styra marknadsföringssamtycke och radera ditt konto. Du kan också mejla oss.
          </p>
        </Section>

        <Section title="Säkerhet">
          <p>
            Uppgifter skyddas med kryptering under överföring, åtkomststyrning på radnivå (RLS) och lösenordskryptering.
            Vid en personuppgiftsincident som riskerar dina rättigheter anmäler vi till Integritetsskyddsmyndigheten (IMY) inom 72 timmar.
          </p>
        </Section>

        <Section title="Klagomål">
          <p>
            Är du missnöjd med hur vi hanterar dina uppgifter kan du vända dig till tillsynsmyndigheten
            <strong> Integritetsskyddsmyndigheten (IMY)</strong>, imy.se.
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
