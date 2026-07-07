"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, computePrintArea, DesignSnapshot } from "@/lib/store";
import { computePrice } from "@/lib/pricing";
import { withOverride } from "@/lib/settings";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { kr } from "@/lib/format";
import { buildPrintFile, printViews, PrintFile } from "@/lib/printfile";
import { fetchDesignsForUser } from "@/lib/admin-data";
import { DesignCanvas } from "@/components/editor/DesignCanvas";
import { GarmentPicker } from "@/components/editor/GarmentPicker";
import { ImageTool } from "@/components/editor/ImageTool";
import { TextTool } from "@/components/editor/TextTool";
import { PlacementTool } from "@/components/editor/PlacementTool";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { AdvancedPanel } from "@/components/admin/AdvancedPanel";

type Tab = "plagg" | "bild" | "text" | "placering" | "lager" | "avancerat";
const TABS: { key: Tab; label: string }[] = [
  { key: "plagg", label: "Plagg" },
  { key: "bild", label: "Bild" },
  { key: "text", label: "Text" },
  { key: "placering", label: "Placering" },
  { key: "lager", label: "Lager" },
  { key: "avancerat", label: "Avancerat" },
];

function Panel({ tab }: { tab: Tab }) {
  switch (tab) {
    case "plagg": return <GarmentPicker />;
    case "bild": return <ImageTool />;
    case "text": return <TextTool />;
    case "placering": return <PlacementTool />;
    case "lager": return <LayerPanel />;
    case "avancerat": return <AdvancedPanel />;
  }
}

interface Cust { id: string; email: string; name: string; business: boolean }

function rid(p: string) { let s = ""; while (s.length < 9) s += Math.random().toString(36).slice(2); return p + s.slice(0, 9); }

