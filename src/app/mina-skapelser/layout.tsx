import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Mina skapelser", robots: NOINDEX };

export default function MinaSkapelserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
