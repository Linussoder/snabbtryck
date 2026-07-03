"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { useToast } from "@/components/ui/Toast";
import { getGarment } from "@/lib/garments";
import { kr } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/account";

const STATUSES: OrderStatus[] = ["Mottagen", "I tryck", "Skickad"];

interface AdminOrderRow extends Order {
  contact: Record<string, string>;
  shipping: { method?: string; cost?: number };
  print_files: { elementId: string; path: string }[];
  created_at: string;
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const [order, setOrder] = useState<AdminOrderRow | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        const o = (data as AdminOrderRow) ?? null;
        setOrder(o);
        setReady(true);
        if (o?.print_files?.length) {
          const signed = await Promise.all(
            o.print_files.map(async (f) => {
              const { data: s } = await supabase.storage.from("artwork").createSignedUrl(f.path, 3600);
              return { name: f.path.split("/").pop() ?? f.path, url: s?.signedUrl ?? "" };
            })
          );
          setFiles(signed.filter((f) => f.url));
        }
      });
  }, [id]);

  async function setStatus(status: OrderStatus) {
    if (!order || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    setSaving(false);
    if (error) {
      push({ kind: "error", title: "Kunde inte uppdatera status" });
      return;
    }
    setOrder({ ...order, status });
    push({ kind: "success", title: "Status uppdaterad", msg: status });
  }

  if (!ready) return <div className="mx-auto max-w-[1000px] p-12 text-muted">Laddar…</div>;
  if (!order)
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-16 text-center">
        <h1 className="display text-3xl">Ordern hittades inte</h1>
        <Link href="/admin" className="btn btn-primary mt-6">Till orderlistan</Link>
      </div>
    );

  const g = getGarment(order.design.garmentId);
  const c = order.contact ?? {};

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-8">
      <Link href="/admin" className="spec text-muted hover:text-ink">← Alla ordrar</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-3xl sm:text-4xl">{order.ref}</h1>
        <span className="spec text-muted">
          {new Date(order.created_at).toLocaleString("sv-SE")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Status */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Status</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={saving}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    order.status === s ? "border-signal bg-signal text-white" : "border-line text-muted hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Rader */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Orderrader</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.lines.map((l, i) => {
                  const lg = getGarment(l.garmentId);
                  return (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="py-2 head uppercase">{lg.name}</td>
                      <td className="py-2 text-muted">{lg.colors[l.colorIndex]?.name} · {l.size}</td>
                      <td className="py-2 text-right tabular-nums">{l.qty} st</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="head uppercase">Totalt {order.business ? "(exkl. moms)" : "(inkl. moms)"}</span>
              <span className="font-display text-2xl">{kr(order.total)}</span>
            </div>
          </section>

          {/* Tryckfiler */}
          <section className="card p-5">
            <h2 className="eyebrow mb-3">Tryckfiler ({files.length})</h2>
            {files.length === 0 ? (
              <p className="text-sm text-muted">Inga uppladdade originalfiler för den här ordern.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.url}>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href={f.url} download className="btn btn-outline btn-sm">↓ {f.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidopanel */}
        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-paper-2 grid-field">
              <DesignThumb design={order.design} />
            </div>
            <p className="spec border-t border-line px-3 py-2 text-[11px] text-muted">
              {order.design.name} · {g.name}
            </p>
          </div>
          <div className="card p-5">
            <h2 className="eyebrow mb-2">Kund</h2>
            <p className="head">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</p>
            <p className="text-sm text-muted">{c.email}</p>
            {c.company && <p className="text-sm text-muted">{c.company}</p>}
            <div className="mt-3 border-t border-line pt-3 text-sm text-muted">
              <p>{c.address}</p>
              <p>{[c.zip, c.city].filter(Boolean).join(" ")}</p>
              <p className="mt-2 spec text-[11px]">
                Frakt: {order.shipping?.method ?? "—"}
                {typeof order.shipping?.cost === "number" ? ` · ${kr(order.shipping.cost)}` : ""}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
