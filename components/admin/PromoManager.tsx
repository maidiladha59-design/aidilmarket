"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createPromo, togglePromoActive } from "@/lib/actions/admin/marketing";

type Promo = {
  id: string;
  type: string;
  name: string;
  discount_type: string | null;
  discount_amount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  product_promo: "Promo Produk",
  flash_sale: "Flash Sale",
  discount_campaign: "Kampanye Diskon",
  bundle: "Bundle",
  student_promo: "Promo Mahasiswa",
};

type PromoType = "product_promo" | "flash_sale" | "discount_campaign" | "bundle" | "student_promo";
const PROMO_TYPES = Object.keys(TYPE_LABEL) as PromoType[];

export function PromoManager({ promos }: { promos: Promo[] }) {
  const [type, setType] = useState<PromoType>("flash_sale");
  const [name, setName] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="rounded-card border border-ink-900/8 bg-white p-5 mb-6">
        <h2 className="font-display font-semibold text-ink-950 mb-3">Buat Promo</h2>
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          <select value={type} onChange={(e) => setType(e.target.value as PromoType)} className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm">
            {PROMO_TYPES.map((k) => (
              <option key={k} value={k}>
                {TYPE_LABEL[k]}
              </option>
            ))}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama promo" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} type="number" placeholder="Diskon % (opsional)" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
        </div>
        {error && <p className="text-xs text-flag-500 mb-2">{error}</p>}
        <button
          onClick={() =>
            startTransition(async () => {
              if (!name || !startDate || !endDate) {
                setError("Lengkapi semua field.");
                return;
              }
              const result = await createPromo({
                type,
                name,
                description: "",
                discountType: discountAmount ? "percentage" : null,
                discountAmount: discountAmount ? Number(discountAmount) : null,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
              });
              if (!result.ok) setError(result.error);
              else {
                setName("");
                setDiscountAmount("");
                setError(null);
              }
            })
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Buat Promo
        </button>
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
        {promos.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{p.name}</p>
              <p className="text-xs text-ink-500">
                {TYPE_LABEL[p.type] ?? p.type} · {new Date(p.start_date).toLocaleDateString("id-ID")} -{" "}
                {new Date(p.end_date).toLocaleDateString("id-ID")}
              </p>
            </div>
            <button
              onClick={() =>
  startTransition(async () => {
    await togglePromoActive(p.id, !p.is_active);
  })
}
              className={`rounded-full px-3 py-1 text-xs font-medium ${p.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-900/10 text-ink-500"}`}
            >
              {p.is_active ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        ))}
        {promos.length === 0 && <p className="p-5 text-sm text-ink-500">Belum ada promo.</p>}
      </div>
    </div>
  );
}