export default function NewOrder() {
  const router = useRouter();
  const { push } = useToast();
  const { user } = useAuth();
  const { pricing, products } = useSettings();

  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const elements = useEditor((s) => s.elements);
  const serialize = useEditor((s) => s.serialize);
  const clearAll = useEditor((s) => s.clearAll);
  const loadSnapshot = useEditor((s) => s.loadSnapshot);

  const [tab, setTab] = useState<Tab>("plagg");
  const [custDesigns, setCustDesigns] = useState<DesignSnapshot[]>([]);
  const [preview, setPreview] = useState<PrintFile[] | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Kund
  const [selectedCust, setSelectedCust] = useState<Cust | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Cust[]>([]);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", address: "", zip: "", city: "", company: "" });

  // Rader (storlek/antal)
  const [rows, setRows] = useState<{ size: string; qty: number }[]>([]);
  useEffect(() => {
    setRows((r) => (r.length ? r : [{ size: garment.sizes[Math.floor(garment.sizes.length / 2)] ?? "M", qty: 1 }]));
  }, [garment.sizes]);

  // Pris
  const [manualPrice, setManualPrice] = useState(false);
  const [manualTotal, setManualTotal] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Betalning
  const [paid, setPaid] = useState(false);
  const [payMethod, setPayMethod] = useState("");

  // Färdig tryckfil (alternativ till design)
  const [printFile, setPrintFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Starta rent
  useEffect(() => { clearAll(); }, [clearAll]);

  const business = selectedCust?.business ?? false;

  const autoTotal = useMemo(() => {
    const g = withOverride(garment, products);
    const area = computePrintArea(elements, g);
    const sum = rows.reduce((acc, r) => {
      const p = computePrice(g, area, Math.max(1, r.qty), pricing);
      return acc + (business ? p.subtotalExclVat : p.subtotalInclVat);
    }, 0);
    return Math.max(0, Math.round(sum - discount));
  }, [garment, products, elements, rows, pricing, business, discount]);

  const total = manualPrice ? Math.round(manualTotal) : autoTotal;

  async function doSearch(v: string) {
    setSearch(v);
    if (v.trim().length < 2) { setResults([]); return; }
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id,email,name,business").or(`email.ilike.%${v}%,name.ilike.%${v}%`).limit(6);
    setResults((data ?? []) as Cust[]);
  }
  function pick(c: Cust) {
    setSelectedCust(c);
    setResults([]);
    setSearch("");
    const parts = (c.name ?? "").split(" ");
    setContact((f) => ({ ...f, firstName: parts[0] ?? "", lastName: parts.slice(1).join(" "), email: c.email }));
    fetchDesignsForUser(c.id).then(setCustDesigns).catch(() => setCustDesigns([]));
  }

  // Tryckfil-förhandsvisning: bygg den faktiska DTF-transferfilen per vy.
  async function showPreview() {
    if (!elements.length) { push({ kind: "error", title: "Ingen design att förhandsvisa" }); return; }
    setPreviewing(true);
    try {
      const design = serialize();
      const files = (await Promise.all(printViews(design).map((v) => buildPrintFile(design, v)))).filter(Boolean) as PrintFile[];
      setPreview(files);
    } catch { push({ kind: "error", title: "Kunde inte generera tryckfil" }); }
    setPreviewing(false);
  }

  async function create() {
    if (creating) return;
    if (!contact.email.trim()) { push({ kind: "error", title: "Ange kundens e-post" }); return; }
    if (!printFile && !elements.length) { push({ kind: "error", title: "Lägg till en design eller ladda upp en tryckfil" }); return; }
    setCreating(true);
    const supabase = createClient();
    const id = rid("ord_");
    const ref = "TR-" + Math.floor(100000 + Math.random() * 899999);
    const design = serialize();
    const lines = rows.map((r) => ({ garmentId: garment.id, colorIndex, size: r.size, qty: Math.max(1, r.qty) }));

    const { error } = await supabase.from("orders").insert({
      id, ref,
      user_id: selectedCust?.id ?? null,
      status: "Mottagen",
      total,
      business,
      contact,
      shipping: { method: "Manuell (admin)" },
      design,
      lines,
      paid,
      payment_method: payMethod || (paid ? "manuell" : null),
      discount_amount: manualPrice ? 0 : Math.round(discount),
      print_files: [],
    });
    if (error) { setCreating(false); push({ kind: "error", title: "Kunde inte skapa order", msg: error.message }); return; }

    // Färdig tryckfil → ladda upp till Storage under adminens mapp.
    if (printFile && user) {
      const ext = printFile.name.split(".").pop() || "png";
      const path = `${user.id}/${id}/tryckfil.${ext}`;
      const { error: upErr } = await supabase.storage.from("artwork").upload(path, printFile, { upsert: true, contentType: printFile.type });
      if (!upErr) await supabase.from("orders").update({ print_files: [{ elementId: "manual", path }] }).eq("id", id);
    }

    push({ kind: "success", title: "Order skapad", msg: ref });
    router.push(`/admin/orders/${id}`);
  }

  return (
    <div className="flex h-[calc(100dvh-60px)] flex-col">
      <div className="flex flex-none items-center justify-between border-b border-line px-4 py-2.5">
        <h1 className="head text-lg uppercase">Skapa order (admin)</h1>
        <span className="spec text-[11px] text-muted">Avancerat verktyg · fri uppladdning · manuellt pris</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Verktyg */}
        <aside className="hidden w-[300px] flex-none flex-col border-r border-line lg:flex">
          <nav className="flex flex-none flex-wrap border-b border-line">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2 spec text-[10px] uppercase ${tab === t.key ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto thin-scroll p-4"><Panel tab={tab} /></div>
        </aside>

        {/* Canvas */}
        <main className="flex min-w-0 flex-1 items-center justify-center bg-paper-2 grid-field p-4">
          <DesignCanvas />
        </main>

        {/* Orderpanel */}
        <aside className="hidden w-[340px] flex-none flex-col overflow-y-auto thin-scroll border-l border-line xl:flex">
          <div className="space-y-5 p-4">
            {/* Kund */}
            <section>
              <h2 className="eyebrow mb-2">Kund</h2>
              {selectedCust ? (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-paper-2 p-2 text-sm">
                  <span>{selectedCust.name || selectedCust.email} {selectedCust.business && <span className="spec text-cyan">· företag</span>}</span>
                  <button onClick={() => setSelectedCust(null)} className="text-muted hover:text-bad">×</button>
                </div>
              ) : (
                <div className="relative mb-2">
                  <input value={search} onChange={(e) => doSearch(e.target.value)} placeholder="Sök befintlig kund (e-post/namn)…" className="field w-full" />
                  {results.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-paper shadow-lg">
                      {results.map((c) => (
                        <button key={c.id} onClick={() => pick(c)} className="block w-full px-3 py-2 text-left text-sm hover:bg-paper-2">
                          {c.name || c.email} <span className="spec text-[11px] text-muted">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedCust && custDesigns.length > 0 && (
                <div className="mb-2">
                  <p className="spec mb-1 text-[10px] text-muted">Kundens sparade designer — klicka för att ladda in:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {custDesigns.map((d) => (
                      <button key={d.id} onClick={() => { loadSnapshot(d); push({ kind: "success", title: "Design laddad", msg: d.name }); }}
                        className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-signal">
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="spec mb-2 text-[10px] text-muted">…eller fyll i uppgifter för walk-in:</p>
              <div className="grid grid-cols-2 gap-2">
                <input value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} placeholder="Förnamn" className="field" />
                <input value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} placeholder="Efternamn" className="field" />
                <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="E-post" className="field col-span-2" />
                <input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Adress" className="field col-span-2" />
                <input value={contact.zip} onChange={(e) => setContact({ ...contact, zip: e.target.value })} placeholder="Postnr" className="field" />
                <input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} placeholder="Ort" className="field" />
                <input value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} placeholder="Företag (valfritt)" className="field col-span-2" />
              </div>
            </section>

            {/* Rader */}
            <section>
              <h2 className="eyebrow mb-2">Storlekar & antal — {garment.name}</h2>
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={r.size} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, size: e.target.value } : x))} className="field flex-1">
                      {garment.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="number" min={1} value={r.qty} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} className="field w-20" />
                    {rows.length > 1 && <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-muted hover:text-bad">×</button>}
                  </div>
                ))}
                <button onClick={() => setRows([...rows, { size: garment.sizes[0], qty: 1 }])} className="btn btn-ghost btn-sm">+ Rad</button>
              </div>
            </section>

            {/* Färdig tryckfil */}
            <section>
              <h2 className="eyebrow mb-2">Färdig tryckfil (valfritt)</h2>
              <label className="btn btn-outline btn-sm w-full cursor-pointer">
                {printFile ? printFile.name : "Ladda upp tryckfärdig fil"}
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setPrintFile(e.target.files?.[0] ?? null)} />
              </label>
              <p className="spec mt-1 text-[10px] text-muted">Bifogas ordern som tryckfil. Kan kombineras med designen ovan.</p>
              <button onClick={showPreview} disabled={previewing} className="btn btn-ghost btn-sm mt-2 w-full">
                {previewing ? "Genererar…" : "Förhandsvisa tryckfil (300 DPI)"}
              </button>
            </section>

            {/* Pris */}
            <section>
              <h2 className="eyebrow mb-2">Pris</h2>
              <div className="grid grid-cols-2 gap-2">
                <label className="block"><span className="spec text-[10px] text-muted">Rabatt (kr)</span>
                  <input type="number" value={discount} disabled={manualPrice} onChange={(e) => setDiscount(Number(e.target.value))} className="field w-full" /></label>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-1.5 py-1">
                    <input type="checkbox" checked={manualPrice} onChange={(e) => setManualPrice(e.target.checked)} className="h-4 w-4 accent-[var(--color-signal)]" />
                    <span className="spec text-[11px]">Manuellt pris</span>
                  </label>
                </div>
                {manualPrice && (
                  <label className="col-span-2 block"><span className="spec text-[10px] text-muted">Totalt {business ? "(exkl. moms)" : "(inkl. moms)"}</span>
                    <input type="number" value={manualTotal} onChange={(e) => setManualTotal(Number(e.target.value))} className="field w-full" /></label>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="head uppercase text-sm">Totalt</span>
                <span className="font-display text-2xl">{kr(total)}</span>
              </div>
            </section>

            {/* Betalning */}
            <section>
              <h2 className="eyebrow mb-2">Betalning</h2>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", label: "Obetald" }, { id: "swish", label: "Swish" }, { id: "kort", label: "Kort" }, { id: "kontant", label: "Kontant" }, { id: "faktura", label: "Faktura" }].map((p) => (
                  <button key={p.id} onClick={() => { setPayMethod(p.id); setPaid(p.id !== "" && p.id !== "faktura"); }}
                    className={`rounded-full border px-3 py-1 text-sm ${payMethod === p.id ? "border-signal bg-signal text-white" : "border-line text-muted hover:border-ink"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <label className="mt-2 flex items-center gap-1.5">
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-4 w-4 accent-[var(--color-signal)]" />
                <span className="spec text-[11px]">Markera som betald</span>
              </label>
            </section>

            <button onClick={create} disabled={creating} className="btn btn-primary w-full">
              {creating ? "Skapar…" : "Skapa order →"}
            </button>
          </div>
        </aside>
      </div>

      {/* Tryckfil-förhandsvisning */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-paper p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="head text-lg uppercase">Tryckfil · 300 DPI</h2>
              <button onClick={() => setPreview(null)} className="text-muted hover:text-ink">×</button>
            </div>
            {preview.length === 0 ? (
              <p className="text-sm text-muted">Inga element att generera tryckfil av.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {preview.map((f) => (
                  <div key={f.view} className="card overflow-hidden">
                    <div className="grid-field bg-paper-2 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.dataUrl} alt={`Tryckfil ${f.view}`} className="mx-auto max-h-56 w-auto" style={{ imageRendering: "pixelated" }} />
                    </div>
                    <div className="flex items-center justify-between border-t border-line px-3 py-2">
                      <span className="spec text-[11px] text-muted">{f.view} · {f.widthCm}×{f.heightCm} cm</span>
                      <a href={f.dataUrl} download={`tryckfil-${f.view}.png`} className="spec text-[11px] text-signal underline">Ladda ner</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
