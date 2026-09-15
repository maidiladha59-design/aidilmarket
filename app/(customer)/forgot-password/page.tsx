"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result.ok) setMessage("Link reset password telah dikirim ke emailmu.");
      else setError(result.error);
    });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink-950 mb-1">Lupa Password</h1>
        <p className="text-sm text-ink-500 mb-6">Masukkan email akunmu, kami kirim link untuk reset password.</p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
        />

        {message && <p className="mb-3 text-xs text-emerald-600">{message}</p>}
        {error && <p className="mb-3 text-xs text-flag-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          Kirim Link Reset
        </button>
      </div>
    </div>
  );
}
