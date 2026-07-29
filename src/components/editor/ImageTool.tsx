"use client";

import { useRef, useState } from "react";
import { useEditor } from "@/lib/store";
import { removeBackground } from "@/lib/bgremove";
import { useToast } from "@/components/ui/Toast";

export function ImageTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addImage = useEditor((s) => s.addImage);
  const updateEl = useEditor((s) => s.updateEl);
  const selected = useEditor((s) => s.selected());
  const { push } = useToast();

  const [drag, setDrag] = useState(false);
  const [bgLoad, setBgLoad] = useState(false);
  const [preview, setPreview] = useState<{ id: string; before: string; after: string } | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      push({ kind: "error", title: "Fel filtyp", msg: "Ladda upp en bild (PNG/JPG/SVG)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        addImage(src, img.naturalWidth, img.naturalHeight);
        push({ kind: "success", title: "Bild tillagd", msg: `${img.naturalWidth}×${img.naturalHeight} px` });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  async function removeBg() {
    if (!selected || selected.type !== "image") return;
    setBgLoad(true);
    try {
      const after = await removeBackground(selected.src);
      setPreview({ id: selected.id, before: selected.src, after });
    } catch {
      push({ kind: "error", title: "Kunde inte ta bort bakgrund" });
    } finally {
      setBgLoad(false);
    }
  }

  function applyBg() {
    if (!preview) return;
    updateEl(preview.id, { src: preview.after, bgRemoved: true });
    setPreview(null);
    push({ kind: "success", title: "Bakgrund borttagen" });
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <section>
        <h3 className="eyebrow mb-2">Ladda upp</h3>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`crop-frame flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[3px] border-2 border-dashed p-6 text-center transition-colors ${
            drag ? "border-signal bg-signal/5" : "border-line hover:border-muted"
          }`}
        >
          <span className="text-2xl">↥</span>
          <p className="font-display uppercase text-sm">Släpp bild här</p>
          <p className="spec text-[10px] text-muted">PNG · JPG · SVG · max 20 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </section>

      {/* Background removal (selected image) */}
      <section>
        <h3 className="eyebrow mb-2">AI-bakgrundsborttagning</h3>
        {selected?.type === "image" ? (
          <button onClick={removeBg} disabled={bgLoad} className="btn btn-outline btn-sm w-full">
            {bgLoad ? "Bearbetar…" : selected.bgRemoved ? "Kör igen" : "Ta bort bakgrund"}
          </button>
        ) : (
          <p className="spec text-[11px] text-muted">
            Markera en uppladdad bild på plagget för att ta bort dess bakgrund.
          </p>
        )}
      </section>

      {/* Before/after modal */}
      {preview && (
        <BeforeAfter
          before={preview.before}
          after={preview.after}
          onApply={applyBg}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function BeforeAfter({
  before,
  after,
  onApply,
  onCancel,
}: {
  before: string;
  after: string;
  onApply: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/60 p-4" onClick={onCancel}>
      <div className="card crop-frame w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl uppercase mb-3">Före / efter</h3>
        <div className="grid grid-cols-2 gap-3">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={before} alt="före" className="aspect-square w-full rounded-[3px] border border-line object-contain" />
            <figcaption className="spec mt-1 text-center text-[10px] text-muted">FÖRE</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={after}
              alt="efter"
              className="aspect-square w-full rounded-[3px] border border-line object-contain"
              style={{
                backgroundImage:
                  "linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
              }}
            />
            <figcaption className="spec mt-1 text-center text-[10px] text-muted">EFTER</figcaption>
          </figure>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="btn btn-ghost btn-sm flex-1">Ångra</button>
          <button onClick={onApply} className="btn btn-primary btn-sm flex-1">Använd</button>
        </div>
      </div>
    </div>
  );
}
