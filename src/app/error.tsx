"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronMark } from "@/components/ui/ChevronMark";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Logga till konsolen så felet syns i drift (ingen extern övervakning).
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <ChevronMark size={22} color="#FFDA00" />
        <p className="eyebrow mt-5 text-muted">Något gick fel</p>
        <h1 className="display mt-2 text-4xl">Oj, det tog stopp</h1>
        <p className="mt-3 text-sm text-muted">
          Ett oväntat fel uppstod. Försök igen — dina sparade designer och ordrar är oförändrade.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">Försök igen</button>
          <Link href="/" className="btn btn-ghost">Till startsidan</Link>
        </div>
      </div>
    </div>
  );
}
