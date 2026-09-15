"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { verifyOrderPayment, verifyTopup } from "@/lib/actions/admin/payments";

export function VerifyPaymentButtons({ paymentId }: { paymentId: string }) {
  return <VerifyButtons onApprove={() => verifyOrderPayment(paymentId, true)} onReject={(reason) => verifyOrderPayment(paymentId, false, reason)} />;
}

export function VerifyTopupButtons({ topupId }: { topupId: string }) {
  return <VerifyButtons onApprove={() => verifyTopup(topupId, true)} onReject={(reason) => verifyTopup(topupId, false, reason)} />;
}

function VerifyButtons({
  onApprove,
  onReject,
}: {
  onApprove: () => Promise<{ ok: boolean; error?: string }>;
  onReject: (reason: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={() => startTransition(async () => {
            const r = await onApprove();
            if (!r.ok) setError(r.error ?? "Gagal.");
          })}
          disabled={pending}
          className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:bg-emerald-600"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Terima
        </button>
        <button
          onClick={() => setShowReject((v) => !v)}
          disabled={pending}
          className="flex items-center gap-1 rounded-full bg-flag-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:bg-flag-600"
        >
          <X size={13} /> Tolak
        </button>
      </div>

      {showReject && (
        <div className="mt-2 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan penolakan"
            className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-xs flex-1"
          />
          <button
            onClick={() => startTransition(async () => {
              const r = await onReject(reason);
              if (!r.ok) setError(r.error ?? "Gagal.");
              else setShowReject(false);
            })}
            className="rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Kirim
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
