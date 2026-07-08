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
    // Kompakt kort i nedre vänstra hörnet — täcker inte knappar (t.ex. "Lägg i
    // varukorg") som förr, när den spände över hela nederkanten.
    <div className="fixed bottom-4 left-4 right-4 z-[200] sm:right-auto sm:max-w-sm">
      <div className="flex flex-col items-start gap-2.5 rounded-[12px] border border-ink-line bg-ink px-4 py-3 text-paper shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 text-[13px] leading-snug text-paper/80">
          Vi använder endast nödvändiga cookies för inloggning. Vi spårar dig inte.{" "}
          <Link href="/integritetspolicy" aria-label="Läs mer om cookies i integritetspolicyn" className="text-signal hover:underline">Läs mer om cookies</Link>.
        </p>
        <button onClick={accept} className="btn btn-primary btn-sm flex-none">Okej</button>
      </div>
    </div>
  );
}
