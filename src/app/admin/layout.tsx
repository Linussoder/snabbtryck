import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

// Gate:ar hela /admin/* — requireAdmin() redirectar icke-admins (proxy skyddar redan mot ej inloggade).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return <AdminShell email={profile.email}>{children}</AdminShell>;
}
