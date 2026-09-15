"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { removeCartItem, updateCartItemQuantity } from "@/lib/actions/cart";
import { formatRupiah } from "@/lib/utils";

export type CartItemData = {
  id: string;
  quantity: number;
  deadline_at: string | null;
  product: { slug: string; name: string; image: string | null; base_price: number };
  variation: { name: string; price: number } | null;
};

export function CartItemRow({ item }: { item: CartItemData }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [pending, startTransition] = useTransition();
  const unitPrice = item.variation?.price ?? item.product.base_price;

  function changeQuantity(next: number) {
    if (next < 1) return;
    setQuantity(next);
    startTransition(() => {
      updateCartItemQuantity(item.id, next);
    });
  }

  return (
    <div className="flex gap-4 rounded-card border border-ink-900/8 bg-white p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-900/5">
        {item.product.image && <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.slug}`} className="font-display font-medium text-ink-950 hover:text-signal-500">
          {item.product.name}
        </Link>
        {item.variation && <p className="text-xs text-ink-500 mt-0.5">{item.variation.name}</p>}
        {item.deadline_at && (
          <p className="text-xs text-ink-500 mt-0.5">
            Deadline: {new Date(item.deadline_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeQuantity(quantity - 1)}
              className="rounded-full border border-ink-900/15 p-1 hover:bg-ink-900/5"
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-sm">{pending ? <Loader2 size={13} className="mx-auto animate-spin" /> : quantity}</span>
            <button
              onClick={() => changeQuantity(quantity + 1)}
              className="rounded-full border border-ink-900/15 p-1 hover:bg-ink-900/5"
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="font-display font-semibold text-signal-600 text-sm">
            {formatRupiah(unitPrice * quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={() =>
          startTransition(() => {
            void removeCartItem(item.id);
          })
        }
        className="self-start text-ink-400 hover:text-flag-500"
        aria-label="Hapus"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
