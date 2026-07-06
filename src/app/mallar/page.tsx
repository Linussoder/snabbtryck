import Link from "next/link";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { getGarment } from "@/lib/garments";

export const metadata = {
  title: "Designmallar — kom igång snabbt | Snabbtryck",
  description:
    "Färdiga tryckmallar för lag, fest, företag och roliga tröjor. Välj en mall, gör den till din och beställ — inga uppläggsavgifter.",
};

const CATEGORIES = ["Lag & förening", "Fest & event", "Företag", "Kul"];

export default function MallarPage() {
  return (
    <PageShell>
      <PageHead
        index="MALLAR"
        title="Börja med en mall"
        sub="Slipp den tomma ytan — välj en färdig design, byt text och färg, och gör den till din på sekunder."
      />
      <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-12 md:px-8">
        {CATEGORIES.map((cat) => {
          const items = TEMPLATES.filter((t) => t.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat}>
              <h2 className="head mb-4 text-xl uppercase">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((t) => {
                  const snap = getTemplate(t.id)!;
                  const g = getGarment(t.garmentId);
                  return (
                    <Link key={t.id} href={`/designa?template=${t.id}`} className="card crop-frame group overflow-hidden">
                      <div className="aspect-square bg-paper-2 grid-field">
                        <DesignThumb design={snap} />
                      </div>
                      <div className="border-t border-line px-3 py-2">
                        <p className="head text-sm leading-tight">{t.name}</p>
                        <p className="spec text-[10px] text-muted">{g.name} · anpassa fritt</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted">Hittar du inte rätt? Börja från ett tomt plagg.</p>
          <Link href="/designa" className="btn btn-primary">Öppna designverktyget</Link>
        </div>
      </div>
    </PageShell>
  );
}
