"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createOrderFromCart } from "@/lib/actions/orders";

export function CheckoutForm() {
  const [voucherCode, setVoucherCode] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderFromCart({
        voucherCode: voucherCode.trim() || null,
        agreement,
      });
      // Jika berhasil, server action sudah redirect — kode di bawah hanya
      // dijangkau ketika ada error.
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5">
      <label className="block text-sm font-medium text-ink-800 mb-2">Kode voucher (opsional)</label>
      <input
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder="Masukkan kode voucher"
        className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm uppercase focus:border-signal-500 outline-none mb-5"
      />

      <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreement}
          onChange={(e) => setAgreement(e.target.checked)}
          className="mt-0.5 accent-signal-500"
        />
        <span className="text-sm text-ink-700">
          Saya telah memastikan data pesanan yang saya berikan sudah benar.
        </span>
      </label>

      {error && <p className="mb-3 text-xs text-flag-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!agreement || pending}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-signal-600 transition-colors"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Konfirmasi Pesanan
      </button>
    </div>
  );
}
