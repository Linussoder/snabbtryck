import type { Metadata } from "next";
import { BulkprisClient } from "./BulkprisClient";

export const metadata: Metadata = {
  title: "Bulkpriskalkylator – räkna ut volympris direkt",
  description:
    "Räkna ut priset på volymtryck direkt – välj plagg, tryckstorlek och antal så ser du mängdrabatten live. DTF-tryck utan uppläggsavgifter, från 1 plagg. Perfekt för lag, föreningar och företag.",
  alternates: { canonical: "/bulkpris" },
  openGraph: {
    title: "Bulkpriskalkylator – räkna ut volympris direkt | Snabbtryck",
    description:
      "Räkna ut priset på volymtryck direkt – välj plagg, tryckstorlek och antal så ser du mängdrabatten live. DTF-tryck utan uppläggsavgifter, från 1 plagg. Perfekt för lag, föreningar och företag.",
    url: "/bulkpris",
    type: "website",
  },
};

export default function Page() {
  return <BulkprisClient />;
}
