import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Återställ lösenord", robots: NOINDEX };

export default function AterstallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
