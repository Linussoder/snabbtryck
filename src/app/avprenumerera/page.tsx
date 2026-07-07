"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ChevronMark } from "@/components/ui/ChevronMark";
import { createClient } from "@/lib/supabase/client";

function Inner() {
  const params = useSearchParams();
  const token = params.get("t");
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    const supabase = createClient();
    supabase.rpc("unsubscribe_by_token", { p_token: token }).then(({ data, error }) => {
      if (error || !data) setState("error");
      else {
        setEmail(data as string);
        setState("done");
      }
    });
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="flex justify-center">
        <ChevronMark size={20} color="#FFDA00" />
      </div>
      {state === "loading" && <p className="mt-4 text-muted">Avprenumererar…</p>}
      {state === "done" && (
        <>
          <h1 className="display mt-4 text-3xl">Avprenumererad</h1>
          <p className="mt-3 text-ink-soft">
            {email ? <><span className="font-bold">{email}</span> får</> : "Du får"} inte längre marknadsföringsmejl från oss.
            Orderbekräftelser och viktiga kontomejl skickas fortfarande.
          </p>
          <Link href="/" className="btn btn-primary mt-6">Till startsidan</Link>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="display mt-4 text-3xl">Ogiltig länk</h1>
          <p className="mt-3 text-muted">Länken är felaktig eller har redan använts. Du kan också styra dina mejlinställningar under Mitt konto.</p>
          <Link href="/konto" className="btn btn-primary mt-6">Till Mitt konto</Link>
        </>
      )}
    </div>
  );
}

export default function Avprenumerera() {
  return (
    <PageShell>
      <Suspense fallback={<div className="p-16" />}>
        <Inner />
      </Suspense>
    </PageShell>
  );
}
