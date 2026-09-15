import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/utils";
import { VerifyPaymentButtons, VerifyTopupButtons } from "@/components/admin/VerifyPaymentButtons";

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();

  const [{ data: payments }, { data: topups }] = await Promise.all([
    admin
      .from("payments")
      .select("id, method, amount, proof_file_url, created_at, orders(order_number, profiles(full_name))")
      .eq("status", "PAYMENT_REVIEW")
      .order("created_at", { ascending: true }),
    admin
      .from("wallet_topup_requests")
      .select("id, amount, method, proof_file_url, created_at, profiles(full_name)")
      .eq("status", "PAYMENT_REVIEW")
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Pembayaran</h1>

      <section className="mb-8">
        <h2 className="font-display font-semibold text-ink-950 mb-3">Menunggu Verifikasi — Pesanan</h2>
        <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
          {!payments || payments.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">Tidak ada pembayaran yang menunggu verifikasi.</p>
          ) : (
            payments.map((p) => {
              const order = p.orders as unknown as { order_number: string; profiles: { full_name: string } | null } | null;
              return (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{order?.order_number}</p>
                    <p className="text-xs text-ink-500">
                      {order?.profiles?.full_name} · {p.method.toUpperCase()} · {formatRupiah(p.amount)}
                    </p>
                    {p.proof_file_url && (
                      <p className="text-xs text-signal-500 mt-0.5">Bukti: {p.proof_file_url.split("/").pop()}</p>
                    )}
                  </div>
                  <VerifyPaymentButtons paymentId={p.id} />
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display font-semibold text-ink-950 mb-3">Menunggu Verifikasi — Top Up Saldo</h2>
        <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
          {!topups || topups.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">Tidak ada permintaan top up.</p>
          ) : (
            topups.map((t) => {
              const profile = t.profiles as unknown as { full_name: string } | null;
              return (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{profile?.full_name}</p>
                    <p className="text-xs text-ink-500">
                      {t.method.toUpperCase()} · {formatRupiah(t.amount)}
                    </p>
                  </div>
                  <VerifyTopupButtons topupId={t.id} />
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
