"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, PageHead } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export default function Konto() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState({ name: "", business: false, company_name: "", org_nr: "" });
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState({ p1: "", p2: "" });
  const [busy, setBusy] = useState<"" | "profile" | "email" | "pw">("");

  useEffect(() => {
    if (!loading && !user) router.push("/logga-in?next=/konto");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name ?? "", business: profile.business, company_name: profile.company_name ?? "", org_nr: profile.org_nr ?? "" });
    if (user?.email) setNewEmail(user.email);
  }, [profile, user]);

  if (loading || !user) return <PageShell><div className="p-16" /></PageShell>;

  async function saveProfile() {
    if (!user) return;
    setBusy("profile");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name.trim(),
        business: form.business,
        company_name: form.business ? form.company_name.trim() || null : null,
        org_nr: form.business ? form.org_nr.trim() || null : null,
      })
      .eq("id", user.id);
    setBusy("");
    push(error ? { kind: "error", title: "Kunde inte spara", msg: error.message } : { kind: "success", title: "Uppgifter sparade" });
  }

  async function saveEmail() {
    if (!user || newEmail.trim() === user.email) return;
    setBusy("email");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setBusy("");
    if (error) return push({ kind: "error", title: "Kunde inte byta e-post", msg: error.message });
    push({ kind: "success", title: "Bekräfta bytet", msg: `En länk skickades till ${newEmail.trim()} — klicka för att slutföra.` });
  }

  async function savePassword() {
    if (pw.p1.length < 6) return push({ kind: "error", title: "Minst 6 tecken" });
    if (pw.p1 !== pw.p2) return push({ kind: "error", title: "Lösenorden matchar inte" });
    setBusy("pw");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw.p1 });
    setBusy("");
    if (error) return push({ kind: "error", title: "Kunde inte byta lösenord", msg: error.message });
    setPw({ p1: "", p2: "" });
    push({ kind: "success", title: "Lösenord uppdaterat" });
  }

  return (
    <PageShell>
      <PageHead index="KONTO" title="Mitt konto" sub="Hantera dina uppgifter, e-post och lösenord." />

      <div className="mx-auto max-w-[640px] space-y-6 px-4 py-12 md:px-8">
        {/* Profil */}
        <section className="card p-6">
          <h2 className="head text-lg uppercase">Uppgifter</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="eyebrow mb-1 block">Namn</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 py-1">
              <input type="checkbox" checked={form.business} onChange={(e) => setForm({ ...form, business: e.target.checked })} className="h-4 w-4 accent-[var(--color-signal)]" />
              <span className="text-sm">Företagskonto <span className="text-muted">(priser exkl. moms, faktura)</span></span>
            </label>
            {form.business && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow mb-1 block">Företagsnamn</span>
                  <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="field" />
                </label>
                <label className="block">
                  <span className="eyebrow mb-1 block">Org.nr</span>
                  <input value={form.org_nr} onChange={(e) => setForm({ ...form, org_nr: e.target.value })} className="field" />
                </label>
              </div>
            )}
            <button onClick={saveProfile} disabled={busy === "profile"} className="btn btn-primary btn-sm">{busy === "profile" ? "Sparar…" : "Spara uppgifter"}</button>
          </div>
        </section>

        {/* E-post */}
        <section className="card p-6">
          <h2 className="head text-lg uppercase">E-postadress</h2>
          <p className="mt-1 text-sm text-muted">Byte bekräftas via en länk till den nya adressen.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="field flex-1" />
            <button onClick={saveEmail} disabled={busy === "email" || newEmail.trim() === user.email} className="btn btn-outline btn-sm">{busy === "email" ? "Skickar…" : "Byt e-post"}</button>
          </div>
        </section>

        {/* Lösenord */}
        <section className="card p-6">
          <h2 className="head text-lg uppercase">Lösenord</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="password" value={pw.p1} onChange={(e) => setPw({ ...pw, p1: e.target.value })} placeholder="Nytt lösenord" autoComplete="new-password" className="field" />
            <input type="password" value={pw.p2} onChange={(e) => setPw({ ...pw, p2: e.target.value })} placeholder="Upprepa" autoComplete="new-password" className="field" />
          </div>
          <button onClick={savePassword} disabled={busy === "pw"} className="btn btn-primary btn-sm mt-3">{busy === "pw" ? "Sparar…" : "Byt lösenord"}</button>
        </section>

        {/* Meta / actions */}
        <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="text-sm text-muted">
            <p>Inloggad som <span className="text-ink">{user.email}</span></p>
            {profile?.role === "admin" && <Link href="/admin" className="spec text-signal">→ Till adminpanelen</Link>}
          </div>
          <div className="flex gap-2">
            <Link href="/mina-skapelser" className="btn btn-ghost btn-sm">Mina skapelser</Link>
            <button onClick={async () => { await signOut(); router.push("/"); }} className="btn btn-outline btn-sm">Logga ut</button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
