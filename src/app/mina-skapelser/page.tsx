"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { useToast, useStoreTick } from "@/components/ui/Toast";
import { DesignSnapshot } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  getDesigns,
  deleteDesign,
  saveDesign,
  shareDesign,
  setCart,
  Order,
} from "@/lib/account";
import { getGarment } from "@/lib/garments";
import { uid } from "@/lib/store";
import { kr } from "@/lib/format";
import { EmailPreviewModal } from "@/components/EmailPreviewModal";

const STATUS_STEPS = ["Mottagen", "I tryck", "Skickad"] as const;

export default function MinaSkapelser() {
  useStoreTick();
  const router = useRouter();
  const { push } = useToast();
  const { user, profile, loading } = useAuth();
  const [designs, setDesigns] = useState<DesignSnapshot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [emailFor, setEmailFor] = useState<DesignSnapshot | null>(null);

  function refresh() {
    setDesigns(getDesigns());
  }
  useEffect(() => {
    refresh();
    setReady(true);
    const h = () => refresh();
    window.addEventListener("tryck-store", h);
    return () => window.removeEventListener("tryck-store", h);
  }, []);

  // Ordrar från databasen (RLS ger bara mina egna).
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(
          (data ?? []).map((o) => ({ ...o, createdAt: o.created_at }) as Order)
        );
      });
  }, [user]);

  function duplicate(d: DesignSnapshot) {
    saveDesign({ ...d, id: uid("dsn"), name: d.name + " (kopia)", updatedAt: Date.now() });
    push({ kind: "success", title: "Design duplicerad" });
    refresh();
  }
  function share(d: DesignSnapshot) {
    const token = shareDesign(d);
    const url = `${window.location.origin}/delad/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    push({ kind: "success", title: "Länk kopierad", msg: url });
  }
  function reorder(d: DesignSnapshot) {
    setCart({ design: d, qty: d.qty });
    router.push("/kassa");
  }
  function remove(d: DesignSnapshot) {
    if (!confirm(`Ta bort "${d.name}"?`)) return;
    deleteDesign(d.id);
    push({ kind: "info", title: "Design borttagen" });
    refresh();
  }

  if (!ready || loading) return <PageShell><div className="p-10" /></PageShell>;

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="flex justify-center">
            <ChevronMark size={20} color="#FFDA00" />
          </div>
          <h1 className="display mt-4 text-3xl">Logga in för att se dina skapelser</h1>
          <p className="mt-3 text-ink/70">
            Sparade designs, delbara länkar och orderstatus samlas här.
          </p>
          <Link href="/logga-in" className="btn btn-primary mt-6">Logga in</Link>
          <p className="mt-4 spec text-[11px] text-muted">
            Har du redan skapat designs utan konto?{" "}
            <Link href="/designa" className="link-underline">Öppna verktyget</Link>
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-4 px-4 py-10 md:px-8">
          <div>
            <span className="spec text-muted"><span className="text-yellow font-bold" aria-hidden>»</span> {profile?.name ?? user.email}</span>
            <h1 className="display mt-1 text-4xl sm:text-5xl">Mina skapelser</h1>
          </div>
          <Link href="/designa" className="btn btn-primary">+ Ny design</Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-12 md:px-8">
        {/* Designs */}
        <section>
          <h2 className="font-display text-xl uppercase mb-4">Sparade designs · {designs.length}</h2>
          {designs.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <p className="text-muted">Inga sparade designs ännu.</p>
              <Link href="/designa" className="btn btn-outline btn-sm">Skapa din första</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => {
                const g = getGarment(d.garmentId);
                const ordered = orders.some((o) => o.design.id === d.id);
                return (
                  <div key={d.id} className="card crop-frame overflow-hidden">
                    <div className="relative aspect-square bg-paper-2 grid-field">
                      <DesignThumb design={d} />
                      {!ordered && (
                        <span className="absolute left-2 top-2 rounded-full border border-warn bg-paper/90 px-2 py-0.5 spec text-[9px] uppercase text-warn">
                          Ej beställd
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg uppercase leading-none">{d.name}</p>
                          <p className="spec mt-1 text-[11px] text-muted">
                            {g.name} · {g.colors[d.colorIndex]?.name} · {d.qty} st
                          </p>
                        </div>
                        <button onClick={() => remove(d)} className="text-muted hover:text-bad" title="Ta bort">×</button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <Link href={`/designa?design=${d.id}`} className="btn btn-ghost btn-sm">Redigera</Link>
                        <button onClick={() => duplicate(d)} className="btn btn-ghost btn-sm">Duplicera</button>
                        <button onClick={() => share(d)} className="btn btn-ghost btn-sm">Dela länk</button>
                        <button onClick={() => reorder(d)} className="btn btn-primary btn-sm">Beställ</button>
                      </div>
                      {!ordered && (
                        <button
                          onClick={() => setEmailFor(d)}
                          className="mt-1.5 w-full rounded-[10px] border border-line py-1.5 spec text-[11px] text-muted hover:border-ink hover:text-ink"
                        >
                          ✉ Förhandsvisa påminnelsemejl
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Orders */}
        {orders.length > 0 && (
          <section>
            <h2 className="font-display text-xl uppercase mb-4">Ordrar · {orders.length}</h2>
            <div className="space-y-3">
              {orders.map((o) => {
                const stepIdx = STATUS_STEPS.indexOf(o.status);
                return (
                  <Link
                    key={o.id}
                    href={`/order/${o.id}`}
                    className="card flex flex-wrap items-center gap-4 p-4 hover:border-ink"
                  >
                    <div className="h-16 w-16 flex-none rounded-[10px] bg-paper-2">
                      <DesignThumb design={o.design} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display uppercase">{o.ref}</p>
                      <p className="spec text-[11px] text-muted">
                        {o.design.name} · {kr(o.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {STATUS_STEPS.map((s, i) => (
                        <span
                          key={s}
                          className={`spec text-[10px] uppercase ${i <= stepIdx ? "text-signal" : "text-muted-2"}`}
                        >
                          {i <= stepIdx ? "●" : "○"} {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {emailFor && (
        <EmailPreviewModal
          design={emailFor}
          to={user.email ?? ""}
          firstName={(profile?.name ?? user.email ?? "").split(" ")[0]}
          onClose={() => setEmailFor(null)}
        />
      )}
    </PageShell>
  );
}
