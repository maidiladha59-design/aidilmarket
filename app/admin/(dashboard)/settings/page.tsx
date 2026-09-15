import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { PaymentMethodForm } from "@/components/admin/PaymentMethodForm";

const ALL_TYPES = ["bank_jago", "dana", "gopay", "qris"] as const;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("admin_users").select("role").eq("id", user!.id).single();
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  const admin = createAdminClient();
  const { data: existing } = await admin.from("payment_methods").select("*");

  const methods = ALL_TYPES.map((type) => {
    const found = existing?.find((m) => m.type === type);
    return (
      found ?? {
        type,
        is_enabled: false,
        account_number: null,
        account_name: null,
        qris_image_url: null,
      }
    );
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Pengaturan Metode Pembayaran</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {methods.map((m) => (
          <PaymentMethodForm key={m.type} method={m} />
        ))}
      </div>
    </div>
  );
}
