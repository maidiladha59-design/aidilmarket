import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  base_price: number;
  price_type: string;
  price_unit: string | null;
  image: string | null;
  rating?: number;
  reviewCount?: number;
};

const UNIT_LABEL: Record<string, string> = {
  fixed: "",
  per_page: "/halaman",
  per_slide: "/slide",
  per_question: "/soal",
  per_sheet: "/sheet",
  custom: " (custom)",
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const unitSuffix = product.price_unit ? `/${product.price_unit}` : UNIT_LABEL[product.price_type] ?? "";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-card border border-ink-900/8 bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-ink-900/5">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-600/40 text-sm">
            Tidak ada gambar
          </div>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-ink-950 text-[15px] leading-snug line-clamp-1">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="mt-1 text-sm text-ink-600 line-clamp-2">{product.short_description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display font-bold text-signal-600 text-sm">
            Rp{product.base_price.toLocaleString("id-ID")}
            <span className="text-ink-500 font-normal text-xs">{unitSuffix}</span>
          </span>
          {product.rating !== undefined && (
            <span className="flex items-center gap-1 text-xs text-ink-600">
              <Star size={13} className="fill-gold-500 text-gold-500" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
