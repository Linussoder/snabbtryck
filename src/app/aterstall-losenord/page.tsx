"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { createClient } from "@/lib/supabase/client";

export default function AterstallLosenord() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session?.user);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    if (password.length < 6) return setError("Lösenordet måste vara minst 6 tecken.");
    if (password !== confirm) return setError("Lösenorden matchar inte.");
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      return setError("Kunde inte spara lösenordet — länken kan ha gått ut. Begär en ny.");
    }
    setDone(true);
    setTimeout(() => window.location.assign("/mina-skapelser"), 1200);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[440px] px-4 py-20 md:px-8">
        <div className="card p-8">
          <ChevronMark size={18} color="#FFDA00" />
          {!ready ? (
            <p className="spec mt-4 text-muted">Laddar…</p>
          ) : done ? (
            <>
              <h1 className="head mt-4 text-2xl">Klart!</h1>
              <p className="mt-2 text-ink-soft">
                Ditt lösenord är uppdaterat. Loggar in dig…
              </p>
            </>
          ) : !hasSession ? (
            <>
              <h1 className="head mt-4 text-2xl">Länken har gått ut</h1>
              <p className="mt-2 text-ink-soft">
                Återställningslänken är ogiltig eller redan använd. Begär en ny från
                inloggningssidan.
              </p>
              <a href="/logga-in" className="btn btn-primary btn-sm mt-6">
                Till inloggning →
              </a>
            </>
          ) : (
            <>
              <h1 className="head mt-4 text-2xl">Välj nytt lösenord</h1>
              <p className="mt-1 text-sm text-muted">
                Ange ett nytt lösenord för ditt konto.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nytt lösenord (minst 6 tecken)"
                  autoComplete="new-password"
                  className="field"
                  required
                />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Upprepa lösenord"
                  autoComplete="new-password"
                  className="field"
                  required
                />
                {error && <p className="text-sm text-bad">{error}</p>}
                <button type="submit" disabled={pending} className="btn btn-primary w-full">
                  {pending ? "Sparar…" : "Spara nytt lösenord →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
