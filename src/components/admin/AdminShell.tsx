"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { kr } from "@/lib/format";

const NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/admin", label: "Översikt", icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
  { href: "/admin/orders", label: "Ordrar", icon: <Icon d="M4 4h16v4H4zM4 10h16v10H4zM8 14h8" /> },
  { href: "/admin/production", label: "Produktion", icon: <Icon d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /> },
  { href: "/admin/customers", label: "Kunder", icon: <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /> },
  { href: "/admin/leads", label: "Leads", icon: <Icon d="M22 6l-10 7L2 6M2 6h20v12H2z" /> },
  { href: "/admin/discounts", label: "Rabatter", icon: <Icon d="M9 9h.01M15 15h.01M20 4L4 20M8.5 8.5a2 2 0 1 1 0-.01M15.5 15.5a2 2 0 1 1 0-.01" /> },
  { href: "/admin/inventory", label: "Lager", icon: <Icon d="M20 7l-8-4-8 4v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10" /> },
  { href: "/admin/analytics", label: "Analys", icon: <Icon d="M3 3v18h18M7 15l4-4 3 3 5-6" /> },
  { href: "/admin/marginal", label: "Marginal", icon: <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
  { href: "/admin/settings", label: "Inställningar", icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /> },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { push } = useToast();
  const [newOrders, setNewOrders] = useState(0);

  // Realtidsnotis: ny order → toast + badge på "Ordrar".
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as { ref?: string; total?: number };
        push({ kind: "success", title: `Ny order ${o.ref ?? ""}`, msg: o.total != null ? kr(o.total) : undefined });
        setNewOrders((n) => n + 1);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [push]);

  // Nollställ badge när man är på orderlistan.
  useEffect(() => {
    if (pathname.startsWith("/admin/orders")) setNewOrders(0);
  }, [pathname]);

  return (
    <div className="lg:flex">
      <aside className="border-b border-ink-line bg-ink text-paper lg:min-h-screen lg:w-56 lg:flex-none lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo variant="dark" size={18} />
            <span className="spec rounded bg-signal px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-signal text-white" : "text-on-dark-2 hover:bg-ink-2 hover:text-paper"
                }`}
              >
                {n.icon}
                <span className="whitespace-nowrap">{n.label}</span>
                {n.href === "/admin/orders" && newOrders > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1 text-[10px] font-bold text-white">
                    {newOrders}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-ink-line px-4 py-3 text-xs text-on-dark-3 lg:block">
          <p className="truncate">{email}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/" className="hover:text-paper">Sajten</Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="underline underline-offset-2 hover:text-paper"
            >
              Logga ut
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-paper">{children}</main>
    </div>
  );
}
