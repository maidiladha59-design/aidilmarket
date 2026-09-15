import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("id, order_number, status, total, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  const { data: orders } = await query;

  const statusFilters = Object.keys(ORDER_STATUS_LABEL);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Pesanan</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        <Link
          href="/admin/orders"
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${!status ? "bg-ink-950 text-white" : "bg-white border border-ink-900/10 text-ink-600"}`}
        >
          Semua
        </Link>
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${status === s ? "bg-ink-950 text-white" : "bg-white border border-ink-900/10 text-ink-600"}`}
          >
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-100">
            <tr className="text-left text-ink-500">
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Pelanggan</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-paper-50">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-signal-600 font-medium hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="p-3 text-ink-700">{(o.profiles as unknown as { full_name: string } | null)?.full_name}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[o.status]}`}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className="p-3 text-right font-medium text-ink-900">{formatRupiah(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
