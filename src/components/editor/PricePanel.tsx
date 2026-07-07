"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, usePrice, usePrintArea } from "@/lib/store";
import { DISCOUNT_TIERS, nextTier, VAT_RATE } from "@/lib/pricing";
import { evaluateQuality } from "@/lib/dpi";
import { kr, num, pct } from "@/lib/format";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useToast } from "@/components/ui/Toast";
import { shareDesign, setCart } from "@/lib/account";
import { createTeamOrder } from "@/lib/team";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSaveDesign } from "./useSaveDesign";

export function PricePanel() {
  const router = useRouter();
  const { push } = useToast();
  const garment = useEditor((s) => s.garment());
  const colorIndex = useEditor((s) => s.colorIndex);
  const size = useEditor((s) => s.size);
  const qty = useEditor((s) => s.qty);
  const setQty = useEditor((s) => s.setQty);
  const elements = useEditor((s) => s.elements);
  const price = usePrice();
  const areaCm2 = usePrintArea();
  const serialize = useEditor((s) => s.serialize);
  const designName = useEditor((s) => s.designName);
  const setName = useEditor((s) => s.setName);
  const color = garment.colors[colorIndex] ?? garment.colors[0];

  const { user, profile } = useAuth();
  const business = profile?.business ?? false;
  const save = useSaveDesign();

  // kvalitetsvarningar
  const warnings = elements
    .filter((e) => e.type === "image")
    .map((e) => {
      const wcm = e.w * garment.printRefWidthCm;
      const hcm = wcm * e.ar;
      return evaluateQuality(
        (e as { naturalW: number }).naturalW,
        (e as { naturalH: number }).naturalH,
        wcm,
        hcm
      );
    })
    .filter((q) => q.level !== "good");

  const next = nextTier(qty);
  const shown = business ? price.subtotalExclVat : price.subtotalInclVat;

  function share() {
    const token = shareDesign(serialize());
    const url = `${window.location.origin}/delad/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    push({ kind: "success", title: "Delbar länk kopierad", msg: url });
  }

  async function createTeamCollection() {
    if (!user) {
      push({ kind: "warn", title: "Logga in först", msg: "Skapa konto för att samla in storlekar från laget." });
      router.push("/logga-in?next=/designa");
      return;
    }
    const snap = serialize();
    const res = await createTeamOrder(snap, snap.name);
    if ("error" in res) {
      push({ kind: "error", title: "Kunde inte skapa insamling" });
      return;
    }
    const url = `${window.location.origin}/lag/samla/${res.token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    push({ kind: "success", title: "Insamlingslänk skapad & kopierad", msg: "Dela med laget!" });
    router.push(`/lag/hantera/${res.token}`);
  }

  function addToCart() {
    if (!elements.length) {
      push({ kind: "warn", title: "Tom design", msg: "Lägg till minst ett tryck först." });
      return;
    }
    setCart({ design: serialize(), qty });
    router.push("/kassa");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto thin-scroll p-4">
        {/* namn */}
        <input
          value={designName}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-b border-line bg-transparent pb-1 font-display text-lg uppercase focus:border-ink focus:outline-none"
          aria-label="Designnamn"
        />

        {/* sammanfattning */}
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-6 flex-none rounded-full border border-line"
            style={{ background: color.hex }}
          />
          <p className="text-sm">
            {garment.name} · {color.name} · {size}
          </p>
        </div>

        {/* qty */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="eyebrow">Antal</h3>
            {price.discountPct > 0 && (
              <span className="rounded-full bg-signal px-2 py-0.5 spec text-[10px] text-white">
                −{pct(price.discountPct)} mängdrabatt
              </span>
            )}
          </div>
          <div className="flex items-stretch gap-2">
            <button onClick={() => setQty(qty - 1)} className="btn btn-ghost btn-sm w-11">−</button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
              className="field w-full text-center font-display text-lg"
            />
            <button onClick={() => setQty(qty + 1)} className="btn btn-ghost btn-sm w-11">+</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setQty(n)}
                className="rounded-[3px] border border-line px-2 py-1 spec text-[11px] hover:border-ink"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* discount ladder */}
        <div>
          <h3 className="eyebrow mb-2">Mängdrabatt</h3>
          <div className="space-y-1">
            {DISCOUNT_TIERS.filter((t) => t.pct > 0).map((t) => {
              const active = qty >= t.min && (nextTier(qty)?.min ?? Infinity) > t.min;
              return (
                <div
                  key={t.min}
                  className={`flex items-center justify-between rounded-[3px] px-2 py-1 text-sm ${
                    active ? "bg-ink text-paper" : "text-muted"
                  }`}
                >
                  <span className="spec text-[11px]">från {t.min} st</span>
                  <span className="font-display">−{pct(t.pct)}</span>
                </div>
              );
            })}
          </div>
          {next && (
            <p className="spec mt-2 text-[11px] text-muted">
              + {next.min - qty} st till → −{pct(next.pct)} rabatt
            </p>
          )}
        </div>

        {/* breakdown */}
        <div className="rounded-[3px] border border-line">
          <Row label="Plaggpris / st" value={kr(price.base)} />
          <Row
            label={`Tryckyta ${num(areaCm2)} cm²`}
            value={price.printCost > 0 ? kr(price.printCost) : "—"}
          />
          <Row label="Pris / st" value={kr(price.unitAfterDiscount)} strong />
        </div>

        {/* quality warnings */}
        {warnings.length > 0 && (
          <div className="rounded-[3px] border border-warn bg-warn/10 p-3">
            <p className="font-display text-sm uppercase text-warn">
              ⚠ {warnings.length} kvalitetsvarning{warnings.length > 1 ? "ar" : ""}
            </p>
            <ul className="mt-1 space-y-1">
              {warnings.slice(0, 3).map((w, i) => (
                <li key={i} className="text-[12px] leading-snug text-ink/80">
                  {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* sticky footer */}
      <div className="border-t border-line bg-paper p-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="eyebrow">{business ? "Totalt exkl. moms" : "Totalt inkl. moms"}</p>
            <p className="spec text-[11px] text-muted">
              {qty} st ·{" "}
              {business
                ? `moms ${kr(price.vat)} tillkommer`
                : `varav moms ${kr(price.vat)}`}
            </p>
          </div>
          <PriceDisplay value={Math.round(shown)} size="lg" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={save} className="btn btn-ghost btn-sm">Spara</button>
          <button onClick={share} className="btn btn-ghost btn-sm">Dela länk</button>
        </div>
        <button onClick={createTeamCollection} className="btn btn-ghost btn-sm mt-2 w-full">
          Samla in storlekar (lag) »
        </button>
        <button onClick={addToCart} className="btn btn-primary mt-2 w-full">
          {business ? "Begär offert" : "Lägg i varukorg"} →
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm not-last:border-b not-last:border-line ${
        strong ? "font-display uppercase" : ""
      }`}
    >
      <span className={strong ? "" : "text-muted"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
