"use client";

import { useEffect, useState } from "react";
import { fetchApprovedReviews, type Review } from "@/lib/reviews";

// Visar riktiga, godkända omdömen. Renderar ingenting förrän det finns
// publicerade omdömen — inga påhittade citat (marknadsföringslagen).
export function SocialProof() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchApprovedReviews().then((r) => setReviews(r.slice(0, 3))).catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="eyebrow text-cyan">04 · SNABBTRYCK</span>
          <h2 className="head mt-2 text-3xl sm:text-[2.6rem]">Tryckt & levererat</h2>
        </div>
        <p className="max-w-xs text-sm text-muted">Vad kunderna säger.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.id} className="card flex flex-col p-6">
            <div className="mb-3 tracking-wide text-signal" aria-label={`${r.rating} av 5`}>
              {"★".repeat(Math.round(r.rating))}
              <span className="text-line-2">{"★".repeat(5 - Math.round(r.rating))}</span>
            </div>
            <blockquote className="flex-1 text-[15px] leading-relaxed">“{r.body}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm text-paper">
                {r.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div>
                <p className="font-display text-sm uppercase leading-none">{r.author_name}</p>
                <p className="spec text-[11px] text-muted">{new Date(r.created_at).toLocaleDateString("sv-SE")}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
