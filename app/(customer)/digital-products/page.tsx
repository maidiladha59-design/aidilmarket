import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export default async function DigitalProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, short_description, base_price, price_type, price_unit, image")
    .eq("status", "published")
    .eq("is_digital", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-950">Produk Digital</h1>
      <p className="mt-2 text-sm text-ink-600">Template, ebook, dan file digital siap pakai — langsung download setelah pembayaran.</p>

      <div className="mt-8">
        {products && products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(products as ProductCardData[]).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-ink-900/15 p-10 text-center text-sm text-ink-500">
            Belum ada produk digital tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
