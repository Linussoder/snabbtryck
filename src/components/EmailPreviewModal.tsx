"use client";

import { useMemo } from "react";
import { DesignSnapshot } from "@/lib/store";
import { buildAbandonedEmail } from "@/lib/email";

export function EmailPreviewModal({
  design,
  to,
  firstName,
  onClose,
}: {
  design: DesignSnapshot;
  to: string;
  firstName?: string;
  onClose: () => void;
}) {
  const email = useMemo(() => buildAbandonedEmail(design, firstName), [design, firstName]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="card crop-frame flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <span className="eyebrow">Övergiven design · mejl (förhandsvisning)</span>
            <p className="font-display text-lg uppercase leading-none">{email.subject}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Stäng</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-paper-2 p-3">
          <iframe
            title="mejl-förhandsvisning"
            srcDoc={email.html}
            className="h-[440px] w-full rounded-[3px] border border-line bg-white"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-line p-4">
          <span className="spec text-[11px] text-muted flex-1">
            Skickas bara till kunder som valt marknadsföringsmejl, med avprenumereringslänk.
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm">Stäng</button>
        </div>
      </div>
    </div>
  );
}
