import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Delad design", robots: NOINDEX };

export default function DeladLayout({ children }: { children: React.ReactNode }) {
  return children;
}
