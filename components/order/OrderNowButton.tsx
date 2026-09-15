"use client";

import { useState } from "react";
import { OrderFlowModal, type OrderableProduct } from "./OrderFlowModal";

export function OrderNowButton({ product }: { product: OrderableProduct }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-signal-500 py-3.5 text-sm font-semibold text-white hover:bg-signal-600 transition-colors"
      >
        Pesan Sekarang
      </button>
      {open && <OrderFlowModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
