import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-8 py-14">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-6">Kontak</h1>
      <p className="text-sm text-ink-600 mb-8">Ada pertanyaan sebelum order? Hubungi kami lewat salah satu kanal berikut.</p>

      <div className="space-y-3">
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          className="flex items-center gap-3 rounded-card border border-ink-900/8 bg-white p-4 hover:border-signal-500/40 transition-colors"
        >
          <MessageCircle size={20} className="text-signal-500" />
          <div>
            <p className="text-sm font-medium text-ink-950">WhatsApp</p>
            <p className="text-xs text-ink-500">Respon tercepat, jam 08.00–22.00 WIB</p>
          </div>
        </a>
        <a
          href="mailto:halo@aidilstore.com"
          className="flex items-center gap-3 rounded-card border border-ink-900/8 bg-white p-4 hover:border-signal-500/40 transition-colors"
        >
          <Mail size={20} className="text-signal-500" />
          <div>
            <p className="text-sm font-medium text-ink-950">Email</p>
            <p className="text-xs text-ink-500">halo@aidilstore.com</p>
          </div>
        </a>
      </div>

      <p className="mt-6 text-xs text-ink-400">
        Catatan: nomor WhatsApp & email di atas adalah placeholder — ganti dengan kontak asli AIDIL STORE.
      </p>
    </div>
  );
}
