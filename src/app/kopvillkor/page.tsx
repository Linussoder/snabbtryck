import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Köpvillkor | Snabbtryck",
  description: "Villkor för beställning, betalning, leverans, reklamation och ångerrätt hos Snabbtryck.",
  alternates: { canonical: "/kopvillkor" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="head text-lg uppercase">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function Kopvillkor() {
  return (
    <PageShell>
      <PageHead index="JURIDIK" title="Köpvillkor" sub="Villkoren som gäller när du handlar hos Snabbtryck." />

      <div className="mx-auto max-w-[760px] space-y-8 px-4 py-12 md:px-8">
        <p className="spec text-[11px] text-muted">Senast uppdaterad: 2026-07-09</p>

        <Section title="Säljare">
          <p>
            <strong>Söderstjerna Fastigheter AB</strong>, org.nr <strong>559242-2629</strong>, Kvartsgatan 2, 267 35 Bjuv,
            driver Snabbtryck (snabbtryck.se). Kontakt:{" "}
            <a href="mailto:hej@snabbtryck.se" className="link-underline">hej@snabbtryck.se</a>.
            Alla priser anges i svenska kronor (SEK) inklusive 25 % moms för privatpersoner. Företag med
            faktura ser priser exklusive moms.
          </p>
        </Section>

        <Section title="Beställning och avtal">
          <p>
            Avtal ingås när du slutför din beställning och vi bekräftar den via e-post. Genom att beställa
            intygar du att du har rätt att använda de bilder, loggor och texter du laddar upp och att materialet
            inte gör intrång i tredje parts rättigheter eller strider mot lag. Vi förbehåller oss rätten att neka
            en order med olämpligt eller olagligt innehåll.
          </p>
        </Section>

        <Section title="Priser och betalning">
          <ul className="list-disc space-y-1 pl-5">
            <li>Priset beror på plagg, tryckytans storlek och antal, och visas live i designverktyget.</li>
            <li>Betalning sker med de metoder som visas i kassan (t.ex. Swish, kort eller faktura för företag).</li>
            <li>Faktura till företag betalas inom 14 dagar om inget annat avtalats.</li>
          </ul>
        </Section>

        <Section title="Leverans">
          <p>
            Beställningar trycks och skickas normalt inom 48 timmar. Leveranstiden tillkommer beroende på
            fraktsätt. Vi skickar spårningsinformation via e-post när ordern lämnat oss. Skulle en leverans bli
            väsentligt försenad kontaktar vi dig.
          </p>
        </Section>

        <Section title="Ångerrätt">
          <p>
            Enligt lagen om distansavtal har du som konsument normalt 14 dagars ångerrätt. <strong>Ångerrätten
            gäller dock inte varor som tillverkats enligt dina anvisningar eller som har en tydlig personlig
            prägel</strong> (lag (2005:59) om distansavtal och avtal utanför affärslokaler, 2 kap. 11 §). Eftersom
            våra plagg trycks specifikt efter din design är de sådana specialtillverkade varor, och ångerrätt
            gäller därför inte för genomförda tryckbeställningar.
          </p>
          <p>
            Har du inte ännu skickat en design till tryck, eller gäller det ett standardplagg utan tryck, kontakta
            oss så hjälper vi dig — då kan ångerrätt gälla enligt lag.
          </p>
        </Section>

        <Section title="Reklamation och fel i vara">
          <p>
            Du har rätt att reklamera fel enligt konsumentköplagen (för konsumenter) i upp till tre år. Är trycket
            eller plagget felaktigt — t.ex. fel tryck mot godkänd design, tryckfel eller materialfel — kontakta oss
            på <a href="mailto:hej@snabbtryck.se" className="link-underline">hej@snabbtryck.se</a> så snart du
            upptäcker felet, gärna med foto. Vi rättar till fel som beror på oss genom omtryck eller återbetalning.
            Fel som beror på materialet du laddat upp (t.ex. för låg upplösning trots DPI-varning) omfattas inte.
          </p>
        </Section>

        <Section title="Om något blir fel med din design">
          <p>
            Du godkänner din design och tryckmått i verktyget innan beställning. Vi trycker exakt det du skickar in.
            Kontrollera därför stavning, färger och placering noga — vi ansvarar inte för fel i det underlag du
            själv skapat och godkänt.
          </p>
        </Section>

        <Section title="Tvist">
          <p>
            Vi följer Allmänna reklamationsnämndens (ARN) rekommendationer. Kan vi inte komma överens kan du som
            konsument vända dig till <strong>ARN</strong> (arn.se) eller EU:s onlineplattform för tvistlösning
            (ec.europa.eu/consumers/odr). Tvist prövas annars av allmän domstol enligt svensk rätt.
          </p>
        </Section>

        <Section title="Personuppgifter">
          <p>
            Hur vi behandlar dina personuppgifter beskrivs i vår{" "}
            <Link href="/integritetspolicy" className="link-underline">integritetspolicy</Link>.
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
