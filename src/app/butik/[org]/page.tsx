"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { Org, getOrg } from "@/lib/orgs";
import { getGarment } from "@/lib/garments";
import { DesignSnapshot, DesignElement, uid, computePrintArea } from "@/lib/store";
import { computePrice } from "@/lib/pricing";
import { setCart } from "@/lib/account";
import { kr } from "@/lib/format";

function productSnapshot(org: Org, garmentId: string, colorIndex: number): DesignSnapshot {
  const logo: DesignElement = {
    id: uid("img"),
    type: "image",
    view: "front",
    x: 0.5,
    y: 0.42,
    w: 0.26,
    ar: 1,
    rotation: 0,
    src: org.logoDataUrl,
    naturalW: 400,
    naturalH: 400,
    bgRemoved: false,
  };
  return {
    id: uid("dsn"),
    name: `${org.name} — ${getGarment(garmentId).name}`,
    garmentId,
    colorIndex,
    size: "M",
    qty: 1,
    elements: [logo],
    updatedAt: Date.now(),
  };
}

export default function ButikOrg() {
  const params = useParams<{ org: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<Org | null | undefined>(undefined);

  useEffect(() => {
    setOrg(getOrg(params.org) ?? null);
  }, [params.org]);

  if (org === undefined) return <PageShell><div className="p-16" /></PageShell>;
  if (org === null) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <ChevronMark size={28} color="#FFDA00" className="mx-auto" />
          <h1 className="display mt-4 text-3xl">Butiken hittades inte</h1>
          <Link href="/butik" className="btn btn-primary mt-6">Alla butiker</Link>
        </div>
      </PageShell>
    );
  }

  function orderNow(garmentId: string, colorIndex: number) {
    if (!org) return;
    setCart({ design: productSnapshot(org, garmentId, colorIndex), qty: 1 });
    router.push("/kassa");
  }

  return (
    <PageShell>
      {/* org hero */}
      <section className="panel-ink on-ink relative overflow-hidden">
        <div className="halftone halftone-signal absolute inset-0 opacity-10" />
        <div className="relative mx-auto flex max-w-[1100px] flex-wrap items-center gap-6 px-4 py-12 md:px-8">
          <div className="h-24 w-24 flex-none rounded-[10px] border border-ink-line bg-ink-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={org.logoDataUrl} alt={org.name} className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="eyebrow" style={{ color: org.primary }}>Klubbutik · shop-in-shop</span>
            <h1 className="display mt-1 text-4xl sm:text-5xl">{org.name}</h1>
            <p className="mt-2 max-w-xl text-paper/70">{org.tagline}</p>
          </div>
        </div>
      </section>

      {/* locked-profile note */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-4 py-3 md:px-8">
          <ChevronMark size={12} color="#00AEEF" />
          <p className="spec text-[11px] text-muted">
            Logga och färgprofil är låsta för {org.name}. Beställ din storlek — vi trycker on demand, noll lagerrisk.
          </p>
        </div>
      </div>

      {/* products */}
      <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {org.products.map((p) => {
            const g = getGarment(p.garmentId);
            const snap = productSnapshot(org, p.garmentId, p.colorIndex);
            const price = computePrice(g, computePrintArea(snap.elements, g), 1);
            return (
              <div key={p.garmentId} className="card crop-frame overflow-hidden">
                <div className="aspect-square bg-paper-2 grid-field">
                  <DesignThumb design={snap} view="front" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="head text-lg uppercase leading-none">{g.name}</p>
                    <span className="font-display text-lg">{kr(price.subtotalInclVat)}</span>
                  </div>
                  <p className="spec mt-1 text-[11px] text-muted">{g.colors[p.colorIndex]?.name} · inkl. moms</p>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <Link href={`/designa?org=${org.slug}&garment=${p.garmentId}`} className="btn btn-ghost btn-sm">
                      Anpassa
                    </Link>
                    <button onClick={() => orderNow(p.garmentId, p.colorIndex)} className="btn btn-primary btn-sm">
                      Beställ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
