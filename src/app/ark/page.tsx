import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ArkDesigner } from "@/components/ark/ArkDesigner";

export const metadata: Metadata = {
  title: "Beställ tryck på ark – A4 & A3 DTF-transfers",
  description:
    "Designa egna DTF-tryckark i A4 eller A3 – lägg till text och bilder, se priset direkt och pressa hemma med strykjärn eller värmepress. Gang sheet-tryck utan uppläggsavgifter.",
  alternates: { canonical: "/ark" },
  openGraph: {
    title: "Beställ tryck på ark – A4 & A3 DTF-transfers | Snabbtryck",
    description:
      "Egna DTF-tryckark i A4/A3 att pressa hemma. Lägg till text och bilder, se priset direkt.",
    url: "/ark",
    type: "website",
  },
};

export default function ArkPage() {
  return (
    <PageShell>
      <ArkDesigner />
    </PageShell>
  );
}
