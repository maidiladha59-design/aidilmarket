"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton({ next }: { next?: string }) {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      },
    });
    // Kalau ada error di sini (mis. provider Google belum diaktifkan di
    // Supabase, atau redirect URL belum terdaftar), browser TIDAK akan
    // diarahkan ke Google sama sekali — sebelumnya error ini diabaikan
    // sehingga tombol terlihat tidak melakukan apa-apa.
    if (error) setError(error.message);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-900/15 py-3 text-sm font-medium text-ink-800 hover:bg-ink-900/5 transition-colors"
      >
        Continue with Google
      </button>
      {error && <p className="mt-2 text-xs text-flag-500">{error}</p>}
    </div>
  );
}
