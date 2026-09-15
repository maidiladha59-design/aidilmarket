import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { TopupButton } from "@/components/wallet/TopupButton";
import { formatRupiah } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  bank_jago: "Bank Jago",
  dana: "DANA",
  gopay: "GoPay",
  qris: "QRIS",
};

const WALLET_TYPE_LABEL: Record<string, string> = {
  topup: "Top Up",
  purchase: "Pembayaran",
  refund: "Refund",
  adjustment: "Penyesuaian",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: ledger }, { data: paymentMethods }] = await Promise.all([
    supabase.from("profiles").select("full_name, whatsapp, wallet_balance").eq("id", user.id).single(),
    supabase
      .from("wallet_ledger")
      .select("id, type, amount, balance_after, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("payment_methods").select("*").eq("is_enabled", true),
  ]);

  const methodOptions = (paymentMethods ?? [])
    .filter((m) => m.type !== "wallet")
    .map((m) => ({
      type: m.type as "bank_jago" | "dana" | "gopay" | "qris",
      label: METHOD_LABEL[m.type] ?? m.type,
      account_number: m.account_number,
      account_name: m.account_name,
      qris_image_url: m.qris_image_url,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Profil</h1>

      <div className="rounded-card bg-ink-950 text-white p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-paper-100/60 mb-1">Saldo Wallet</p>
          <p className="font-display text-2xl font-bold">{formatRupiah(profile?.wallet_balance ?? 0)}</p>
        </div>
        <TopupButton methods={methodOptions} />
      </div>

      <div className="mb-6">
        <ProfileForm initialName={profile?.full_name ?? ""} initialWhatsapp={profile?.whatsapp ?? ""} />
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white p-5">
        <h2 className="font-display font-semibold text-ink-950 mb-4">Riwayat Transaksi Wallet</h2>
        {!ledger || ledger.length === 0 ? (
          <p className="text-sm text-ink-500">Belum ada transaksi.</p>
        ) : (
          <div className="divide-y divide-ink-900/8">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{WALLET_TYPE_LABEL[entry.type] ?? entry.type}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(entry.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={`font-semibold ${entry.amount >= 0 ? "text-emerald-600" : "text-flag-500"}`}>
                  {entry.amount >= 0 ? "+" : ""}
                  {formatRupiah(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
