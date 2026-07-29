import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { robots: NOINDEX };

// Gate:ar hela /admin/* — requireAdmin() redirectar icke-admins (proxy skyddar redan mot ej inloggade).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return <AdminShell email={profile.email}>{children}</AdminShell>;
}
