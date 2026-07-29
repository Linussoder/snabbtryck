// POST /api/indexnow — pingar IndexNow (Bing m.fl.) med sajtens publika URL:er.
// Anropa efter deploy eller innehållsändring: curl -X POST https://www.snabbtryck.se/api/indexnow
// Valfri body: { "urls": ["https://www.snabbtryck.se/guider/..."] } för enskilda sidor.

import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";
import { SITE } from "@/lib/seo";

export async function POST(req: Request) {
  let urls: string[] | undefined;
  try {
    const body = await req.json();
    if (Array.isArray(body?.urls)) {
      urls = body.urls.filter(
        (u: unknown): u is string => typeof u === "string" && u.startsWith(SITE.url)
      );
    }
  } catch {
    // Ingen/ogiltig body → skicka alla publika rutter.
  }

  try {
    const result = await submitToIndexNow(urls);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 502 }
    );
  }
}
