"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, Upload, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requestRevision } from "@/lib/actions/revisions";
import { submitReview } from "@/lib/actions/reviews";
import { getResultFileUrl } from "@/lib/actions/downloads";

type ResultFile = { path: string; name: string };

export function ResultFiles({ orderId, files }: { orderId: string; files: ResultFile[] }) {
  async function open(path: string) {
    const result = await getResultFileUrl(orderId, path);
    if (result.ok) window.open(result.url, "_blank");
  }

  if (files.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-ink-700 mb-1">Hasil pengerjaan:</p>
      <div className="flex flex-wrap gap-2">
        {files.map((f) => (
          <button
            key={f.path}
            onClick={() => open(f.path)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700"
          >
            <FileText size={12} /> {f.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RevisionForm({ orderItemId, orderId, revisionUsed, revisionLimit }: { orderItemId: string; orderId: string; revisionUsed: number; revisionLimit: number }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (revisionUsed >= revisionLimit) {
    return <p className="mt-2 text-xs text-ink-500">Kuota revisi telah habis.</p>;
  }
  if (done) return <p className="mt-2 text-xs text-emerald-600">Revisi berhasil diajukan.</p>;

  return (
    <div className="mt-2">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs font-medium text-signal-500 hover:underline">
          Ajukan Revisi ({revisionUsed}/{revisionLimit})
        </button>
      ) : (
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Jelaskan revisi yang kamu inginkan..."
            className="w-full rounded-lg border border-ink-900/15 p-2 text-xs mb-2"
          />
          {error && <p className="mb-2 text-xs text-flag-500">{error}</p>}
          <button
            onClick={() =>
              startTransition(async () => {
                const result = await requestRevision({ orderItemId, orderId, description, files: [] });
                if (!result.ok) setError(result.error);
                else setDone(true);
              })
            }
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending && <Loader2 size={12} className="animate-spin" />} Kirim
          </button>
        </div>
      )}
    </div>
  );
}

export function ReviewForm({ orderItemId, productId }: { orderItemId: string; productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  if (done) return <p className="mt-2 text-xs text-emerald-600">Terima kasih atas ulasanmu!</p>;

  async function handleSubmit() {
    setError(null);
    startTransition(async () => {
      let imageUrl: string | null = null;
      if (image) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const path = `${user.id}/${Date.now()}-${image.name}`;
          const { error: uploadError } = await supabase.storage.from("materials").upload(path, image);
          if (!uploadError) imageUrl = path;
        }
      }
      const result = await submitReview({ orderItemId, productId, rating, comment, imageUrl });
      if (!result.ok) setError(result.error);
      else setDone(true);
    });
  }

  return (
    <div className="mt-3 rounded-lg bg-paper-100 p-3">
      <p className="text-xs font-medium text-ink-800 mb-2">Beri ulasan untuk produk ini</p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            <Star size={18} className={n <= rating ? "fill-gold-500 text-gold-500" : "text-ink-900/20"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Ceritakan pengalamanmu..."
        className="w-full rounded-lg border border-ink-900/15 p-2 text-xs mb-2"
      />
      <label className="flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer mb-2 w-fit">
        <Upload size={12} /> {image ? image.name : "Lampirkan foto (opsional)"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="mb-2 text-xs text-flag-500">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full bg-signal-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending && <Loader2 size={12} className="animate-spin" />} Kirim Ulasan
      </button>
    </div>
  );
}
