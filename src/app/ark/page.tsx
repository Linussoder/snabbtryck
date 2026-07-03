import { PageShell } from "@/components/layout/PageShell";
import { ArkDesigner } from "@/components/ark/ArkDesigner";

export const metadata = {
  title: "Beställ tryck på ark — Snabbtryck",
};

export default function ArkPage() {
  return (
    <PageShell>
      <ArkDesigner />
    </PageShell>
  );
}
