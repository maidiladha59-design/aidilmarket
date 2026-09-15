"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { addVariation, deleteVariation, addConfigField, deleteConfigField } from "@/lib/actions/admin/products";
import { formatRupiah } from "@/lib/utils";

type Variation = { id: string; name: string; price: number; extra_fee: number; description: string | null };
type ConfigField = { id: string; field_key: string; field_label: string; field_type: string; options: string[] | null; is_required: boolean };

export function VariationManager({ productId, variations }: { productId: string; variations: Variation[] }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [extraFee, setExtraFee] = useState("0");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5">
      <h2 className="font-display font-semibold text-ink-950 mb-3">Variasi Produk</h2>

      <div className="space-y-2 mb-4">
        {variations.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-lg border border-ink-900/10 p-2.5">
            <div>
              <p className="text-sm font-medium text-ink-900">{v.name}</p>
              <p className="text-xs text-ink-500">
                {formatRupiah(v.price)}
                {v.extra_fee > 0 && ` + ${formatRupiah(v.extra_fee)}`}
              </p>
            </div>
            <button
              onClick={() =>
  startTransition(async () => {
    await deleteVariation(v.id, productId);
  })
}
              className="text-ink-400 hover:text-flag-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {variations.length === 0 && <p className="text-xs text-ink-500">Belum ada variasi.</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama variasi" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Harga" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
        <input value={extraFee} onChange={(e) => setExtraFee(e.target.value)} type="number" placeholder="Biaya tambahan" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
      </div>
      <button
        onClick={() =>
          startTransition(async () => {
            if (!name || !price) return;
            await addVariation(productId, { name, price: Number(price), extraFee: Number(extraFee), description });
            setName("");
            setPrice("");
            setExtraFee("0");
            setDescription("");
          })
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Tambah Variasi
      </button>
    </div>
  );
}

export function ConfigFieldManager({ productId, fields }: { productId: string; fields: ConfigField[] }) {
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<"number" | "text" | "select" | "textarea" | "date">("number");
  const [options, setOptions] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5">
      <h2 className="font-display font-semibold text-ink-950 mb-3">Field Konfigurasi</h2>
      <p className="text-xs text-ink-500 mb-3">Contoh: jumlah_slide / Jumlah Slide / number — field ini muncul saat customer memesan.</p>

      <div className="space-y-2 mb-4">
        {fields.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-lg border border-ink-900/10 p-2.5">
            <div>
              <p className="text-sm font-medium text-ink-900">{f.field_label}</p>
              <p className="text-xs text-ink-500">
                {f.field_key} · {f.field_type} {f.is_required && "· wajib"}
              </p>
            </div>
            <button
  onClick={() =>
    startTransition(async () => {
      await deleteConfigField(f.id, productId);
    })
  }
  className="text-ink-400 hover:text-flag-500"
>
  <Trash2 size={15} />
</button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-xs text-ink-500">Belum ada field.</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} placeholder="field_key (contoh: jumlah_slide)" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
        <input value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="Label (contoh: Jumlah Slide)" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
        <select value={fieldType} onChange={(e) => setFieldType(e.target.value as typeof fieldType)} className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm">
          <option value="number">Angka</option>
          <option value="text">Teks singkat</option>
          <option value="textarea">Teks panjang</option>
          <option value="select">Pilihan</option>
          <option value="date">Tanggal</option>
        </select>
        <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Opsi (pisahkan koma, untuk tipe Pilihan)" className="rounded-lg border border-ink-900/15 px-2.5 py-1.5 text-sm" />
      </div>
      <label className="flex items-center gap-1.5 text-xs text-ink-700 mb-2">
        <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="accent-signal-500" />
        Wajib diisi
      </label>
      <button
        onClick={() =>
          startTransition(async () => {
            if (!fieldKey || !fieldLabel) return;
            await addConfigField(productId, { fieldKey, fieldLabel, fieldType, options: options || null, isRequired });
            setFieldKey("");
            setFieldLabel("");
            setOptions("");
          })
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Tambah Field
      </button>
    </div>
  );
}
