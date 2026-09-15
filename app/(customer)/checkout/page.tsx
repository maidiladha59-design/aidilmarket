import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/order/CheckoutForm";
import { formatRupiah } from "@/lib/utils";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, quantity, product:products(name, base_price), variation:product_variations(name, price)")
    .eq("user_id", user.id);

  const cartItems = (items ?? []) as unknown as {
    id: string;
    quantity: number;
    product: { name: string; base_price: number };
    variation: { name: string; price: number } | null;
  }[];

  if (cartItems.length === 0) redirect("/cart");

  const subtotal = cartItems.reduce((sum, i) => sum + (i.variation?.price ?? i.product.base_price) * i.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="rounded-card border border-ink-900/8 bg-white p-5">
          <h2 className="font-display font-semibold text-ink-950 mb-4">Ringkasan Pesanan</h2>
          <div className="divide-y divide-ink-900/8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{item.product.name}</p>
                  {item.variation && <p className="text-xs text-ink-500">{item.variation.name}</p>}
                  <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium text-ink-900">
                  {formatRupiah((item.variation?.price ?? item.product.base_price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Biaya express (jika deadline kurang dari 24 jam) dan diskon voucher dihitung otomatis
            saat pesanan dikonfirmasi.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-ink-900/8 bg-white p-5">
            <div className="flex justify-between text-sm text-ink-700">
              <span>Subtotal</span>
              <span className="font-semibold text-ink-950">{formatRupiah(subtotal)}</span>
            </div>
          </div>
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
