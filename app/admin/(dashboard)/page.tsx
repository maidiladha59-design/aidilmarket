import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    { data: revenueOrders },
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { count: pendingPayment },
    { count: processing },
    { count: completed },
    { data: recentOrders },
  ] = await Promise.all([
    admin.from("orders").select("total").eq("status", "COMPLETED"),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "PAYMENT_REVIEW"),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "PROCESSING"),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    admin
      .from("orders")
      .select("id, order_number, status, total, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const revenue = (revenueOrders ?? []).reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatRupiah(revenue)} />
        <StatCard label="Total Pesanan" value={String(totalOrders ?? 0)} />
        <StatCard label="Total Pelanggan" value={String(totalCustomers ?? 0)} />
        <StatCard label="Total Produk" value={String(totalProducts ?? 0)} />
        <StatCard label="Menunggu Verifikasi" value={String(pendingPayment ?? 0)} accent="gold" />
        <StatCard label="Sedang Diproses" value={String(processing ?? 0)} accent="signal" />
        <StatCard label="Selesai" value={String(completed ?? 0)} accent="emerald" />
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-950">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm text-signal-500 hover:underline">
            Lihat semua
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-500 border-b border-ink-900/8">
              <th className="pb-2 font-medium">Order</th>
              <th className="pb-2 font-medium">Pelanggan</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(recentOrders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-ink-900/5 last:border-0">
                <td className="py-2.5">
                  <Link href={`/admin/orders/${o.id}`} className="text-signal-600 hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="py-2.5 text-ink-700">
                  {(o.profiles as unknown as { full_name: string } | null)?.full_name ?? "-"}
                </td>
                <td className="py-2.5 text-ink-700">{ORDER_STATUS_LABEL[o.status]}</td>
                <td className="py-2.5 text-right font-medium text-ink-900">{formatRupiah(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "gold" | "signal" | "emerald" }) {
  const accentClass = {
    gold: "text-gold-500",
    signal: "text-signal-600",
    emerald: "text-emerald-600",
  }[accent ?? "signal"];

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-4">
      <p className="text-xs text-ink-500 mb-1">{label}</p>
      <p className={`font-display text-xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}
