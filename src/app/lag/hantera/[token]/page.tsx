"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { useToast } from "@/components/ui/Toast";
import { getGarment } from "@/lib/garments";
import { getTeamOrder, getEntries, type TeamOrder, type TeamEntry } from "@/lib/team";

export default function TeamManage() {
  const { token } = useParams<{ token: string }>();
  const { push } = useToast();
  const [team, setTeam] = useState<TeamOrder | null>(null);
  const [entries, setEntries] = useState<TeamEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getTeamOrder(token).then(async (t) => {
      setTeam(t);
      if (t) setEntries(await getEntries(t.id));
      setReady(true);
    });
  }, [token]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    entries.forEach((e) => (c[e.size] = (c[e.size] ?? 0) + 1));
    return c;
  }, [entries]);

  function copyLink() {
    const url = `${window.location.origin}/lag/samla/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    push({ kind: "success", title: "Länk kopierad", msg: url });
  }
  function exportCsv() {
    const rows = [["Namn", "Nummer", "Storlek"].join(",")].concat(
      entries.map((e) => [e.member_name, e.number ?? "", e.size].map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(","))
    );
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `laginsamling-${token}.csv`;
    a.click();
  }

  if (!ready) return <PageShell><div className="p-16" /></PageShell>;
  if (!team)
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="display text-3xl">Insamlingen hittades inte</h1>
        </div>
      </PageShell>
    );

  const g = getGarment(team.garment_id);

  return (
    <PageShell>
      <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-none rounded-[10px] bg-paper-2"><DesignThumb design={team.design} /></div>
            <div>
              <p className="eyebrow text-muted">Laginsamling · {g.name}</p>
              <h1 className="display text-3xl">{team.title}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="btn btn-outline btn-sm">Kopiera insamlingslänk</button>
            <button onClick={exportCsv} disabled={!entries.length} className="btn btn-outline btn-sm">↓ CSV</button>
          </div>
        </div>

        {/* Storleksfördelning */}
        {entries.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(counts).map(([size, n]) => (
              <span key={size} className="rounded-full border border-line px-3 py-1 text-sm">
                <b>{size}</b> · {n} st
              </span>
            ))}
            <span className="rounded-full bg-ink px-3 py-1 text-sm text-paper">Totalt {entries.length}</span>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            <p>Inga svar än. Dela insamlingslänken med laget så fyller de i sina storlekar här.</p>
            <button onClick={copyLink} className="btn btn-primary btn-sm mt-4">Kopiera länk att dela</button>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 font-normal eyebrow">Namn</th>
                  <th className="px-4 py-3 font-normal eyebrow">Nummer</th>
                  <th className="px-4 py-3 font-normal eyebrow">Storlek</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 head">{e.member_name}</td>
                    <td className="px-4 py-3 tabular-nums">{e.number || "—"}</td>
                    <td className="px-4 py-3 head uppercase">{e.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 spec text-[11px] text-muted">
          Redo att beställa? Gå till <Link href="/lag" className="link-underline">lagbeställningen</Link> och lägg in namnen — eller ladda ner CSV:n som underlag.
        </p>
      </div>
    </PageShell>
  );
}
