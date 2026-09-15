"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { adminLogin } from "@/lib/actions/admin-auth";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin({ email, password });
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-sm rounded-card border border-ink-900/8 bg-white p-6">
      <label className="block text-sm font-medium text-ink-800 mb-2">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
      />
      <label className="block text-sm font-medium text-ink-800 mb-2">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
      />

      {error && <p className="mb-3 text-xs text-flag-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-ink-950 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-ink-800 transition-colors"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Masuk
      </button>
    </div>
  );
}
