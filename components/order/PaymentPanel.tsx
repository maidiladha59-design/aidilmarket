"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitOrderPayment, payWithWallet } from "@/lib/actions/payments";
import { formatRupiah } from "@/lib/utils";

export type PaymentMethodOption = {
  type: "bank_jago" | "dana" | "gopay" | "qris";
  label: string;
  account_number: string | null;
  account_name: string | null;
  qris_image_url: string | null;
};

export function PaymentPanel({
  orderId,
  total,
  methods,
  walletBalance,
}: {
  orderId: string;
  total: number;
  methods: PaymentMethodOption[];
  walletBalance: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const canPayWithWallet = walletBalance >= total;

  async function handleUploadProof() {
    if (!selected || !file) {
      setError("Pilih metode pembayaran dan unggah bukti transfer.");
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

    const path = `${user.id}/${orderId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file);
    if (uploadError) {
      setError("Gagal mengunggah bukti pembayaran. Coba lagi.");
      setSubmitting(false);
      return;
    }

    const result = await submitOrderPayment({
      orderId,
      method: selected as PaymentMethodOption["type"],
      proofFileUrl: path,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handlePayWithWallet() {
    setSubmitting(true);
    setError(null);
    const result = await payWithWallet(orderId);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const activeMethod = methods.find((m) => m.type === selected);

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5">
      <h2 className="font-display font-semibold text-ink-950 mb-1">Pembayaran</h2>
      <p className="text-sm text-ink-600 mb-4">
        Total tagihan: <span className="font-semibold text-ink-950">{formatRupiah(total)}</span>
      </p>

      <button
        onClick={handlePayWithWallet}
        disabled={!canPayWithWallet || submitting}
        className="mb-4 flex w-full items-center justify-between rounded-lg border border-signal-500/30 bg-signal-500/5 p-3.5 text-left disabled:opacity-40"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-ink-900">
          <Wallet size={17} className="text-signal-500" /> Bayar pakai saldo
        </span>
        <span className="text-xs text-ink-600">{formatRupiah(walletBalance)} tersedia</span>
      </button>

      <p className="text-xs font-medium text-ink-500 mb-2 uppercase tracking-normal">atau transfer manual</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {methods.map((m) => (
          <button
            key={m.type}
            onClick={() => setSelected(m.type)}
            className={`rounded-lg border p-3 text-sm font-medium text-left transition-colors ${
              selected === m.type ? "border-signal-500 bg-signal-500/5 text-signal-600" : "border-ink-900/15 text-ink-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {activeMethod && (
        <div className="mb-4 rounded-lg bg-paper-100 p-3.5 text-sm">
          {activeMethod.type === "qris" && activeMethod.qris_image_url ? (
            <img src={activeMethod.qris_image_url} alt="QRIS" className="mx-auto h-48 w-48 object-contain" />
          ) : (
            <>
              <p className="text-ink-600">Transfer ke:</p>
              <p className="font-semibold text-ink-950">{activeMethod.account_number}</p>
              <p className="text-ink-600">a.n. {activeMethod.account_name}</p>
            </>
          )}
        </div>
      )}

      {selected && (
        <div>
          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-900/15 p-4 text-sm text-ink-600 cursor-pointer hover:border-signal-500/50">
            <Upload size={16} />
            {file ? file.name : "Unggah bukti transfer"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className="mt-2 text-xs text-flag-500">{error}</p>}

          <button
            onClick={handleUploadProof}
            disabled={submitting}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Kirim Bukti Pembayaran
          </button>
        </div>
      )}

      {!selected && error && <p className="mt-2 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
