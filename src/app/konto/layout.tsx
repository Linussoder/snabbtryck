import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Mitt konto", robots: NOINDEX };

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
