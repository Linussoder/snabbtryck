import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ChevronMark size={22} color="#FFDA00" />
        <p className="eyebrow mt-5 text-muted">Fel 404</p>
        <h1 className="display mt-2 text-4xl">Sidan hittades inte</h1>
        <p className="mt-3 text-sm text-muted">
          Länken kan vara gammal eller feltrycket. Men din nästa design är bara ett klick bort.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/designa" className="btn btn-primary">Öppna designverktyget</Link>
          <Link href="/" className="btn btn-ghost">Till startsidan</Link>
        </div>
      </div>
    </PageShell>
  );
}
