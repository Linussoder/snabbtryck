import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Hantera lagbeställning", robots: NOINDEX };

export default function HanteraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
