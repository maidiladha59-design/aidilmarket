import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!adminUser || !adminUser.is_active) redirect("/admin/login");

  return (
    <div className="flex bg-paper-100 min-h-screen">
      <AdminSidebar role={adminUser.role} name={adminUser.full_name} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
