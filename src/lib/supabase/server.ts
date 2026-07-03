import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase-klient bunden till request-cookies. För Server Components och Route Handlers.
 *  cookies() är async i Next 16 — därför är denna funktion async. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // I Server Components kan cookies inte skrivas — proxy.ts refreshar sessionen.
          // Try/catch gör detta säkert att anropa från båda kontexterna.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* anropat från Server Component utan skrivbar cookie-store */
          }
        },
      },
    }
  );
}
