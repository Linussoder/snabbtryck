"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEditor, usePrice } from "@/lib/store";
import { GOOGLE_FONTS_HREF } from "@/lib/fonts";
import { getDesign, getShared } from "@/lib/account";
import { getDesignRemote } from "@/lib/designs-db";
import { getOrg } from "@/lib/orgs";
import { getGarment } from "@/lib/garments";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DesignCanvas } from "./DesignCanvas";
import { GarmentPicker } from "./GarmentPicker";
import { ImageTool } from "./ImageTool";
import { TextTool } from "./TextTool";
import { EmojiTool } from "./EmojiTool";
import { PlacementTool } from "./PlacementTool";
import { LayerPanel } from "./LayerPanel";
import { PricePanel } from "./PricePanel";

type Tab = "plagg" | "bild" | "text" | "emoji" | "placering" | "lager";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "plagg", label: "Plagg", icon: "▧" },
  { key: "bild", label: "Bild", icon: "▣" },
  { key: "text", label: "Text", icon: "T" },
  { key: "emoji", label: "Emoji", icon: "☺" },
  { key: "placering", label: "Placering", icon: "◎" },
  { key: "lager", label: "Lager", icon: "≡" },
];

function TabPanel({ tab }: { tab: Tab }) {
  switch (tab) {
    case "plagg":
      return <GarmentPicker />;
    case "bild":
      return <ImageTool />;
    case "text":
      return <TextTool />;
    case "emoji":
      return <EmojiTool />;
    case "placering":
      return <PlacementTool />;
    case "lager":
      return <LayerPanel />;
  }
}

export function EditorShell() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("plagg");
  const [sheet, setSheet] = useState<Tab | "pris" | null>(null);
  const setGarment = useEditor((s) => s.setGarment);
  const loadSnapshot = useEditor((s) => s.loadSnapshot);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const clearAll = useEditor((s) => s.clearAll);
  const view = useEditor((s) => s.view);
  const price = usePrice();

  useEffect(() => {
    const designId = params.get("design");
    const shared = params.get("shared");
    const garment = params.get("garment");
    const org = params.get("org");
    if (designId) {
      // Försök hämta från kontot (DB) först, fall tillbaka på lokalt utkast.
      getDesignRemote(designId).then((remote) => {
        const d = remote ?? getDesign(designId);
        if (d) loadSnapshot(d);
      });
    } else if (shared) {
      const d = getShared(shared);
      if (d) loadSnapshot({ ...d, id: "", name: d.name + " (kopia)" });
    } else if (org) {
      const o = getOrg(org);
      if (o) {
        if (garment) setGarment(garment);
        // förplacera organisationens låsta logga
        useEditor.getState().addImage(o.logoDataUrl, 400, 400);
        useEditor.getState().setName(`${o.name} — ${getGarment(garment ?? "tshirt").name}`);
      }
    } else if (garment) {
      setGarment(garment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100dvh-68px)] flex-col overflow-hidden bg-paper">
      {/* Google Fonts för kundtext (hoistas av React) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />

      {/* Editor tool-bar (huvudmenyn ligger ovanför via SiteHeader) */}
      <header className="flex h-12 flex-none items-center gap-3 border-b border-line px-3 md:px-5">
        <span className="eyebrow text-ink">Designverktyg</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={undo} className="btn btn-ghost btn-sm" title="Ångra">↺</button>
          <button onClick={redo} className="btn btn-ghost btn-sm" title="Gör om">↻</button>
          <button
            onClick={() => {
              if (confirm("Rensa alla element?")) clearAll();
            }}
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Rensa
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* LEFT (desktop) */}
        <aside className="hidden w-[300px] flex-none flex-col border-r border-line lg:flex">
          <nav className="flex flex-none border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  tab === t.key ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
              >
                <span className="font-display text-base leading-none">{t.icon}</span>
                <span className="spec text-[9px]">{t.label}</span>
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto thin-scroll p-4">
            <TabPanel tab={tab} />
          </div>
        </aside>

        {/* CENTER canvas */}
        <main className="relative flex min-w-0 flex-1 flex-col bg-paper-2 grid-field">
          <div className="flex flex-none items-center justify-between px-4 py-2">
            <span className="spec text-[11px] text-muted">
              ⊕ Vy: {view === "front" ? "Framsida" : view === "back" ? "Baksida" : "Ärm"}
            </span>
            <span className="spec text-[11px] text-muted hidden sm:inline">
              Dra · skala · rotera — tryckyta streckad
            </span>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-24 lg:pb-6">
            <DesignCanvas />
          </div>
        </main>

        {/* RIGHT price (desktop) */}
        <aside className="hidden w-[320px] flex-none border-l border-line xl:block">
          <PricePanel />
        </aside>
      </div>

      {/* MOBILE bottom bar */}
      <div className="flex flex-none items-center gap-2 border-t border-line bg-paper px-3 py-2 xl:hidden">
        <div className="flex-1">
          <p className="eyebrow leading-none">Totalt</p>
          <PriceDisplay value={Math.round(price.subtotalInclVat)} size="sm" />
        </div>
        <button onClick={() => setSheet("pris")} className="btn btn-outline btn-sm">Pris & order</button>
      </div>

      {/* MOBILE tool nav */}
      <nav className="flex flex-none border-t border-line bg-ink text-paper lg:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSheet(t.key)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2"
          >
            <span className="font-display text-base leading-none">{t.icon}</span>
            <span className="spec text-[9px] text-paper/70">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* MOBILE sheets */}
      {sheet && (
        <div className="fixed inset-0 z-[120] lg:hidden" onClick={() => setSheet(null)}>
          <div className="absolute inset-0 bg-ink/50" />
          <div
            className="sheet-up absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto thin-scroll rounded-t-xl border-t border-line bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-4 py-2">
              <span className="font-display uppercase">
                {sheet === "pris" ? "Pris & order" : TABS.find((t) => t.key === sheet)?.label}
              </span>
              <button onClick={() => setSheet(null)} className="btn btn-ghost btn-sm">Stäng</button>
            </div>
            <div className={sheet === "pris" ? "" : "p-4"}>
              {sheet === "pris" ? <PricePanel /> : <TabPanel tab={sheet as Tab} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
