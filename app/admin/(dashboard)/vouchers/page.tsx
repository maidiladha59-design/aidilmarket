import { createAdminClient } from "@/lib/supabase/admin";
import { VoucherManager } from "@/components/admin/VoucherManager";

export default async function AdminVouchersPage() {
  const admin = createAdminClient();
  const { data: vouchers } = await admin.from("vouchers").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Voucher</h1>
      <VoucherManager vouchers={vouchers ?? []} />
    </div>
  );
}
