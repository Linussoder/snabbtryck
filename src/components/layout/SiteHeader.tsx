"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/designa", label: "Designa" },
  { href: "/mallar", label: "Mallar" },
  { href: "/lag", label: "Lagbeställning" },
  { href: "/ark", label: "Tryck på ark" },
  { href: "/mina-skapelser", label: "Mina skapelser" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const acc = profile ?? (user ? { name: user.email ?? "", business: false } : null);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink text-paper">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-6 px-4 md:px-8">
        <Link href="/" className="flex items-center" aria-label="Snabbtryck — hem">
          <Logo variant="dark" size={22} />
        </Link>

        <nav className="ml-4 hidden lg:flex items-center gap-6">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm font-medium transition-colors hover:text-paper ${
                pathname === n.href ? "text-paper" : "text-on-dark-2"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {acc ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="spec text-on-dark-3">
                {acc.business ? "▣ " : "◉ "}
                {acc.name.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="text-xs text-on-dark-3 hover:text-paper underline underline-offset-2"
              >
                Logga ut
              </button>
            </div>
          ) : (
            <Link
              href="/logga-in"
              className="hidden sm:inline text-sm text-on-dark-2 hover:text-paper"
            >
              Logga in
            </Link>
          )}
          <Link href="/designa" className="btn btn-primary btn-sm">
            Designa <span aria-hidden>→</span>
          </Link>
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Meny"
          >
            <span className="block h-0.5 w-5 bg-paper" />
            <span className="block h-0.5 w-5 bg-paper" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-line bg-ink-2 px-4 py-3">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-paper"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={acc ? "/mina-skapelser" : "/logga-in"}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-on-dark-2"
            >
              {acc ? "Mitt konto" : "Logga in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
