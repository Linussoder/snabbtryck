import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorShell } from "@/components/editor/EditorShell";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Designverktyget – designa din tröja online",
  description:
    "Designa din egen tröja, hoodie eller keps direkt i webbläsaren. Ladda upp en logga, lägg till text, placera fritt med standardplaceringar och se priset live per cm² tryckyta. DTF-tryck, från 1 plagg.",
  alternates: { canonical: "/designa" },
  openGraph: {
    title: "Designverktyget – designa din tröja online | Snabbtryck",
    description:
      "Designa egna kläder i webbläsaren – ladda upp logga, lägg till text, se priset live. DTF-tryck, från 1 plagg, inom 48 timmar.",
    url: "/designa",
    type: "website",
  },
};

export default function DesignaPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="p-10 spec text-muted">Laddar verktyg…</div>}>
        <EditorShell />
      </Suspense>
    </>
  );
}
