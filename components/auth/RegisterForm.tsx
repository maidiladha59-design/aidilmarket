"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerCustomer } from "@/lib/actions/auth";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await registerCustomer({ fullName, email, whatsapp, password, confirmPassword });
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-1">Daftar</h1>
      <p className="text-sm text-ink-500 mb-6">Buat akun untuk mulai memesan.</p>

      <GoogleLoginButton />
      <div className="my-4 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-900/10" /> atau <span className="h-px flex-1 bg-ink-900/10" />
      </div>

      <div className="space-y-3.5">
        <Input label="Nama Lengkap" value={fullName} onChange={setFullName} />
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="08xxxxxxxxxx" />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        <Input label="Konfirmasi Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
      </div>

      {error && <p className="mt-3 text-xs text-flag-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-signal-500 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-signal-600 transition-colors"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Daftar
      </button>

      <p className="mt-5 text-center text-sm text-ink-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-signal-500 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-800 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm focus:border-signal-500 outline-none"
      />
    </div>
  );
}
