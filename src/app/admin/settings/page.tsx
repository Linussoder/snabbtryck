"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProfiles, type AdminProfile } from "@/lib/admin-data";
import { PRICE_PER_CM2, PRINT_SETUP_MIN, VAT_RATE, DISCOUNT_TIERS } from "@/lib/pricing";
import { COST } from "@/lib/margin";
import { kr, pct } from "@/lib/format";

export default function AdminSettings() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);

  useEffect(() => {
    fetchProfiles().then((p) => setAdmins(p.filter((x) => x.role === "admin")));
  }, []);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · konfiguration</p>
        <h1 className="display text-3xl sm:text-4xl">Inställningar</h1>
      </div>

      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="head mb-3 text-lg uppercase">Prissättning</h2>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <Row k="Tryckpris per cm² (inkl. moms)" v={`${PRICE_PER_CM2} kr`} />
            <Row k="Minsta tryckkostnad / plagg" v={kr(PRINT_SETUP_MIN)} />
            <Row k="Moms" v={pct(VAT_RATE)} />
          </dl>
          <h3 className="eyebrow mt-4 mb-2">Mängdrabatt</h3>
          <div className="flex flex-wrap gap-2">
            {DISCOUNT_TIERS.filter((t) => t.pct > 0).map((t) => (
              <span key={t.min} className="rounded-full border border-line px-3 py-1 spec text-[11px]">
                {t.min}+ st → −{pct(t.pct)}
              </span>
            ))}
          </div>
          <p className="spec mt-3 text-[11px] text-muted">Ändras i <span className="font-mono">src/lib/pricing.ts</span>.</p>
        </section>

        <section className="card p-5">
          <h2 className="head mb-3 text-lg uppercase">Kostnadsschabloner (marginal)</h2>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <Row k="Plaggkostnad (andel av retail)" v={pct(COST.garmentOfRetail)} />
            <Row k="Film per cm²" v={`${COST.filmPerCm2} kr`} />
            <Row k="Pulver/bläck per plagg" v={kr(COST.consumablePerPrint)} />
            <Row k="Frakt per order" v={kr(COST.shippingPerOrder)} />
          </dl>
          <p className="spec mt-3 text-[11px] text-muted">Ändras i <span className="font-mono">src/lib/margin.ts</span>.</p>
        </section>

        <section className="card p-5">
          <h2 className="head mb-3 text-lg uppercase">Administratörer · {admins.length}</h2>
          <ul className="space-y-1">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <span>{a.name || a.email.split("@")[0]} <span className="spec ml-1 text-[11px] text-muted">{a.email}</span></span>
                <Link href={`/admin/customers/${a.id}`} className="spec text-[11px] text-signal">Hantera →</Link>
              </li>
            ))}
          </ul>
          <p className="spec mt-3 text-[11px] text-muted">
            Gör en kund till admin via kundens sida. Nya e-postadresser blir admin automatiskt om de finns i
            <span className="font-mono"> admin_emails</span>-tabellen vid första inloggning.
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-1.5">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="head text-sm">{v}</dd>
    </div>
  );
}
