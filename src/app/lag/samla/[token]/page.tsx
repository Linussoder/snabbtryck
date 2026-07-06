"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { getGarment } from "@/lib/garments";
import { getTeamOrder, submitEntry, type TeamOrder } from "@/lib/team";

export default function TeamCollect() {
  const { token } = useParams<{ token: string }>();
  const [team, setTeam] = useState<TeamOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [size, setSize] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getTeamOrder(token).then((t) => {
      setTeam(t);
      if (t) setSize(getGarment(t.garment_id).sizes[Math.floor(getGarment(t.garment_id).sizes.length / 2)] ?? "M");
      setReady(true);
    });
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!team || !name.trim() || !size || pending) return;
    setPending(true);
    setErr(null);
    const { error } = await submitEntry(team.id, { member_name: name.trim(), number: number.trim(), size });
    setPending(false);
    if (error) return setErr("Kunde inte skicka — försök igen.");
    setDone(true);
  }

  if (!ready) return <PageShell><div className="p-16" /></PageShell>;
  if (!team)
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <ChevronMark size={22} color="#FFDA00" />
          <h1 className="display mt-4 text-3xl">Insamlingen hittades inte</h1>
          <p className="mt-3 text-muted">Länken kan vara felaktig eller borttagen.</p>
        </div>
      </PageShell>
    );

  const g = getGarment(team.garment_id);

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="card overflow-hidden">
          <div className="aspect-square bg-paper-2 grid-field">
            <DesignThumb design={team.design} />
          </div>
          <div className="p-6">
            <p className="eyebrow text-muted">Laginsamling</p>
            <h1 className="display text-3xl">{team.title}</h1>
            <p className="mt-1 text-sm text-muted">{g.name} · {g.colors[team.color_index]?.name}</p>

            {done ? (
              <div className="mt-6 rounded-lg bg-signal/10 p-5 text-center">
                <p className="head text-lg text-signal">Tack {name.split(" ")[0]}!</p>
                <p className="mt-1 text-sm text-muted">Din storlek är inskickad till arrangören.</p>
                <button onClick={() => { setDone(false); setName(""); setNumber(""); }} className="btn btn-ghost btn-sm mt-4">Lägg till en till</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-3">
                <p className="text-sm text-ink-soft">Fyll i dina uppgifter så samlar arrangören ihop hela beställningen.</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ditt namn" required className="field" />
                <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Nummer (valfritt)" className="field" />
                <div>
                  <span className="eyebrow mb-1 block">Storlek</span>
                  <div className="flex flex-wrap gap-1.5">
                    {g.sizes.map((s) => (
                      <button type="button" key={s} onClick={() => setSize(s)}
                        className={`min-w-[42px] rounded-[10px] border px-2.5 py-1.5 font-display text-sm uppercase ${s === size ? "border-ink bg-ink text-paper" : "border-line hover:border-muted"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {err && <p className="text-sm text-bad">{err}</p>}
                <button type="submit" disabled={pending} className="btn btn-primary w-full">{pending ? "Skickar…" : "Skicka min storlek →"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
