// IndexNow — pingar Bing (och andra IndexNow-motorer) när sidor skapas eller
// ändras. Kritiskt för AI-synlighet: ChatGPT:s webbsök använder Bings index.
// Nyckelfilen ligger i public/<key>.txt och måste matcha INDEXNOW_KEY.

import { SITE, abs } from "./seo";
import { publicRoutes } from "./routes";

export const INDEXNOW_KEY = "f440882776d0436a8f143c9dd579b281";

const ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
}

/** Skickar in angivna URL:er (absoluta) — eller alla publika sidor om inga anges. */
export async function submitToIndexNow(urls?: string[]): Promise<IndexNowResult> {
  const urlList = urls?.length ? urls : publicRoutes().map((r) => abs(r.path));
  const host = new URL(SITE.url).host;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: abs(`/${INDEXNOW_KEY}.txt`),
      urlList,
    }),
  });
  // 200/202 = mottaget. 4xx = fel på nyckel/host — ska synas i loggen.
  return { ok: res.ok, status: res.status, submitted: urlList.length };
}
