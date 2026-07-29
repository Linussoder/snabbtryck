import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Kassa", robots: NOINDEX };

export default function KassaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
