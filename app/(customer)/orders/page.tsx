import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, order_items(product_name_snapshot, quantity)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">Kamu belum punya pesanan.</p>
          <Link href="/products" className="text-sm font-semibold text-signal-500 hover:underline">
            Mulai pesan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-card border border-ink-900/8 bg-white p-4 hover:border-signal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-medium text-ink-950 text-sm">{order.order_number}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="text-sm text-ink-600 line-clamp-1">
                {order.order_items?.map((i: { product_name_snapshot: string }) => i.product_name_snapshot).join(", ")}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                <span>{new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                <span className="font-semibold text-ink-900">{formatRupiah(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
