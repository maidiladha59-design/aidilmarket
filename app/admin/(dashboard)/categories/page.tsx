import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("id, name, slug, is_active").order("sort_order");

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Kategori</h1>
      <CategoryManager categories={categories ?? []} />
    </div>
  );
}
