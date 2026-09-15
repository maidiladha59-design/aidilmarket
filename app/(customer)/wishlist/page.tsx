import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/wishlist");

  const { data: items } = await supabase
    .from("wishlists")
    .select("products(id, slug, name, short_description, base_price, price_type, price_unit, image)")
    .eq("user_id", user.id);

  const products = (items ?? []).map((i) => i.products).filter(Boolean) as unknown as ProductCardData[];

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Wishlist</h1>

      {products.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">Wishlist kamu masih kosong.</p>
          <Link href="/products" className="text-sm font-semibold text-signal-500 hover:underline">
            Jelajahi produk
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
