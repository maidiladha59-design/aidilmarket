import { createAdminClient } from "@/lib/supabase/admin";
import { PromoManager } from "@/components/admin/PromoManager";

export default async function AdminPromosPage() {
  const admin = createAdminClient();
  const { data: promos } = await admin.from("promos").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Promo</h1>
      <PromoManager promos={promos ?? []} />
    </div>
  );
}
