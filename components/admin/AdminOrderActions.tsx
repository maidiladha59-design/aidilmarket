"use client";

import { useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus, uploadOrderResult } from "@/lib/actions/admin/orders";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABEL);

export function StatusUpdateControl({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-ink-900/15 px-3 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button
        onClick={() =>
          startTransition(async () => {
            const r = await updateOrderStatus(orderId, status);
            setMessage(r.ok ? "Status diperbarui." : r.error ?? "Gagal.");
          })
        }
        disabled={pending || status === currentStatus}
        className="flex items-center gap-1.5 rounded-lg bg-ink-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending && <Loader2 size={14} className="animate-spin" />} Update
      </button>
      {message && <span className="text-xs text-ink-500">{message}</span>}
    </div>
  );
}

export function ResultUploader({ orderItemId, orderId }: { orderItemId: string; orderId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded: { path: string; name: string }[] = [];
    for (const file of Array.from(fileList)) {
      const path = `${orderId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("results").upload(path, file);
      if (uploadError) {
        setError(`Gagal mengunggah "${file.name}".`);
        continue;
      }
      uploaded.push({ path, name: file.name });
    }

    if (uploaded.length > 0) {
      await uploadOrderResult(orderItemId, orderId, uploaded);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="flex items-center gap-2 rounded-lg border-2 border-dashed border-ink-900/15 px-3 py-2 text-xs text-ink-600 cursor-pointer hover:border-signal-500/50 w-fit">
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        Upload hasil pengerjaan
        <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </label>
      {error && <p className="mt-1 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
