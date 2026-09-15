import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/utils";
import { SuspendToggle } from "@/components/admin/SuspendToggle";

export default async function AdminCustomersPage() {
  const admin = createAdminClient();

  const { data: customers } = await admin
    .from("profiles")
    .select("id, full_name, whatsapp, wallet_balance, is_suspended, created_at, orders(id, total)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Pelanggan</h1>

      <div className="rounded-card border border-ink-900/8 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-100">
            <tr className="text-left text-ink-500">
              <th className="p-3 font-medium">Nama</th>
              <th className="p-3 font-medium">WhatsApp</th>
              <th className="p-3 font-medium">Total Order</th>
              <th className="p-3 font-medium">Total Belanja</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">
            {(customers ?? []).map((c) => {
              const orders = (c.orders as unknown as { id: string; total: number }[]) ?? [];
              const totalSpending = orders.reduce((sum, o) => sum + o.total, 0);
              return (
                <tr key={c.id} className="hover:bg-paper-50">
                  <td className="p-3 font-medium text-ink-900">{c.full_name ?? "-"}</td>
                  <td className="p-3 text-ink-600">{c.whatsapp ?? "-"}</td>
                  <td className="p-3 text-ink-600">{orders.length}</td>
                  <td className="p-3 text-ink-900">{formatRupiah(totalSpending)}</td>
                  <td className="p-3">
                    <SuspendToggle userId={c.id} isSuspended={c.is_suspended} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
