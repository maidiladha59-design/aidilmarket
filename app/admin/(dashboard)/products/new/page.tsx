import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("id, name").order("sort_order");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Tambah Produk</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
