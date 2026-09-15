"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export function BuyDigitalButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await addToCart({
        productId,
        variationId: null,
        quantity: 1,
        configuration: {},
        materialStatus: "unavailable",
        materialText: null,
        materialFiles: [],
        deadlineAt: null,
        notes: null,
      });
      if (!result.ok) {
        if (result.requiresLogin) {
          router.push("/login?next=/digital-products");
          return;
        }
        setError(result.error);
        return;
      }
      router.push("/cart");
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Beli Sekarang
      </button>
      {error && <p className="mt-2 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
