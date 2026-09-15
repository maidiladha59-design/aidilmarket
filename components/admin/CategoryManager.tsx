"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createCategory, toggleCategoryActive } from "@/lib/actions/admin/products";

type Category = { id: string; name: string; slug: string; is_active: boolean };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="rounded-card border border-ink-900/8 bg-white p-5 mb-6">
        <h2 className="font-display font-semibold text-ink-950 mb-3">Tambah Kategori</h2>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-kategori" className="rounded-lg border border-ink-900/15 px-2.5 py-2 text-sm" />
        </div>
        {error && <p className="text-xs text-flag-500 mb-2">{error}</p>}
        <button
          onClick={() =>
            startTransition(async () => {
              if (!name || !slug) return;
              const result = await createCategory({ name, slug, icon: null });
              if (!result.ok) setError(result.error);
              else {
                setName("");
                setSlug("");
                setError(null);
              }
            })
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Tambah
        </button>
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{c.name}</p>
              <p className="text-xs text-ink-500">/{c.slug}</p>
            </div>
            <button
              onClick={() =>
  startTransition(async () => {
    await toggleCategoryActive(c.id, !c.is_active);
  })
}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                c.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-900/10 text-ink-500"
              }`}
            >
              {c.is_active ? "Aktif" : "Nonaktif"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
