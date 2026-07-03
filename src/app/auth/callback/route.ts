import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic link landar här: Supabase redirectar med ?code=... (PKCE).
// Vi växlar koden mot en session (cookie-verifier finns redan via @supabase/ssr)
// och skickar vidare till ?next.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mina-skapelser";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/logga-in?error=auth`);
}
