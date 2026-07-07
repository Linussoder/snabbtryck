"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { useToast } from "@/components/ui/Toast";
import {
  Order,
  OrderStatus,
  setCart,
  shareDesign,
} from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { getGarment } from "@/lib/garments";
import { qrDataUrl } from "@/lib/qr";
import { kr } from "@/lib/format";

const STEPS: { key: OrderStatus; label: string; note: string }[] = [
  { key: "Mottagen", label: "Mottagen", note: "Vi har din order och tryckfilen är genererad." },
  { key: "I tryck", label: "I tryck", note: "Din design körs genom DTF-pressen." },
  { key: "Skickad", label: "Skickad", note: "På väg till dig med spårning via mail." },
];

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .maybeSingle()
      .then(({ data }) => {
        const o: Order | null = data
          ? ({ ...data, createdAt: data.created_at } as Order)
          : null;
        setOrder(o);
        setReady(true);
        if (o) {
          const token = shareDesign(o.design);
          const url = `${window.location.origin}/delad/${token}`;
          qrDataUrl(url).then(setQr).catch(() => {});
        }
      });
  }, [params.id]);

  if (!ready) return <PageShell><div className="p-16" /></PageShell>;
  if (!order) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="flex justify-center">
            <ChevronMark size={20} color="#FFDA00" />
          </div>
          <h1 className="display mt-4 text-3xl">Ordern hittades inte</h1>
          <Link href="/mina-skapelser" className="btn btn-primary mt-6">Till mina ordrar</Link>
        </div>
      </PageShell>
    );
  }

  const g = getGarment(order.design.garmentId);
  const stepIdx = STEPS.findIndex((s) => s.key === order.status);
  const views = g.views.filter((v) => order.design.elements.some((e) => e.view === v));
  const showViews = views.length ? views : [g.views[0]];

  function reorder() {
    if (!order) return;
    setCart({ design: order.design, qty: order.lines[0]?.qty ?? 1 });
    router.push("/kassa");
  }
  function share() {
    push({ kind: "success", title: "Redo att delas", msg: "Mockup-bilden är sparad — lägg upp den var du vill." });
  }

  return (
    <PageShell>
      {/* confirmation banner */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-4 py-8 md:px-8">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-signal text-2xl text-white">✓</span>
          <div>
            <p className="eyebrow text-muted">Order {order.ref}</p>
            <h1 className="display text-3xl text-ink sm:text-4xl">Tack — vi trycker!</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* auto mockups */}
          <section>
            <h2 className="font-display text-lg uppercase mb-3">Dina mockup-bilder</h2>
            <div className="grid grid-cols-2 gap-4">
              {showViews.map((v) => (
                <div key={v} className="card crop-frame overflow-hidden">
                  <div className="aspect-square bg-paper-2 grid-field">
                    <DesignThumb design={order.design} view={v} />
                  </div>
                  <p className="spec border-t border-line px-3 py-2 text-[11px] text-muted">
                    {v === "front" ? "Framsida" : v === "back" ? "Baksida" : "Ärm"}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={share} className="btn btn-outline btn-sm mt-3">Dela på sociala medier</button>
          </section>

          {/* status timeline */}
          <section>
            <h2 className="font-display text-lg uppercase mb-4">Orderstatus</h2>
            <ol className="relative space-y-6 border-l border-line pl-6">
              {STEPS.map((s, i) => {
                const done = i <= stepIdx;
                const active = i === stepIdx;
                return (
                  <li key={s.key} className="relative">
                    <span
                      className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        done ? "border-signal bg-signal text-white" : "border-line bg-paper"
                      }`}
                    >
                      {done && <span className="text-[10px]">✓</span>}
                    </span>
                    <p className={`font-display uppercase ${active ? "text-signal" : done ? "" : "text-muted"}`}>
                      {s.label}
                    </p>
                    <p className="text-sm text-muted">{s.note}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* summary */}
        <aside>
          <div className="card p-5">
            <h2 className="eyebrow mb-3">Sammanfattning</h2>
            <div className="flex gap-3">
              <div className="h-16 w-16 flex-none rounded-[10px] bg-paper-2">
                <DesignThumb design={order.design} />
              </div>
              <div>
                <p className="font-display uppercase leading-none">{order.design.name}</p>
                <p className="spec mt-1 text-[11px] text-muted">
                  {g.name} · {g.colors[order.design.colorIndex]?.name}
                </p>
                <p className="spec text-[11px] text-muted">{order.lines[0]?.qty} st · {order.lines[0]?.size}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="font-display uppercase">Totalt</span>
              <span className="font-display text-2xl">{kr(order.total)}</span>
            </div>
            <p className="spec mt-1 text-[10px] text-muted">{order.business ? "Exkl. moms · faktura" : "Inkl. moms"}</p>
            <button onClick={reorder} className="btn btn-primary mt-4 w-full">Beställ igen</button>
            <Link href="/mina-skapelser" className="btn btn-ghost btn-sm mt-2 w-full">Till mina ordrar</Link>
          </div>
          <div className="mt-4 card flex items-center gap-4 p-4">
            <div className="h-24 w-24 flex-none rounded-[10px] border border-line bg-white p-1">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="Beställ igen-QR" className="h-full w-full" />
              ) : (
                <div className="h-full w-full animate-pulse bg-paper-2" />
              )}
            </div>
            <div>
              <p className="font-display text-sm uppercase leading-tight">Beställ igen-QR</p>
              <p className="spec mt-1 text-[11px] text-muted leading-snug">
                Skannas från följesedeln — öppnar exakt den här designen, redo för ny storlek eller en kompis.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
