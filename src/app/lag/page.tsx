import type { Metadata } from "next";
import { LagClient } from "./LagClient";

export const metadata: Metadata = {
  title: "Lagbeställning – matchtröjor med namn & nummer",
  description:
    "Beställ matchtröjor och lagkläder med namn och nummer – padel, fotboll, innebandy och föreningar. Ladda upp loggan, förhandsgranska varje plagg och få volympris direkt. Inga uppläggsavgifter, tryckt och skickat inom 48 timmar.",
  alternates: { canonical: "/lag" },
  openGraph: {
    title: "Lagbeställning – matchtröjor med namn & nummer | Snabbtryck",
    description:
      "Beställ matchtröjor och lagkläder med namn och nummer – padel, fotboll, innebandy och föreningar. Ladda upp loggan, förhandsgranska varje plagg och få volympris direkt. Inga uppläggsavgifter, tryckt och skickat inom 48 timmar.",
    url: "/lag",
    type: "website",
  },
};

export default function Page() {
  return <LagClient />;
}
