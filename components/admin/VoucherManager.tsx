"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createVoucher, toggleVoucherActive } from "@/lib/actions/admin/marketing";
import { formatRupiah } from "@/lib/utils";

type Voucher = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_amount: number;
  minimum_purchase: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export function VoucherManager({ vouchers }: { vouchers: Voucher[] }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="rounded-card border border-ink-900/8 bg-white p-5 mb-6">
        <h2 className="font-display font-semibold text-ink-950 mb-3">Buat Voucher</h2>
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="KODE" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm uppercase" />
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")} className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm">
            <option value="percentage">Persentase (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
          <input value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} type="number" placeholder="Nilai diskon" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={minimumPurchase} onChange={(e) => setMinimumPurchase(e.target.value)} type="number" placeholder="Minimal belanja" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
        </div>
        {error && <p className="text-xs text-flag-500 mb-2">{error}</p>}
        <button
          onClick={() =>
            startTransition(async () => {
              if (!code || !discountAmount || !startDate || !endDate) {
                setError("Lengkapi semua field.");
                return;
              }
              const result = await createVoucher({
                code,
                discountType,
                discountAmount: Number(discountAmount),
                minimumPurchase: Number(minimumPurchase),
                maximumDiscount: null,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                usageLimit: null,
                userUsageLimit: 1,
              });
              if (!result.ok) setError(result.error);
              else {
                setCode("");
                setDiscountAmount("");
                setError(null);
              }
            })
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Buat Voucher
        </button>
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
        {vouchers.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{v.code}</p>
              <p className="text-xs text-ink-500">
                {v.discount_type === "percentage" ? `${v.discount_amount}%` : formatRupiah(v.discount_amount)} · min.
                belanja {formatRupiah(v.minimum_purchase)} ·{" "}
                {new Date(v.start_date).toLocaleDateString("id-ID")} - {new Date(v.end_date).toLocaleDateString("id-ID")}
              </p>
            </div>
            <button
              onClick={() =>
                startTransition(() => {
                  void toggleVoucherActive(v.id, !v.is_active);
                })
              }
              className={`rounded-full px-3 py-1 text-xs font-medium ${v.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-900/10 text-ink-500"}`}
            >
              {v.is_active ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        ))}
        {vouchers.length === 0 && <p className="p-5 text-sm text-ink-500">Belum ada voucher.</p>}
      </div>
    </div>
  );
}
