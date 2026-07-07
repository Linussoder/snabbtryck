"use client";

import { useState } from "react";
import { useIsDirty } from "@/lib/store";
import { useSaveDesign } from "./useSaveDesign";

/**
 * Tunn banderoll överst i editorn som påminner om att spara när det finns
 * osparade ändringar. Går att stänga (påminnelsen kommer tillbaka vid nästa
 * ändring). Själva utkastet autosparas ändå lokalt så inget går förlorat.
 */
export function SaveReminder() {
  const dirty = useIsDirty();
  const save = useSaveDesign();
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!dirty || dismissed) return null;

  async function onSave() {
    setSaving(true);
    try {
      await save();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-none items-center gap-3 border-b border-warn/40 bg-warn/10 px-3 py-1.5 md:px-5">
      <span aria-hidden className="text-warn">●</span>
      <span className="spec text-[11px] leading-tight text-ink/80">
        Osparade ändringar — glöm inte att spara din design.
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
        >
          {saving ? "Sparar…" : "Spara"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-ghost btn-sm"
          aria-label="Dölj påminnelse"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
