"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct, type ProductFormInput } from "@/lib/actions/admin/products";

type Category = { id: string; name: string };

export function ProductForm({
  productId,
  initial,
  categories,
}: {
  productId?: string;
  initial?: Partial<ProductFormInput>;
  categories: Category[];
}) {
  const [form, setForm] = useState<ProductFormInput>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    categoryId: initial?.categoryId ?? null,
    description: initial?.description ?? "",
    shortDescription: initial?.shortDescription ?? "",
    priceType: initial?.priceType ?? "fixed",
    basePrice: initial?.basePrice ?? 0,
    priceUnit: initial?.priceUnit ?? "",
    estimatedTime: initial?.estimatedTime ?? "",
    revisionLimit: initial?.revisionLimit ?? 2,
    isDigital: initial?.isDigital ?? false,
    status: initial?.status ?? "draft",
    featured: initial?.featured ?? false,
    popular: initial?.popular ?? false,
    image: initial?.image ?? "",
    expressFeePercent: initial?.expressFeePercent ?? null,
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = productId ? await updateProduct(productId, form) : await createProduct(form);
      // createProduct redirect saat sukses -> baris di bawah hanya untuk error atau update
      if (result && !result.ok) setError(result.error);
      else if (productId) setSaved(true);
    });
  }

  return (
    <div className="rounded-card border border-ink-900/8 bg-white p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nama Produk">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
        </Field>
        <Field label="Slug">
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Kategori">
        <select
          value={form.categoryId ?? ""}
          onChange={(e) => update("categoryId", e.target.value || null)}
          className="input"
        >
          <option value="">Tanpa kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Deskripsi Singkat">
        <input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} className="input" />
      </Field>
      <Field label="Deskripsi Lengkap">
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="input" />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Tipe Harga">
          <select value={form.priceType} onChange={(e) => update("priceType", e.target.value as ProductFormInput["priceType"])} className="input">
            <option value="fixed">Fixed</option>
            <option value="per_page">Per Halaman</option>
            <option value="per_slide">Per Slide</option>
            <option value="per_question">Per Soal</option>
            <option value="per_sheet">Per Sheet</option>
            <option value="custom">Custom</option>
          </select>
        </Field>
        <Field label="Harga Dasar (Rp)">
          <input type="number" value={form.basePrice} onChange={(e) => update("basePrice", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Satuan (opsional)">
          <input value={form.priceUnit ?? ""} onChange={(e) => update("priceUnit", e.target.value)} placeholder="halaman, slide, ..." className="input" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Estimasi Waktu">
          <input value={form.estimatedTime} onChange={(e) => update("estimatedTime", e.target.value)} placeholder="1-2 hari kerja" className="input" />
        </Field>
        <Field label="Limit Revisi">
          <input type="number" value={form.revisionLimit} onChange={(e) => update("revisionLimit", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Express Fee % (opsional)">
          <input
            type="number"
            value={form.expressFeePercent ?? ""}
            onChange={(e) => update("expressFeePercent", e.target.value ? Number(e.target.value) : null)}
            className="input"
          />
        </Field>
      </div>

      <Field label="URL Gambar">
        <input value={form.image ?? ""} onChange={(e) => update("image", e.target.value)} placeholder="https://..." className="input" />
      </Field>

      <div className="flex flex-wrap gap-5">
        <Toggle label="Produk digital" checked={form.isDigital} onChange={(v) => update("isDigital", v)} />
        <Toggle label="Featured" checked={form.featured} onChange={(v) => update("featured", v)} />
        <Toggle label="Popular" checked={form.popular} onChange={(v) => update("popular", v)} />
      </div>

      <Field label="Status">
        <select value={form.status} onChange={(e) => update("status", e.target.value as ProductFormInput["status"])} className="input max-w-[200px]">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </Field>

      {error && <p className="text-xs text-flag-500">{error}</p>}
      {saved && <p className="text-xs text-emerald-600">Perubahan disimpan.</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {productId ? "Simpan Perubahan" : "Buat Produk"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(7, 11, 20, 0.15);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-800 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-800 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-signal-500" />
      {label}
    </label>
  );
}
