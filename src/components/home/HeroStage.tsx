"use client";

import { useState } from "react";
import Link from "next/link";
import { GarmentImage } from "@/components/ui/GarmentImage";

const SWATCHES = [
  { name: "Svart", hex: "#141414", dark: true },
  { name: "Vit", hex: "#f4f4f0", dark: false },
  { name: "Marin", hex: "#1c2a44", dark: true },
  { name: "Ceriseröd", hex: "#b3122b", dark: true },
  { name: "Flaskgrön", hex: "#1f4030", dark: true },
  { name: "Signal", hex: "#ff4d1c", dark: true },
];

export function HeroStage() {
  const [ci, setCi] = useState(0);
  const [view, setView] = useState<"front" | "back">("front");
  const c = SWATCHES[ci];

  return (
    <div className="relative rise" style={{ animationDelay: "0.1s" }}>
      <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_34px_80px_-44px_rgba(17,17,20,0.4)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="spec text-[10px] text-muted">
            T-SHIRT · {c.name.toUpperCase()}
          </span>
          <div className="flex overflow-hidden rounded-full border border-line">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`spec px-2.5 py-1 text-[9px] uppercase transition-colors ${
                  view === v ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
              >
                {v === "front" ? "Fram" : "Bak"}
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full bg-white">
          <GarmentImage
            shape="tshirt"
            view={view}
            color={c.hex}
            dark={c.dark}
            alt={`T-shirt i färgen ${c.name}, ${view === "front" ? "framsida" : "baksida"}`}
          />

          {/* DPI chip */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-good bg-paper/90 px-2.5 py-1.5 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-good" />
            <span className="spec text-[11px]">312 DPI · Skarpt</span>
          </div>

          {/* price chip */}
          <div className="absolute bottom-3 right-3 rounded-[12px] border border-ink bg-ink px-3 py-2 text-paper">
            <span className="eyebrow text-paper/60">Pris / st</span>
            <p className="font-display text-2xl leading-none">149 kr</p>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="eyebrow">Färg</span>
        <div className="flex gap-2">
          {SWATCHES.map((s, i) => (
            <button
              key={s.hex}
              onClick={() => setCi(i)}
              aria-label={`Färg ${s.name}`}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                i === ci ? "border-cyan" : "border-line"
              }`}
              style={{ background: s.hex }}
            />
          ))}
        </div>
        <Link href="/designa" className="ml-2 text-sm link-underline">
          Öppna i verktyget
        </Link>
      </div>
    </div>
  );
}
