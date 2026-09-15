"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginCustomer } from "@/lib/actions/auth";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function LoginForm({ next, justRegistered, oauthError }: { next?: string; justRegistered?: boolean; oauthError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(oauthError ?? null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await loginCustomer({ email, password, next });
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-1">Masuk</h1>
      <p className="text-sm text-ink-500 mb-6">Selamat datang kembali di AIDIL STORE.</p>

      {justRegistered && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700">
          Pendaftaran berhasil. Silakan masuk.
        </p>
      )}

      <GoogleLoginButton next={next} />
      <div className="my-4 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-900/10" /> atau <span className="h-px flex-1 bg-ink-900/10" />
      </div>

      <label className="block text-sm font-medium text-ink-800 mb-1.5">Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none" />

      <label className="block text-sm font-medium text-ink-800 mb-1.5">Password</label>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-2 focus:border-signal-500 outline-none" />
      <Link href="/forgot-password" className="text-xs text-signal-500 hover:underline">
        Lupa password?
      </Link>

      {error && <p className="mt-3 text-xs text-flag-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Masuk
      </button>

      <p className="mt-5 text-center text-sm text-ink-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-signal-500 hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
