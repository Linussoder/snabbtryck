import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Din order", robots: NOINDEX };

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
