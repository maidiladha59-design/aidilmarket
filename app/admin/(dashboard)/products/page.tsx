import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("id, name, base_price, status, featured, popular, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-950">Produk</h1>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 rounded-full bg-signal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-signal-600">
          <Plus size={15} /> Tambah Produk
        </Link>
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-100">
            <tr className="text-left text-ink-500">
              <th className="p-3 font-medium">Nama</th>
              <th className="p-3 font-medium">Kategori</th>
              <th className="p-3 font-medium">Harga</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">
            {(products ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-paper-50">
                <td className="p-3 font-medium text-ink-900">
                  {p.name}
                  {p.featured && <span className="ml-2 text-[10px] text-gold-500">★ featured</span>}
                </td>
                <td className="p-3 text-ink-600">{(p.categories as unknown as { name: string } | null)?.name ?? "-"}</td>
                <td className="p-3 text-ink-900">{formatRupiah(p.base_price)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-900/10 text-ink-500"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-signal-500 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
