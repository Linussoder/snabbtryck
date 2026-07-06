"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { useToast } from "@/components/ui/Toast";
import { fetchApprovedReviews, submitReview, type Review } from "@/lib/reviews";

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span style={{ fontSize: size }} className="text-signal" aria-label={`${n} av 5`}>
      {"★".repeat(Math.round(n))}<span className="text-line-2">{"★".repeat(5 - Math.round(n))}</span>
    </span>
  );
}

export default function Omdomen() {
  const { push } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ author_name: "", rating: 5, body: "" });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchApprovedReviews().then((r) => {
      setReviews(r);
      setReady(true);
    });
  }, []);

  const avg = useMemo(() => (reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0), [reviews]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.author_name.trim() || !form.body.trim() || pending) return;
    setPending(true);
    const { error } = await submitReview(form);
    setPending(false);
    if (error) return push({ kind: "error", title: "Kunde inte skicka" });
    setSent(true);
    setForm({ author_name: "", rating: 5, body: "" });
  }

  return (
    <PageShell>
      <PageHead index="OMDÖMEN" title="Vad kunderna säger" sub="Riktiga omdömen från lag, företag och privatpersoner som tryckt med oss." />

      <div className="mx-auto max-w-[900px] space-y-10 px-4 py-12 md:px-8">
        {ready && reviews.length > 0 && (
          <div className="card flex items-center gap-5 p-6">
            <div className="text-center">
              <p className="font-display text-5xl">{avg.toFixed(1)}</p>
              <Stars n={avg} size={18} />
            </div>
            <div className="border-l border-line pl-5">
              <p className="head text-lg">Snittbetyg</p>
              <p className="text-sm text-muted">Baserat på {reviews.length} omdöme{reviews.length === 1 ? "" : "n"}</p>
            </div>
          </div>
        )}

        {/* Lista */}
        {!ready ? (
          <div className="card p-12 text-center text-muted">Laddar…</div>
        ) : reviews.length === 0 ? (
          <div className="card p-10 text-center text-muted">Inga omdömen publicerade än — bli först att lämna ett!</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <Stars n={r.rating} />
                <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                <p className="spec mt-3 text-[11px] text-muted">— {r.author_name} · {new Date(r.created_at).toLocaleDateString("sv-SE")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skriv omdöme */}
        <div className="card p-6">
          <h2 className="head text-lg uppercase">Lämna ett omdöme</h2>
          {sent ? (
            <p className="mt-3 rounded-lg bg-signal/10 p-4 text-sm text-signal">Tack! Ditt omdöme granskas innan det publiceras.</p>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3">
              <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Ditt namn" required className="field" />
              <div className="flex items-center gap-2">
                <span className="eyebrow">Betyg</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-2xl ${n <= form.rating ? "text-signal" : "text-line-2"}`}>★</button>
                ))}
              </div>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} placeholder="Hur var din upplevelse?" required className="field w-full resize-y" />
              <button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Skickar…" : "Skicka omdöme"}</button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
