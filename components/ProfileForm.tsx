"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile, changePassword } from "@/lib/actions/profile";

export function ProfileForm({ initialName, initialWhatsapp }: { initialName: string; initialWhatsapp: string }) {
  const [fullName, setFullName] = useState(initialName);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updateProfile({ fullName, whatsapp });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Profil berhasil disimpan.");
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    setPasswordMessage(null);
    const result = await changePassword(newPassword);
    setPasswordSaving(false);
    setPasswordMessage(result.ok ? "Password berhasil diubah." : result.error);
    if (result.ok) setNewPassword("");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-ink-900/8 bg-white p-5">
        <h2 className="font-display font-semibold text-ink-950 mb-4">Informasi Akun</h2>
        <label className="block text-sm font-medium text-ink-800 mb-2">Nama Lengkap</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
        />
        <label className="block text-sm font-medium text-ink-800 mb-2">WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
        />

        {error && <p className="mb-3 text-xs text-flag-500">{error}</p>}
        {message && <p className="mb-3 text-xs text-emerald-600">{message}</p>}

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-ink-800 transition-colors"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Simpan Perubahan
        </button>
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white p-5">
        <h2 className="font-display font-semibold text-ink-950 mb-4">Ganti Password</h2>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password baru (minimal 8 karakter)"
          className="w-full rounded-lg border border-ink-900/15 p-2.5 text-sm mb-4 focus:border-signal-500 outline-none"
        />
        {passwordMessage && (
          <p className={`mb-3 text-xs ${passwordMessage.includes("berhasil") ? "text-emerald-600" : "text-flag-500"}`}>
            {passwordMessage}
          </p>
        )}
        <button
          onClick={handleChangePassword}
          disabled={passwordSaving}
          className="flex items-center gap-2 rounded-full border border-ink-900/20 px-5 py-2.5 text-sm font-semibold text-ink-800 disabled:opacity-50 hover:bg-ink-900/5 transition-colors"
        >
          {passwordSaving && <Loader2 size={15} className="animate-spin" />}
          Ubah Password
        </button>
      </div>
    </div>
  );
}
