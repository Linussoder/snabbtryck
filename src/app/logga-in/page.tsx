"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "reset";

function mapError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Fel e-post eller lösenord.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Det finns redan ett konto med den e-posten — logga in i stället.";
  if (m.includes("email not confirmed"))
    return "Bekräfta din e-post först — kolla din inkorg (och skräpposten).";
  if (m.includes("email address") && m.includes("invalid"))
    return "Ogiltig e-postadress — kontrollera att den är rätt.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "Registrering är tillfälligt avstängd — försök senare.";
  if (m.includes("password") && m.includes("at least"))
    return "Lösenordet måste vara minst 6 tecken.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "För många försök — vänta en stund och prova igen.";
  return "Något gick fel — försök igen.";
}

function LoginInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState(false);
  const [company, setCompany] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const next = params.get("next") || "/mina-skapelser";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const supabase = createClient();

    // --- glömt lösenord ---
    if (mode === "reset") {
      if (!email) return setError("Fyll i din e-post.");
      setPending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/aterstall-losenord`,
      });
      setPending(false);
      if (error) return setError(mapError(error.message));
      setResetSent(true);
      return;
    }

    if (!email || !password) return setError("Fyll i både e-post och lösenord.");
    if (mode === "register" && password.length < 6)
      return setError("Lösenordet måste vara minst 6 tecken.");
    setPending(true);

    // --- logga in ---
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setPending(false);
      if (error) return setError(mapError(error.message));
      window.location.assign(next);
      return;
    }

    // --- skapa konto ---
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          name: name || email.split("@")[0],
          business,
          company_name: business ? company || null : null,
          marketing_consent: marketing,
        },
      },
    });
    if (error) {
      setPending(false);
      return setError(mapError(error.message));
    }
    if (data.session) {
      window.location.assign(next);
      return;
    }
    // Kontot auto-bekräftas i databasen → logga in direkt så det blir ett steg.
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (!signInErr) {
      window.location.assign(next);
      return;
    }
    setConfirmSent(true); // fallback: om bekräftelse ändå krävs
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setConfirmSent(false);
    setResetSent(false);
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
        {confirmSent ? (
          <div className="py-6 text-center">
            <div className="flex justify-center">
              <ChevronMark size={22} color="#FFDA00" />
            </div>
            <h1 className="head mt-4 text-2xl">Bekräfta din e-post</h1>
            <p className="mt-3 text-ink-soft">
              Vi skickade en bekräftelselänk till <span className="font-bold">{email}</span>.
              Klicka på den så är kontot aktiverat och du loggas in.
            </p>
            <button onClick={() => switchMode("login")} className="btn btn-ghost btn-sm mt-6">
              ← Tillbaka till inloggning
            </button>
          </div>
        ) : resetSent ? (
          <div className="py-6 text-center">
            <div className="flex justify-center">
              <ChevronMark size={22} color="#FFDA00" />
            </div>
            <h1 className="head mt-4 text-2xl">Kolla din mejl</h1>
            <p className="mt-3 text-ink-soft">
              Om det finns ett konto för <span className="font-bold">{email}</span> har vi skickat
              en återställningslänk. Klicka på den så får du välja ett nytt lösenord.
            </p>
            <button onClick={() => switchMode("login")} className="btn btn-ghost btn-sm mt-6">
              ← Tillbaka till inloggning
            </button>
          </div>
        ) : mode === "reset" ? (
          <>
            <h1 className="head text-2xl">Återställ lösenord</h1>
            <p className="mt-1 text-sm text-muted">
              Ange din e-post så skickar vi en länk för att välja ett nytt lösenord.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="E-post"
                autoComplete="email"
                className="field"
              />
              {error && <p className="text-sm text-bad">{error}</p>}
              <button type="submit" disabled={pending} className="btn btn-primary w-full">
                {pending ? "Skickar…" : "Skicka återställningslänk →"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted">
              <button onClick={() => switchMode("login")} className="link-underline font-medium text-ink">
                ← Tillbaka till inloggning
              </button>
            </p>
          </>
        ) : (
          <>
            {/* mode toggle */}
            <div className="mb-6 flex gap-1 rounded-full border border-line p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 rounded-full py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                    mode === m ? "bg-ink text-paper" : "text-muted hover:text-ink"
                  }`}
                >
                  {m === "login" ? "Logga in" : "Skapa konto"}
                </button>
              ))}
            </div>

            <h1 className="head text-2xl">
              {mode === "login" ? "Välkommen tillbaka" : "Skapa ditt konto"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {mode === "login"
                ? "Logga in med e-post och lösenord."
                : "Kom igång på under en minut."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              {mode === "register" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Namn"
                  autoComplete="name"
                  className="field"
                />
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="E-post"
                autoComplete="email"
                className="field"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder={mode === "register" ? "Lösenord (minst 6 tecken)" : "Lösenord"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="field"
              />

              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-xs text-muted hover:text-ink"
                  >
                    Glömt lösenord?
                  </button>
                </div>
              )}

              {mode === "register" && (
                <>
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
                      autoComplete="organization"
                      className="field"
                    />
                  )}
                  <label className="flex cursor-pointer items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-signal)]"
                    />
                    <span className="text-sm text-muted">Skicka mig erbjudanden och nyheter via e-post (valfritt)</span>
                  </label>
                </>
              )}

              {error && <p className="text-sm text-bad">{error}</p>}

              <button type="submit" disabled={pending} className="btn btn-primary w-full">
                {pending
                  ? "Ett ögonblick…"
                  : mode === "login"
                  ? "Logga in →"
                  : "Skapa konto →"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted">
              {mode === "login" ? (
                <>
                  Har du inget konto?{" "}
                  <button onClick={() => switchMode("register")} className="link-underline font-medium text-ink">
                    Skapa ett
                  </button>
                </>
              ) : (
                <>
                  Har du redan ett konto?{" "}
                  <button onClick={() => switchMode("login")} className="link-underline font-medium text-ink">
                    Logga in
                  </button>
                </>
              )}
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
