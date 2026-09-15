import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Clock, RotateCcw } from "lucide-react";
import { OrderNowButton } from "@/components/order/OrderNowButton";
import { BuyDigitalButton } from "@/components/order/BuyDigitalButton";
import { WishlistButton } from "@/components/WishlistButton";
import { formatRupiah } from "@/lib/utils";

const UNIT_LABEL: Record<string, string> = {
  fixed: "",
  per_page: "/halaman",
  per_slide: "/slide",
  per_question: "/soal",
  per_sheet: "/sheet",
  custom: " (custom)",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_variations(id, name, price, extra_fee, description, is_active, sort_order), product_configuration_fields(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!product) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, profiles(full_name)")
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);

  const avgRating =
    reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const variations = (product.product_variations ?? [])
    .filter((v: { is_active: boolean }) => v.is_active)
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  const configFields = (product.product_configuration_fields ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  const unitSuffix = product.price_unit ? `/${product.price_unit}` : UNIT_LABEL[product.price_type] ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-ink-900/5">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-500 text-sm">Tidak ada gambar</div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-ink-950">{product.name}</h1>
            <WishlistButton productId={product.id} />
          </div>

          {avgRating && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
              <Star size={15} className="fill-gold-500 text-gold-500" />
              <span className="font-medium text-ink-800">{avgRating.toFixed(1)}</span>
              <span>({reviews?.length} ulasan)</span>
            </div>
          )}

          <p className="mt-4 font-display text-3xl font-bold text-signal-600">
            {formatRupiah(product.base_price)}
            <span className="text-base font-normal text-ink-500">{unitSuffix}</span>
          </p>

          <p className="mt-4 text-sm text-ink-700 leading-relaxed">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink-600">
            {product.estimated_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} /> {product.estimated_time}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <RotateCcw size={15} /> {product.revision_limit}x revisi
            </span>
          </div>

          <div className="mt-8">
            {product.is_digital ? (
              <BuyDigitalButton productId={product.id} />
            ) : (
              <OrderNowButton
                product={{
                  id: product.id,
                  name: product.name,
                  base_price: product.base_price,
                  price_type: product.price_type,
                  price_unit: product.price_unit,
                  express_fee_percent: product.express_fee_percent,
                  variations,
                  configFields,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-ink-950 mb-5">Ulasan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-card border border-ink-900/8 p-4">
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={13}
                      className={idx < r.rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"}
                    />
                  ))}
                </div>
                <p className="text-sm text-ink-700">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
