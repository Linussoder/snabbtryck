import type { Metadata } from "next";
import { abs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Omdömen – vad kunderna tycker",
  description:
    "Läs vad kunder tycker om Snabbtryck: tryckkvalitet, leveranstid och designverktyget. Riktiga omdömen från riktiga beställningar — och lämna gärna ett eget.",
  alternates: { canonical: "/omdomen" },
  openGraph: {
    title: "Omdömen | Snabbtryck",
    description: "Vad kunderna tycker om tryck, leverans och designverktyget.",
    url: abs("/omdomen"),
    type: "website",
  },
};

export default function OmdomenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
