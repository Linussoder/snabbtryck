import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHead({
  index,
  title,
  sub,
}: {
  index: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
        <span className="spec text-muted">[ {index} ]</span>
        <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
        {sub && <p className="mt-3 max-w-xl text-ink/70">{sub}</p>}
      </div>
    </div>
  );
}
