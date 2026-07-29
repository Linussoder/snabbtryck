import type { ReactNode } from "react";

// Sid-metadata för login-sidan (page.tsx är en client-komponent och kan
// inte exportera metadata själv).
export const metadata = {
  title: "Logga in eller skapa konto",
  description:
    "Logga in på Snabbtryck för sparade designs, delbara länkar och orderhistorik — eller skapa ett konto gratis.",
};

export default function LoggaInLayout({ children }: { children: ReactNode }) {
  return children;
}
