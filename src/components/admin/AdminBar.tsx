"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/admin", label: "Ordrar" },
  { href: "/admin/marginal", label: "Marginal" },
];

export function AdminBar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink text-paper">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-6 px-4 md:px-8">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo variant="dark" size={20} />
          <span className="spec rounded bg-signal px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
        </Link>
        <nav className="flex items-center gap-5">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-medium transition-colors hover:text-paper ${active ? "text-paper" : "text-on-dark-2"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="spec hidden text-on-dark-3 sm:inline">{email}</span>
          <Link href="/" className="text-xs text-on-dark-3 hover:text-paper">Till sajten</Link>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="text-xs text-on-dark-3 underline underline-offset-2 hover:text-paper"
          >
            Logga ut
          </button>
        </div>
      </div>
    </header>
  );
}
