import type { ReactNode } from "react";
import { NOINDEX } from "@/lib/seo";

// Sid-metadata för login-sidan (page.tsx är en client-komponent och kan
// inte exportera metadata själv).
export const metadata = {
  title: "Logga in eller skapa konto",
  description:
    "Logga in på Snabbtryck för sparade designs, delbara länkar och orderhistorik — eller skapa ett konto gratis.",
  robots: NOINDEX,
};

export default function LoggaInLayout({ children }: { children: ReactNode }) {
  return children;
}
