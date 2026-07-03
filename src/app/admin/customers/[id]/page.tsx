"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/admin/ui";
import { kr } from "@/lib/format";
import type { AdminOrder, AdminProfile } from "@/lib/admin-data";

export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    ]).then(([p, o]) => {
      setProfile((p.data as AdminProfile) ?? null);
      setOrders((o.data ?? []) as AdminOrder[]);
      setReady(true);
    });
  }, [id]);

  const ltv = useMemo(() => orders.reduce((a, o) => a + o.total, 0), [orders]);

  async function toggleAdmin() {
    if (!profile || busy) return;
    const next = profile.role === "admin" ? "customer" : "admin";
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ role: next }).eq("id", profile.id);
    setBusy(false);
    if (error) {
      push({ kind: "error", title: "Kunde inte ändra roll" });
      return;
    }
    setProfile({ ...profile, role: next });
    push({ kind: "success", title: next === "admin" ? "Nu admin" : "Admin borttagen" });
  }

  if (!ready) return <div className="p-8 text-muted">Laddar…</div>;
  if (!profile)
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center">
        <h1 className="display text-3xl">Kunden hittades inte</h1>
        <Link href="/admin/customers" className="btn btn-primary mt-6">Till kundlistan</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <Link href="/admin/customers" className="spec text-muted hover:text-ink">← Alla kunder</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl sm:text-4xl">{profile.name || profile.email.split("@")[0]}</h1>
          <a href={`mailto:${profile.email}`} className="text-signal hover:underline">{profile.email}</a>
        </div>
        <button onClick={toggleAdmin} disabled={busy} className="btn btn-outline btn-sm">
          {profile.role === "admin" ? "Ta bort admin-roll" : "Gör till admin"}
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="eyebrow text-muted">Typ</p>
          <p className="mt-1 font-display text-xl">
            {profile.role === "admin" ? "Admin" : profile.business ? "Företag" : "Privat"}
          </p>
          {profile.company_name && <p className="spec text-[11px] text-muted">{profile.company_name}</p>}
        </div>
        <div className="card p-4">
          <p className="eyebrow text-muted">Ordrar</p>
          <p className="mt-1 font-display text-xl">{orders.length}</p>
        </div>
        <div className="card p-4">
          <p className="eyebrow text-muted">Livstidsvärde</p>
          <p className="mt-1 font-display text-xl text-signal">{kr(ltv)}</p>
        </div>
      </div>

      <h2 className="head mb-3 text-lg uppercase">Ordrar</h2>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-muted">Inga ordrar.</div>
      ) : (
        <div className="card overflow-hidden">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0 hover:bg-paper-2">
              <span className="head uppercase">{o.ref}</span>
              <span className="spec text-[11px] text-muted">{new Date(o.created_at).toLocaleDateString("sv-SE")}</span>
              <span className="tabular-nums">{kr(o.total)}</span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
