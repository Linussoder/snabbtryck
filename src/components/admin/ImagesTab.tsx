"use client";

import { useState } from "react";
import { GARMENTS } from "@/lib/garments";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { ProductImagesConfig } from "@/lib/settings";

export function ImagesTab({ initial, onSave, saving }: { initial: ProductImagesConfig; onSave: (v: ProductImagesConfig) => void; saving: boolean }) {
  const { push } = useToast();
  const [draft, setDraft] = useState<ProductImagesConfig>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function upload(shape: string, view: "front" | "back", file: File) {
    setBusy(`${shape}-${view}`);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${shape}/${view}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setBusy(null);
      push({ kind: "error", title: "Uppladdning misslyckades", msg: error.message });
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    // cache-bust så en ersatt bild syns direkt
    const url = `${data.publicUrl}?v=${file.size}`;
    setDraft((d) => ({ ...d, [shape]: { ...d[shape], [view]: url } }));
    setBusy(null);
    push({ kind: "success", title: "Uppladdad", msg: "Glöm inte spara." });
  }

  function clear(shape: string, view: "front" | "back") {
    setDraft((d) => ({ ...d, [shape]: { ...d[shape], [view]: undefined } }));
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="head text-lg uppercase">Produktbilder</h2>
          <p className="spec mt-0.5 text-[11px] text-muted">Ladda upp egna fram-/bakbilder per plagg. Ersätter standardbilden i butiken. Spara för att aktivera.</p>
        </div>
        <button onClick={() => onSave(draft)} disabled={saving} className="btn btn-primary btn-sm flex-none">{saving ? "Sparar…" : "Spara"}</button>
      </div>

      <div className="space-y-3">
        {GARMENTS.map((g) => {
          const o = draft[g.shape] ?? {};
          return (
            <div key={g.id} className="flex flex-wrap items-center gap-4 border-b border-line py-2 last:border-0">
              <span className="w-24 flex-none head text-sm">{g.name}</span>
              {(["front", "back"] as const).map((view) => (
                <div key={view} className="flex items-center gap-2">
                  <div className="h-12 w-12 flex-none overflow-hidden rounded-sm border border-line bg-white">
                    {o[view] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o[view]} alt={`${g.name} ${view}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center spec text-[9px] text-muted-2">std</span>
                    )}
                  </div>
                  <div>
                    <p className="spec text-[10px] text-muted">{view === "front" ? "Fram" : "Bak"}</p>
                    <label className="cursor-pointer spec text-[11px] text-signal hover:underline">
                      {busy === `${g.shape}-${view}` ? "Laddar…" : "Ladda upp"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && upload(g.shape, view, e.target.files[0])}
                      />
                    </label>
                    {o[view] && (
                      <button onClick={() => clear(g.shape, view)} className="ml-2 spec text-[11px] text-muted hover:text-bad">rensa</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
