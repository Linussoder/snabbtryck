"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { useToast } from "@/components/ui/Toast";
import { DesignSnapshot } from "@/lib/store";
import { getShared, setCart } from "@/lib/account";
import { getGarment } from "@/lib/garments";
import { computePrice } from "@/lib/pricing";
import { computePrintArea } from "@/lib/store";
import { kr } from "@/lib/format";

export default function DeladDesign() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [design, setDesign] = useState<DesignSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDesign(getShared(params.id));
    setReady(true);
  }, [params.id]);

  if (!ready) return <PageShell><div className="p-16" /></PageShell>;

  if (!design) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="flex justify-center">
            <ChevronMark size={24} color="#00AEEF" />
          </div>
          <h1 className="display mt-4 text-3xl">Länken hittades inte</h1>
          <p className="mt-3 text-ink-soft">Designen kan ha tagits bort eller så är länken felaktig.</p>
          <Link href="/designa" className="btn btn-primary mt-6">Skapa en egen</Link>
        </div>
      </PageShell>
    );
  }

  const g = getGarment(design.garmentId);
  const price = computePrice(g, computePrintArea(design.elements, g), design.qty);

  function approve() {
    push({ kind: "success", title: "Design godkänd!", msg: "Skicka gärna länken vidare till fler i laget." });
  }
  function order() {
    if (!design) return;
    setCart({ design, qty: design.qty });
    router.push("/kassa");
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-8">
        <div className="mb-6 flex items-center gap-2">
          <ChevronMark size={16} color="#FFDA00" />
          <span className="eyebrow">Delad design · Granska & godkänn</span>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card crop-frame overflow-hidden">
            <div className="aspect-square bg-paper-2 grid-field">
              <DesignThumb design={design} />
            </div>
          </div>
          <div>
            <h1 className="display text-4xl">{design.name}</h1>
            <p className="mt-2 text-muted">
              {g.name} · {g.colors[design.colorIndex]?.name} · {design.size} · {design.qty} st
            </p>

            <div className="mt-6 card p-5">
              <div className="flex items-end justify-between">
                <span className="eyebrow">Uppskattat pris inkl. moms</span>
                <span className="font-display text-3xl">{kr(price.subtotalInclVat)}</span>
              </div>
              <p className="spec mt-1 text-[11px] text-muted">
                {design.qty} st · {kr(price.unitAfterDiscount)} / st
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={order} className="btn btn-primary w-full">Beställ den här designen →</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={approve} className="btn btn-outline btn-sm">Godkänn</button>
                <Link href={`/designa?shared=${params.id}`} className="btn btn-ghost btn-sm">Öppna & ändra</Link>
              </div>
            </div>
            <p className="mt-4 spec text-[11px] text-muted">
              <span className="text-yellow font-bold" aria-hidden>»</span> Perfekt för lagkaptenen: skicka länken, låt laget godkänna innan beställning.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
