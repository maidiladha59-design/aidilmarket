"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getSignedDownloadUrl } from "@/lib/actions/downloads";

export function DownloadButton({ purchaseId }: { purchaseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await getSignedDownloadUrl(purchaseId);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank");
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full bg-signal-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Download
      </button>
      {error && <p className="mt-1 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
