"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toggleCustomerSuspend } from "@/lib/actions/admin/products";

export function SuspendToggle({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(() => {
          void toggleCustomerSuspend(userId, !isSuspended);
        })
      }
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        isSuspended ? "bg-flag-500/10 text-flag-500" : "bg-emerald-500/10 text-emerald-600"
      }`}
    >
      {pending && <Loader2 size={12} className="animate-spin" />}
      {isSuspended ? "Disuspend" : "Aktif"}
    </button>
  );
}
