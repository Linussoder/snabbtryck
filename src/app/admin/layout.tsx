import { requireAdmin } from "@/lib/auth";
import { AdminBar } from "@/components/admin/AdminBar";

// Gate:ar hela /admin/* — requireAdmin() redirectar icke-admins (proxy skyddar redan mot ej inloggade).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return (
    <div className="min-h-screen bg-paper">
      <AdminBar email={profile.email} />
      {children}
    </div>
  );
}
