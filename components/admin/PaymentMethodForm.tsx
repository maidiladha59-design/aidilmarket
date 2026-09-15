"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updatePaymentMethod } from "@/lib/actions/admin/marketing";

type Method = {
  type: "bank_jago" | "dana" | "gopay" | "qris";
  is_enabled: boolean;
  account_number: string | null;
  account_name: string | null;
  qris_image_url: string | null;
};

const LABEL: Record<string, string> = { bank_jago: "Bank Jago", dana: "DANA", gopay: "GoPay", qris: "QRIS" };

export function PaymentMethodForm({ method }: { method: Method }) {
  const [enabled, setEnabled] = useState(method.is_enabled);
  const [accountNumber, setAccountNumber] = useState(method.account_number ?? "");
  const [accountName, setAccountName] = useState(method.account_name ?? "");
  const [qrisUrl, setQrisUrl] = useState(method.qris_image_url ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-ink-950">{LABEL[method.type]}</h3>
        <label className="flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-signal-500" />
          Aktif
        </label>
      </div>

      {method.type === "qris" ? (
        <input
          value={qrisUrl}
          onChange={(e) => setQrisUrl(e.target.value)}
          placeholder="URL gambar QRIS"
          className="w-full rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm mb-2"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Nomor rekening/akun" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Nama pemilik" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
        </div>
      )}

      {saved && <p className="text-xs text-emerald-600 mb-2">Tersimpan.</p>}

      <button
        onClick={() =>
          startTransition(async () => {
            await updatePaymentMethod({
              type: method.type,
              isEnabled: enabled,
              accountNumber: accountNumber || null,
              accountName: accountName || null,
              qrisImageUrl: qrisUrl || null,
            });
            setSaved(true);
          })
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending && <Loader2 size={13} className="animate-spin" />} Simpan
      </button>
    </div>
  );
}
