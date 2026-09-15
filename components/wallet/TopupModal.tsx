"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requestTopup } from "@/lib/actions/wallet";
import type { PaymentMethodOption } from "@/components/order/PaymentPanel";

export function TopupModal({ methods, onClose }: { methods: PaymentMethodOption[]; onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethodOption["type"] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 10000) {
      setError("Minimal top up Rp10.000.");
      return;
    }
    if (!method || !file) {
      setError("Pilih metode dan unggah bukti transfer.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Kamu harus login.");
      setSubmitting(false);
      return;
    }

    const path = `${user.id}/topup-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file);
    if (uploadError) {
      setError("Gagal mengunggah bukti.");
      setSubmitting(false);
      return;
    }

    const result = await requestTopup({ amount: numericAmount, method, proofFileUrl: path });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink-950/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-card sm:rounded-card bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink-950">Top Up Saldo</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-600 hover:bg-ink-900/5">
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm font-medium text-ink-800 mb-2">Nominal</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Minimal Rp10.000"
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
        />

        <label className="block text-sm font-medium text-ink-800 mb-2">Metode</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {methods.map((m) => (
            <button
              key={m.type}
              onClick={() => setMethod(m.type)}
              className={`rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                method === m.type ? "border-signal-500 bg-signal-500/5 text-signal-600" : "border-ink-900/15 text-ink-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-900/15 p-4 text-sm text-ink-600 cursor-pointer hover:border-signal-500/50 mb-4">
          <Upload size={16} />
          {file ? file.name : "Unggah bukti transfer"}
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        {error && <p className="mb-3 text-xs text-flag-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Kirim Permintaan Top Up
        </button>
      </div>
    </div>
  );
}
