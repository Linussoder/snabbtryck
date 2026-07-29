import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Lämna dina uppgifter till laget", robots: NOINDEX };

export default function SamlaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
