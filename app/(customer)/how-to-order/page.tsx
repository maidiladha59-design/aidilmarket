const STEPS = [
  { title: "Pilih layanan", desc: "Jelajahi katalog produk dan pilih layanan yang kamu butuhkan." },
  { title: "Masukkan kebutuhan", desc: "Pilih variasi dan isi detail konfigurasi (jumlah halaman, slide, dll)." },
  { title: "Upload materi jika ada", desc: "Unggah file atau tempel teks materi — atau lewati jika belum punya." },
  { title: "Checkout", desc: "Cek ringkasan pesanan, masukkan voucher jika ada, lalu konfirmasi." },
  { title: "Bayar", desc: "Transfer ke metode yang tersedia atau bayar langsung pakai saldo wallet." },
  { title: "Pesanan diproses", desc: "Tim kami mulai mengerjakan setelah pembayaran terverifikasi." },
  { title: "Terima hasil", desc: "Unduh hasil pengerjaan dari halaman pesanan, ajukan revisi bila perlu." },
];

export default function HowToOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-14">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-8">Cara Order</h1>
      <ol className="space-y-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-500/10 font-display font-bold text-signal-600">
              {i + 1}
            </span>
            <div>
              <p className="font-display font-semibold text-ink-950">{step.title}</p>
              <p className="text-sm text-ink-600 mt-0.5">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
