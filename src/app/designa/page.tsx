import { Suspense } from "react";
import { EditorShell } from "@/components/editor/EditorShell";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata = {
  title: "Designverktyget — Snabbtryck",
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
