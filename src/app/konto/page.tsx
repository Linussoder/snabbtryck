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

  const [form, setForm] = useState({ name: "", business: false, company_name: "", org_nr: "", marketing: false });
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState({ p1: "", p2: "" });
  const [busy, setBusy] = useState<"" | "profile" | "email" | "pw" | "export" | "delete">("");

  useEffect(() => {
    if (!loading && !user) router.push("/logga-in?next=/konto");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name ?? "", business: profile.business, company_name: profile.company_name ?? "", org_nr: profile.org_nr ?? "", marketing: profile.marketing_consent });
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
        marketing_consent: form.marketing,
      })
      .eq("id", user.id);
    setBusy("");
    push(error ? { kind: "error", title: "Kunde inte spara", msg: error.message } : { kind: "success", title: "Uppgifter sparade" });
  }

  async function exportData() {
    if (!user) return;
    setBusy("export");
    const supabase = createClient();
    const [designs, orders, teams] = await Promise.all([
      supabase.from("designs").select("*"),
      supabase.from("orders").select("*"),
      supabase.from("team_orders").select("*"),
    ]);
    const data = {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email, created_at: user.created_at },
      profile,
      designs: designs.data ?? [],
      orders: orders.data ?? [],
      team_orders: teams.data ?? [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `snabbtryck-mina-uppgifter-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBusy("");
    push({ kind: "success", title: "Export klar", msg: "Din data laddades ner som JSON." });
  }

  async function deleteAccount() {
    if (!confirm("Radera ditt konto permanent?\n\nDitt konto, sparade designer och profil tas bort och går inte att återställa. Lagda ordrar behålls anonymt för bokföring (lagkrav).")) return;
    if (!confirm("Är du helt säker? Detta går INTE att ångra.")) return;
    setBusy("delete");
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setBusy("");
      return push({ kind: "error", title: "Kunde inte radera", msg: error.message });
    }
    await signOut();
    window.location.assign("/?konto=raderat");
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
            <label className="flex cursor-pointer items-center gap-2 py-1">
              <input type="checkbox" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} className="h-4 w-4 accent-[var(--color-signal)]" />
              <span className="text-sm">Ja tack, skicka erbjudanden och nyheter via e-post <span className="text-muted">(kan avslutas när som helst)</span></span>
            </label>
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

        {/* Dina uppgifter (GDPR) */}
        <section className="card p-6">
          <h2 className="head text-lg uppercase">Dina uppgifter</h2>
          <p className="mt-1 text-sm text-muted">Enligt GDPR har du rätt att få ut all data vi lagrar om dig. Ladda ner den som JSON.</p>
          <button onClick={exportData} disabled={busy === "export"} className="btn btn-outline btn-sm mt-3">{busy === "export" ? "Exporterar…" : "↓ Ladda ner mina uppgifter"}</button>
          <p className="spec mt-3 text-[11px] text-muted">Läs mer om hur vi hanterar personuppgifter i vår <Link href="/integritetspolicy" className="link-underline">integritetspolicy</Link>.</p>
        </section>

        {/* Radera konto */}
        <section className="card border-bad/40 p-6">
          <h2 className="head text-lg uppercase text-bad">Radera konto</h2>
          <p className="mt-1 text-sm text-muted">
            Tar bort ditt konto, sparade designer och din profil permanent. Lagda ordrar behålls anonymt för bokföring (lagkrav enligt bokföringslagen).
          </p>
          <button onClick={deleteAccount} disabled={busy === "delete"} className="mt-3 rounded-lg border border-bad px-4 py-2 text-sm text-bad hover:bg-bad hover:text-white">
            {busy === "delete" ? "Raderar…" : "Radera mitt konto permanent"}
          </button>
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
