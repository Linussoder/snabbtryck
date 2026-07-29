import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Avprenumerera", robots: NOINDEX };

export default function AvprenumereraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
