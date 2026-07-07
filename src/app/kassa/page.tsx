"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DesignThumb } from "@/components/ui/DesignThumb";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { useToast } from "@/components/ui/Toast";
import {
  Cart,
  CartAddon,
  getCart,
  setCart as persistCart,
  clearCart,
} from "@/lib/account";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { shippingCostFor, withOverride, isGarmentActive } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import { GARMENTS, getGarment } from "@/lib/garments";
import { computePrice } from "@/lib/pricing";
import { computePrintArea, uid } from "@/lib/store";
import { kr } from "@/lib/format";

type Pay = "kort" | "swish" | "faktura";

// Leveransuppgifter sparas i sessionen så de överlever navigering (t.ex. login).
const CHECKOUT_FORM_KEY = "snabbtryck.checkout.form.v1";

export default function Kassa() {
  const router = useRouter();
  const { push } = useToast();
  const [cart, setCartState] = useState<Cart | null>(null);
  const [addons, setAddons] = useState<CartAddon[]>([]);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0); // 0 leverans, 1 betalning
  const { user, profile, loading } = useAuth();
  const { pricing, shipping: shipCfg, products } = useSettings();
  const business = profile?.business ?? false;
  const [pay, setPay] = useState<Pay>("swish");
  const [placing, setPlacing] = useState(false);
  const [shipMethod, setShipMethod] = useState<string>("postombud");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    zip: "",
    city: "",
    company: "",
  });
  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const formRestored = useRef(false);

  const [discInput, setDiscInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; type: string; value: number; min_order: number } | null>(null);
  const [discMsg, setDiscMsg] = useState<string | null>(null);

  async function applyDiscount() {
    if (!discInput.trim()) return;
    const supabase = createClient();
    const { data } = await supabase.rpc("get_discount", { p_code: discInput.trim() });
    const c = Array.isArray(data) ? data[0] : data;
    if (!c) {
      setDiscount(null);
      setDiscMsg("Ogiltig eller utgången kod.");
      return;
    }
    setDiscount(c);
    setDiscMsg(null);
  }

  useEffect(() => {
    const c = getCart();
    setCartState(c);
    setAddons(c?.addons ?? []);
    setReady(true);
  }, []);

  // Återställ sparade leveransuppgifter (överlever t.ex. en login-omväg).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_FORM_KEY);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, []);

  // Spara leveransuppgifter löpande (hoppa första körningen så tomt inte skrivs).
  useEffect(() => {
    if (!formRestored.current) {
      formRestored.current = true;
      return;
    }
    try {
      sessionStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  // Förifyll namn/e-post från profilen när den laddats.
  useEffect(() => {
    if (!profile && !user) return;
    setForm((f) => {
      const nameParts = (profile?.name ?? "").split(" ");
      return {
        ...f,
        firstName: f.firstName || nameParts[0] || "",
        lastName: f.lastName || nameParts.slice(1).join(" ") || "",
        email: f.email || user?.email || "",
        company: f.company || profile?.company_name || "",
      };
    });
  }, [profile, user]);

  function updateAddons(next: CartAddon[]) {
    setAddons(next);
    if (cart) persistCart({ ...cart, addons: next });
  }

  if (!ready) return <PageShell><div className="p-16" /></PageShell>;

  if (!cart) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="flex justify-center">
            <ChevronMark size={28} color="#FFDA00" />
          </div>
          <h1 className="display mt-4 text-3xl">Varukorgen är tom</h1>
          <p className="mt-3 text-ink-soft">Designa något först, så dyker det upp här.</p>
          <Link href="/designa" className="btn btn-primary mt-6">Till verktyget</Link>
        </div>
      </PageShell>
    );
  }

  const g = withOverride(getGarment(cart.design.garmentId), products);
  const price = computePrice(g, computePrintArea(cart.design.elements, g), cart.qty, pricing);

  const addonRows = addons.map((a) => {
    const ag = withOverride(getGarment(a.garmentId), products);
    const ap = computePrice(ag, computePrintArea(cart.design.elements, ag), a.qty, pricing);
    return { a, ag, ap };
  });
  const pick = (p: { subtotalInclVat: number; subtotalExclVat: number }) =>
    business ? p.subtotalExclVat : p.subtotalInclVat;
  const itemsSum = pick(price) + addonRows.reduce((s, r) => s + pick(r.ap), 0);
  const inclVatSum =
    price.subtotalInclVat + addonRows.reduce((s, r) => s + r.ap.subtotalInclVat, 0);
  const vatSum = price.vat + addonRows.reduce((s, r) => s + r.ap.vat, 0);
  const shipping = shippingCostFor(shipCfg, inclVatSum, shipMethod);

  let discountAmount = 0;
  if (discount && itemsSum >= discount.min_order) {
    if (discount.type === "percent") discountAmount = itemsSum * (discount.value / 100);
    else if (discount.type === "fixed") discountAmount = discount.value;
    else if (discount.type === "free_shipping") discountAmount = shipping;
    discountAmount = Math.min(discountAmount, itemsSum + shipping);
  }
  const grand = itemsSum + shipping - discountAmount;

  async function placeOrder() {
    if (!cart || placing) return;
    setPlacing(true);
    // Gäst-utcheckning: skapa en anonym session så ordern får en ägare via RLS
    // (samma insert/läsning som för inloggade — inget konto krävs).
    if (!user) {
      const supabase = createClient();
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setPlacing(false);
        push({
          kind: "warn",
          title: "Logga in för att slutföra",
          msg: "Gäst-utcheckning är inte aktiverad just nu — logga in eller skapa konto.",
        });
        router.push("/logga-in?next=/kassa");
        return;
      }
    }
    const lines = [
      {
        garmentId: cart.design.garmentId,
        colorIndex: cart.design.colorIndex,
        size: cart.design.size,
        qty: cart.qty,
      },
      ...addons.map((a) => ({
        garmentId: a.garmentId,
        colorIndex: a.colorIndex,
        size: a.size,
        qty: a.qty,
      })),
    ];
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design: cart.design,
          lines,
          contact: form,
          shipping: { method: shipMethod },
          paymentMethod: pay,
          discountCode: discount?.code ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Något gick fel.");
      }
      clearCart();
      try { sessionStorage.removeItem(CHECKOUT_FORM_KEY); } catch { /* ignore */ }
      push({ kind: "success", title: "Order lagd!", msg: data.ref });
      router.push(`/order/${data.id}`);
    } catch (err) {
      setPlacing(false);
      push({
        kind: "error",
        title: "Kunde inte lägga ordern",
        msg: err instanceof Error ? err.message : "Försök igen.",
      });
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8">
        <div className="mb-8 max-w-2xl">
          <StepIndicator
            steps={["Design", "Leverans", "Betalning", "Klart"]}
            current={step + 1}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* form */}
          <div>
            {step === 0 ? (
              <section className="space-y-5">
                <h2 className="head text-2xl">Leverans</h2>
                {!user && !loading && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-paper-2 px-3 py-2.5">
                    <p className="spec text-[12px] text-muted">
                      Du beställer som gäst — inget konto krävs.
                    </p>
                    <Link
                      href="/logga-in?next=/kassa"
                      className="spec text-[12px] font-medium text-signal underline underline-offset-2"
                    >
                      Logga in för orderhistorik
                    </Link>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Förnamn" value={form.firstName} onChange={setField("firstName")} />
                  <Field label="Efternamn" value={form.lastName} onChange={setField("lastName")} />
                  <Field label="E-post" type="email" full value={form.email} onChange={setField("email")} />
                  <Field label="Adress" full value={form.address} onChange={setField("address")} />
                  <Field label="Postnummer" value={form.zip} onChange={setField("zip")} />
                  <Field label="Ort" value={form.city} onChange={setField("city")} />
                  {business && (
                    <Field label="Företag / org.nr" full value={form.company} onChange={setField("company")} />
                  )}
                </div>
                <div>
                  <h3 className="eyebrow mb-2">Leveranssätt</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {shipCfg.methods.map((m) => (
                      <Radio
                        key={m.id}
                        name="ship"
                        label={m.label}
                        note={`${m.deliveryDays} · ${inclVatSum >= shipCfg.freeThreshold ? "Fri" : m.price + " kr"}`}
                        checked={shipMethod === m.id}
                        onChange={() => setShipMethod(m.id)}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!form.firstName || !form.email || !form.address || !form.zip || !form.city) {
                      push({ kind: "error", title: "Fyll i leveransuppgifterna", msg: "Namn, e-post, adress, postnr och ort krävs." });
                      return;
                    }
                    setStep(1);
                  }}
                  className="btn btn-primary"
                >
                  Till betalning →
                </button>
              </section>
            ) : (
              <section className="space-y-5">
                <button onClick={() => setStep(0)} className="spec text-muted hover:text-ink">← Tillbaka till leverans</button>
                <h2 className="head text-2xl">Betalning</h2>
                <div className="space-y-2">
                  {(business ? (["faktura", "kort", "swish"] as Pay[]) : (["swish", "kort"] as Pay[])).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPay(p)}
                      className={`flex w-full items-center gap-3 rounded-[10px] border p-4 text-left transition-colors ${
                        pay === p ? "border-yellow bg-yellow/10" : "border-line hover:border-line-2"
                      }`}
                    >
                      <span className={`h-4 w-4 flex-none rounded-full border-2 ${pay === p ? "border-yellow bg-yellow" : "border-line-2"}`} />
                      <span className="head text-sm">
                        {p === "kort" ? "Kort" : p === "swish" ? "Swish" : "Faktura (30 dagar)"}
                      </span>
                      {p === "faktura" && <span className="spec ml-auto text-[10px] text-cyan">Endast företag</span>}
                    </button>
                  ))}
                </div>

                {pay === "kort" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Kortnummer" full placeholder="4242 4242 4242 4242" />
                    <Field label="Giltigt t.o.m." placeholder="MM/ÅÅ" />
                    <Field label="CVC" placeholder="123" />
                  </div>
                )}
                {pay === "swish" && (
                  <div className="card p-4 text-center">
                    <div className="mx-auto h-28 w-28 grid-field-ink bg-ink" />
                    <p className="spec mt-2 text-[11px] text-muted">Skanna med Swish-appen (demo)</p>
                  </div>
                )}
                {pay === "faktura" && (
                  <p className="card p-4 text-sm text-muted">Faktura skickas till angiven e-post/adress med 30 dagars betalningsvillkor.</p>
                )}

                <button onClick={placeOrder} disabled={placing} className="btn btn-primary w-full">
                  {placing ? "Lägger order…" : `Betala ${kr(grand)} →`}
                </button>
                <p className="spec text-[10px] text-muted">Demo-kassa — ingen riktig betalning genomförs.</p>
              </section>
            )}

            <Upsell
              design={cart.design}
              business={business}
              addons={addons}
              onAdd={(a) => updateAddons([...addons, a])}
            />
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card overflow-hidden">
              <div className="flex gap-3 border-b border-line p-4">
                <div className="h-20 w-20 flex-none rounded-[10px] bg-paper-2">
                  <DesignThumb design={cart.design} />
                </div>
                <div className="min-w-0">
                  <p className="truncate head text-lg leading-none">{cart.design.name}</p>
                  <p className="spec mt-1 text-[11px] text-muted">
                    {g.name} · {g.colors[cart.design.colorIndex]?.name} · {cart.design.size}
                  </p>
                  <p className="spec text-[11px] text-muted">{cart.qty} st</p>
                </div>
              </div>
              {addonRows.map(({ a, ag, ap }) => (
                <div key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <div className="h-12 w-12 flex-none rounded-[10px] bg-paper-2">
                    <DesignThumb design={{ ...cart.design, garmentId: a.garmentId, colorIndex: a.colorIndex }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate head text-sm leading-none">+ {ag.name}</p>
                    <p className="spec text-[10px] text-muted">{a.qty} st · {ag.colors[a.colorIndex]?.name}</p>
                  </div>
                  <span className="spec text-[11px]">{kr(pick(ap))}</span>
                  <button
                    onClick={() => updateAddons(addons.filter((x) => x.id !== a.id))}
                    className="text-muted hover:text-bad"
                    title="Ta bort tillägg"
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* Rabattkod */}
              <div className="border-b border-line px-4 py-3">
                {discount ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="spec text-signal">✓ {discount.code} tillämpad</span>
                    <button onClick={() => { setDiscount(null); setDiscInput(""); }} className="spec text-[11px] text-muted hover:text-bad">ta bort</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={discInput}
                      onChange={(e) => setDiscInput(e.target.value.toUpperCase())}
                      placeholder="Rabattkod"
                      className="field flex-1 text-sm"
                    />
                    <button onClick={applyDiscount} className="btn btn-outline btn-sm">Använd</button>
                  </div>
                )}
                {discMsg && <p className="spec mt-1 text-[11px] text-bad">{discMsg}</p>}
              </div>

              <div className="space-y-1.5 p-4 text-sm">
                <Sum label={business ? "Delsumma exkl. moms" : "Delsumma"} value={kr(itemsSum)} />
                <Sum label="Frakt" value={shipping === 0 ? "Fri" : kr(shipping)} />
                {discountAmount > 0 && discount && <Sum label={`Rabatt (${discount.code})`} value={`−${kr(discountAmount)}`} />}
                {!business && <Sum label="varav moms" value={kr(vatSum)} muted />}
                {business && <Sum label="Moms tillkommer (25%)" value={kr(vatSum)} muted />}
              </div>
              <div className="flex items-center justify-between border-t border-line bg-paper-2 p-4">
                <span className="head">Att betala</span>
                <span className="font-display text-3xl text-ink">{kr(grand)}</span>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 spec text-[11px] text-muted">
              <ChevronMark size={14} color="#00AEEF" /> Tryckfärdig fil genereras automatiskt vid order.
            </p>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function Upsell({
  design,
  business,
  addons,
  onAdd,
}: {
  design: Cart["design"];
  business: boolean;
  addons: CartAddon[];
  onAdd: (a: CartAddon) => void;
}) {
  // Matchande plagg — kundens design applicerad, ren marginal.
  const { pricing, products } = useSettings();
  const suggestions = GARMENTS.filter(
    (g) => g.id !== design.garmentId && !addons.some((a) => a.garmentId === g.id) && isGarmentActive(products, g.id)
  )
    .filter((g) => ["cap", "bag", "tshirt", "hoodie"].includes(g.id))
    .slice(0, 2);

  if (!suggestions.length) return null;

  return (
    <section className="mt-8 rounded-[14px] border border-line bg-paper-2 p-5">
      <div className="mb-3 flex items-center gap-2">
        <ChevronMark size={16} color="#FFDA00" />
        <h2 className="head text-lg">Matcha din design</h2>
      </div>
      <p className="mb-4 text-sm text-muted">Samma tryck, ett klick — perfekt komplement.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {suggestions.map((g) => {
          const go = withOverride(g, products);
          const applied = { ...design, garmentId: g.id, colorIndex: 0 };
          const p = computePrice(go, computePrintArea(design.elements, go), 1, pricing);
          const shown = business ? p.subtotalExclVat : p.subtotalInclVat;
          return (
            <div key={g.id} className="card flex items-center gap-3 p-3">
              <div className="h-16 w-16 flex-none rounded-[10px] bg-paper-2">
                <DesignThumb design={applied} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="head leading-none">{g.name}</p>
                <p className="spec mt-1 text-[11px] text-cyan">+ {kr(shown)}</p>
              </div>
              <button
                onClick={() =>
                  onAdd({ id: uid("add"), garmentId: g.id, colorIndex: 0, size: g.sizes[Math.floor(g.sizes.length / 2)], qty: 1 })
                }
                className="btn btn-outline btn-sm"
              >
                Lägg till
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Field({
  label,
  type = "text",
  full,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  full?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="eyebrow mb-1 block">{label}</span>
      <input type={type} placeholder={placeholder} className="field" value={value} onChange={onChange} />
    </label>
  );
}

function Radio({
  name,
  label,
  note,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  note: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-line p-3 hover:border-line-2">
      <input
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-signal)]"
      />
      <span>
        <span className="block head text-sm">{label}</span>
        <span className="spec text-[11px] text-muted">{note}</span>
      </span>
    </label>
  );
}

function Sum({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted" : ""}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
