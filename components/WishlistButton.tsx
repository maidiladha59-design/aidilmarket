"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function WishlistButton({ productId, initialWishlisted = false }: { productId: string; initialWishlisted?: boolean }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (!result.ok) {
            if (result.requiresLogin) router.push("/login");
            return;
          }
          setWishlisted(result.wishlisted);
        });
      }}
      disabled={pending}
      aria-label="Wishlist"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
    >
      <Heart size={15} className={wishlisted ? "fill-flag-500 text-flag-500" : "text-ink-600"} />
    </button>
  );
}
