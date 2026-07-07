"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Sajten använder endast nödvändiga cookies (inloggning/session). En kort
// informationsruta räcker — inget spårningssamtycke behövs i dagsläget.
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-ok")) setShow(true);
    } catch {
      /* localStorage blockerat → visa inte */
    }
  }, []);

  if (!show) return null;

  function accept() {
    try {
      localStorage.setItem("cookie-ok", "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] border-t border-ink-line bg-ink text-paper">
      <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center md:px-8">
        <p className="flex-1 text-sm text-paper/80">
          Vi använder nödvändiga cookies för inloggning och grundläggande funktion. Vi spårar dig inte.{" "}
          <Link href="/integritetspolicy" className="text-signal hover:underline">Läs mer</Link>.
        </p>
        <button onClick={accept} className="btn btn-primary btn-sm flex-none">Okej</button>
      </div>
    </div>
  );
}
