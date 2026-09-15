"use client";

import { useState } from "react";
import { TopupModal } from "./TopupModal";
import type { PaymentMethodOption } from "@/components/order/PaymentPanel";

export function TopupButton({ methods }: { methods: PaymentMethodOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-signal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-signal-600 transition-colors"
      >
        Top Up
      </button>
      {open && <TopupModal methods={methods} onClose={() => setOpen(false)} />}
    </>
  );
}
