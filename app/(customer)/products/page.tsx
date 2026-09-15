import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, productsQuery] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("is_active", true).order("sort_order"),
    (async () => {
      let query = supabase
        .from("products")
        .select("id, slug, name, short_description, base_price, price_type, price_unit, image, category_id")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (category) {
        const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (q) query = query.ilike("name", `%${q}%`);

      return query;
    })(),
  ]);

  const products = (productsQuery.data ?? []) as ProductCardData[];

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-950">Semua Produk</h1>
      <p className="mt-2 text-sm text-ink-600">Pilih layanan yang kamu butuhkan.</p>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        <FilterChip href="/products" active={!category} label="Semua" />
        {(categories ?? []).map((c) => (
          <FilterChip key={c.id} href={`/products?category=${c.slug}`} active={category === c.slug} label={c.name} />
        ))}
      </div>

      <div className="mt-8">
        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-ink-900/15 p-10 text-center text-sm text-ink-500">
            Belum ada produk untuk filter ini.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink-950 text-white" : "bg-white border border-ink-900/10 text-ink-700 hover:border-ink-900/25"
      }`}
    >
      {label}
    </Link>
  );
}
