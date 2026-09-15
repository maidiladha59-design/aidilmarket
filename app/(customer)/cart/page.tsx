import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CartItemRow, type CartItemData } from "@/components/order/CartItemRow";
import { formatRupiah } from "@/lib/utils";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/cart");

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, deadline_at, product:products(slug, name, image, base_price), variation:product_variations(name, price)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cartItems = (items ?? []) as unknown as CartItemData[];

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.variation?.price ?? item.product.base_price;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Keranjang</h1>

      {cartItems.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">Keranjangmu masih kosong.</p>
          <Link href="/products" className="text-sm font-semibold text-signal-500 hover:underline">
            Jelajahi produk
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="rounded-card border border-ink-900/8 bg-white p-5 sticky top-20">
            <h2 className="font-display font-semibold text-ink-950 mb-4">Ringkasan</h2>
            <div className="flex justify-between text-sm text-ink-700 mb-2">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <p className="text-xs text-ink-500 mb-4">Biaya express (jika ada) dihitung saat checkout.</p>
            <Link
              href="/checkout"
              className="block w-full rounded-full bg-signal-500 py-3 text-center text-sm font-semibold text-white hover:bg-signal-600 transition-colors"
            >
              Lanjut ke Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
