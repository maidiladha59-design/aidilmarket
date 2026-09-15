import { FaqAccordion } from "@/components/FaqAccordion";
import Link from "next/link";

const FAQ_ITEMS = [
  { question: "Berapa lama proses pengerjaan?", answer: "Estimasi waktu tertera di setiap halaman produk, umumnya 1-3 hari kerja tergantung kompleksitas dan deadline yang kamu pilih." },
  { question: "Apakah bisa order tanpa materi sendiri?", answer: "Bisa. Saat memesan, pilih \"Belum\" pada pertanyaan materi, lalu jelaskan kebutuhanmu — tim kami akan menyiapkan dari awal." },
  { question: "Berapa kali revisi yang bisa saya ajukan?", answer: "Setiap produk punya batas revisi yang tertera di halaman detail produk. Ajukan lewat halaman pesanan setelah hasil pertama diterima." },
  { question: "Metode pembayaran apa saja yang tersedia?", answer: "Bank Jago, DANA, GoPay, dan QRIS. Setelah transfer, upload bukti pembayaran dan tim kami akan memverifikasi." },
  { question: "Bagaimana cara top up saldo wallet?", answer: "Buka halaman Profil, klik Top Up, pilih metode dan nominal, lalu unggah bukti transfer. Saldo masuk setelah diverifikasi admin." },
  { question: "Bagaimana kalau pembayaran saya ditolak?", answer: "Kamu akan melihat alasan penolakan di halaman pesanan dan bisa mengunggah ulang bukti pembayaran yang benar." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-8 py-14">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-2">Pusat Bantuan</h1>
      <p className="text-sm text-ink-600 mb-8">
        Cari jawaban di bawah, atau{" "}
        <Link href="/contact" className="text-signal-500 hover:underline">
          hubungi kami langsung
        </Link>
        .
      </p>
      <FaqAccordion items={FAQ_ITEMS} />
    </div>
  );
}
