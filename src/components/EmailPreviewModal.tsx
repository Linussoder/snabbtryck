"use client";

import { useMemo, useState } from "react";
import { DesignSnapshot } from "@/lib/store";
import { buildAbandonedEmail, sendAbandonedEmail } from "@/lib/email";
import { useToast } from "@/components/ui/Toast";

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
  const { push } = useToast();
  const [sending, setSending] = useState(false);
  const email = useMemo(() => buildAbandonedEmail(design, firstName), [design, firstName]);

  async function send() {
    setSending(true);
    const res = await sendAbandonedEmail(to, design, firstName);
    setSending(false);
    push({
      kind: res.ok ? "success" : "error",
      title: res.ok ? "Påminnelse köad" : "Kunde inte skicka",
      msg: res.ok ? `Till ${to} · leverantör: ${res.provider}` : undefined,
    });
    if (res.ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="card crop-frame flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <span className="eyebrow">Övergiven design · mejl</span>
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
          <span className="spec text-[11px] text-muted flex-1">Mottagare: {to}</span>
          <button onClick={send} disabled={sending} className="btn btn-primary btn-sm">
            {sending ? "Skickar…" : "Skicka påminnelse (demo)"}
          </button>
        </div>
      </div>
    </div>
  );
}
