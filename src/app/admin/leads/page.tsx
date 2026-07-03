"use client";

import { useEffect, useState } from "react";
import { fetchLeads, type Lead } from "@/lib/admin-data";
import { getGarment } from "@/lib/garments";
import { kr } from "@/lib/format";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchLeads().then((l) => {
      setLeads(l);
      setReady(true);
    });
  }, []);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · leads</p>
        <h1 className="display text-3xl sm:text-4xl">Leads · {leads.length}</h1>
        <p className="mt-1 text-sm text-muted">E-postadresser från bulkpris-kalkylatorn — heta att följa upp.</p>
      </div>

      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar…</div>
      ) : leads.length === 0 ? (
        <div className="card p-12 text-center text-muted">Inga leads ännu.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-normal eyebrow">Datum</th>
                <th className="px-4 py-3 font-normal eyebrow">E-post</th>
                <th className="px-4 py-3 font-normal eyebrow">Intresse</th>
                <th className="px-4 py-3 text-right font-normal eyebrow">Uppskattat</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3 text-muted tabular-nums">
                    {new Date(l.created_at).toLocaleDateString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${l.email}`} className="text-signal hover:underline">{l.email}</a>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {l.garment_id ? getGarment(l.garment_id).name : "—"}
                    {l.qty ? ` · ${l.qty} st` : ""}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{l.estimate ? kr(l.estimate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
