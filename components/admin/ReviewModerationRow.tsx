"use client";

import { useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { moderateReview } from "@/lib/actions/admin/marketing";

export function ReviewModerationRow({
  id,
  rating,
  comment,
  status,
  productName,
  customerName,
}: {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  productName: string;
  customerName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div>
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"} />
          ))}
        </div>
        <p className="text-sm text-ink-900">{comment}</p>
        <p className="text-xs text-ink-500 mt-1">
          {customerName} · {productName}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {pending && <Loader2 size={13} className="animate-spin text-ink-400" />}
        <button
          onClick={() =>
            startTransition(() => {
              void moderateReview(id, "approved");
            })
          }
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "approved" ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600"}`}
        >
          Approve
        </button>
        <button
          onClick={() =>
            startTransition(() => {
              void moderateReview(id, "hidden");
            })
          }
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "hidden" ? "bg-ink-900 text-white" : "bg-ink-900/10 text-ink-500"}`}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
