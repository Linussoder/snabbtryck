"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const params = useSearchParams();
  const [business, setBusiness] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = params.get("next") || "/mina-skapelser";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || pending) return;
    setPending(true);
    setError(null);

    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        data: {
          name: name || email.split("@")[0],
          business,
          company_name: business ? company || null : null,
        },
      },
    });

    setPending(false);
    if (error) setError("Kunde inte skicka länken — försök igen.");
    else setSent(true);
  }

  return (
    <div className="mx-auto grid max-w-[1000px] gap-0 px-4 py-16 md:px-8 lg:grid-cols-2">
      {/* left brand panel */}
      <div className="panel-ink on-ink relative hidden overflow-hidden rounded-l-[18px] p-10 lg:block">
        <div className="halftone halftone-signal absolute inset-0 opacity-10" />
        <ChevronMark size={16} color="#FFDA00" />
        <h2 className="display mt-6 text-4xl">
          Spara. Dela.
          <br />
          Beställ igen.
        </h2>
        <p className="mt-4 text-paper/70">
          Ett konto samlar dina designs, delbara länkar och orderstatus. Företag
          får offert, fakturabetalning och priser exkl. moms.
        </p>
        <ul className="mt-8 space-y-3">
          {["Sparade skapelser", "Delbara godkännande-länkar", "Orderhistorik & status", "Sparade företagsloggor"].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-paper/80">
              <span className="text-yellow font-bold" aria-hidden>»</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* form */}
      <div className="card rounded-l-none border-l-0 p-8 max-lg:rounded-l-[18px] max-lg:border-l">
        {sent ? (
          <div className="py-6 text-center">
            <div className="flex justify-center">
              <ChevronMark size={22} color="#FFDA00" />
            </div>
            <h1 className="display mt-4 text-3xl">Kolla din mejl</h1>
            <p className="mt-3 text-ink-soft">
              Vi skickade en inloggningslänk till <span className="font-bold">{email}</span>.
              Klicka på länken så är du inloggad — ingen lösenord behövs.
            </p>
            <button
              onClick={() => setSent(false)}
              className="btn btn-ghost btn-sm mt-6"
            >
              ← Använd en annan e-post
            </button>
          </div>
        ) : (
          <>
            <h1 className="head text-2xl">Logga in eller skapa konto</h1>
            <p className="mt-1 text-sm text-muted">
              Ange din e-post så skickar vi en inloggningslänk.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Namn (valfritt)"
                className="field"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="E-post"
                className="field"
              />

              <label className="flex cursor-pointer items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={business}
                  onChange={(e) => setBusiness(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-signal)]"
                />
                <span className="text-sm">
                  Företagskonto <span className="text-muted">(priser exkl. moms, faktura)</span>
                </span>
              </label>
              {business && (
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Företagsnamn"
                  className="field"
                />
              )}

              {error && <p className="text-sm text-bad">{error}</p>}

              <button type="submit" disabled={pending} className="btn btn-primary w-full">
                {pending ? "Skickar länk…" : "Skicka inloggningslänk →"}
              </button>
            </form>
            <p className="mt-4 spec text-[10px] text-muted">
              Vi använder lösenordsfri inloggning via magisk länk (Supabase Auth).
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoggaIn() {
  return (
    <PageShell>
      <Suspense fallback={<div className="p-16" />}>
        <LoginInner />
      </Suspense>
    </PageShell>
  );
}
