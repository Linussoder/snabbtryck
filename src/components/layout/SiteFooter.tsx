import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="panel-ink on-ink relative overflow-hidden">
      <div className="halftone halftone-signal absolute inset-x-0 top-0 h-24 opacity-20" />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="dark" size={22} />
            <p className="mt-4 max-w-xs text-sm text-paper/60 leading-relaxed">
              Designa din egen tröja i webbläsaren. Full färg, varje tryck —
              tryckt och skickat inom 48 timmar. Inga uppläggsavgifter, från 1 plagg.
            </p>
            <p className="eyebrow mt-5 text-paper/40">
              Sveavägen 00 · 113 00 Stockholm
            </p>
          </div>

          <FooterCol
            title="Skapa"
            links={[
              ["Designverktyget", "/designa"],
              ["Lagbeställning", "/lag"],
              ["Mina skapelser", "/mina-skapelser"],
            ]}
          />
          <FooterCol
            title="Använd till"
            links={[
              ["Föreningströjor", "/for/foreningstrojor"],
              ["Företagskläder", "/for/foretagsklader"],
              ["Eventkläder", "/for/eventklader"],
              ["Studentkläder", "/for/studentklader"],
            ]}
          />
          <FooterCol
            title="Företag"
            links={[
              ["Bulkpriskalkylator", "/bulkpris"],
              ["Klubbutiker", "/butik"],
              ["Så funkar det", "/sa-funkar-det"],
              ["Fakturabetalning", "/logga-in"],
            ]}
          />
          <FooterCol
            title="Kontakt"
            links={[
              ["Så funkar det", "/sa-funkar-det"],
              ["Omdömen", "/omdomen"],
              ["hej@tryck.se", "mailto:hej@tryck.se"],
              ["08-000 00 00", "tel:080000000"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="spec text-paper/40">
            © {new Date().getFullYear()} SNABBTRYCK · DTF-tryck i Sverige ·{" "}
            <Link href="/integritetspolicy" className="hover:text-signal">Integritetspolicy</Link>
          </p>
          <div className="flex items-center gap-4 spec text-paper/40">
            <span>SWISH</span>
            <span>KORT</span>
            <span>FAKTURA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="eyebrow text-paper/50 mb-3">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-paper/80 hover:text-signal transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
