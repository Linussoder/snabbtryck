"use client";

import { useEffect, useState } from "react";
import { fetchAllReviews, setReviewApproved, deleteReview, type Review } from "@/lib/admin-data";
import { useToast } from "@/components/ui/Toast";

export default function AdminReviews() {
  const { push } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);

  async function refresh() {
    setReviews(await fetchAllReviews());
  }
  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  async function toggle(r: Review) {
    await setReviewApproved(r.id, !r.approved);
    push({ kind: "success", title: !r.approved ? "Publicerad" : "Avpublicerad" });
    refresh();
  }
  async function remove(r: Review) {
    if (!confirm("Ta bort omdömet?")) return;
    await deleteReview(r.id);
    refresh();
  }

  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <div className="mb-6">
        <p className="eyebrow text-muted">Internt · moderering</p>
        <h1 className="display text-3xl sm:text-4xl">Omdömen{pending > 0 && <span className="ml-2 text-warn text-xl">· {pending} väntar</span>}</h1>
      </div>

      {!ready ? (
        <div className="card p-12 text-center text-muted">Laddar…</div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 text-center text-muted">Inga omdömen ännu.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`card p-4 ${!r.approved ? "border-warn" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-signal">{"★".repeat(r.rating)}</span>
                  <span className="ml-2 head text-sm">{r.author_name}</span>
                  <span className="spec ml-2 text-[11px] text-muted">{new Date(r.created_at).toLocaleDateString("sv-SE")}</span>
                  {!r.approved && <span className="ml-2 spec text-[10px] text-warn">GRANSKAS</span>}
                </div>
                <div className="flex flex-none gap-2">
                  <button onClick={() => toggle(r)} className={`spec text-[11px] ${r.approved ? "text-muted" : "text-signal"}`}>
                    {r.approved ? "Avpublicera" : "Publicera"}
                  </button>
                  <button onClick={() => remove(r)} className="text-muted hover:text-bad">×</button>
                </div>
              </div>
              <p className="mt-2 text-sm">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
