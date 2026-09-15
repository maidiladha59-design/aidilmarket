import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Check, FileText, ShieldCheck, Star, Timer } from "lucide-react";

const WHY_US = [
  { icon: ShieldCheck, text: "Harga transparan" },
  { icon: Timer, text: "Proses cepat" },
  { icon: FileText, text: "Hasil rapi" },
  { icon: Check, text: "Bisa request" },
  { icon: ShieldCheck, text: "Aman" },
  { icon: Check, text: "Support responsif" },
];

const ORDER_STEPS = [
  "Pilih layanan",
  "Masukkan kebutuhan",
  "Upload materi jika ada",
  "Checkout",
  "Bayar",
  "Pesanan diproses",
  "Terima hasil",
];

const FAQ_ITEMS = [
  {
    question: "Berapa lama proses pengerjaan?",
    answer: "Estimasi waktu tertera di setiap halaman produk, umumnya 1-3 hari kerja tergantung kompleksitas dan deadline yang kamu pilih.",
  },
  {
    question: "Apakah bisa order tanpa materi sendiri?",
    answer: "Bisa. Saat memesan, pilih \"Belum\" pada pertanyaan materi, lalu jelaskan kebutuhanmu — tim kami akan menyiapkan dari awal.",
  },
  {
    question: "Berapa kali revisi yang bisa saya ajukan?",
    answer: "Setiap produk punya batas revisi yang tertera di halaman detail produk. Ajukan lewat halaman pesanan setelah hasil pertama diterima.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Bank Jago, DANA, GoPay, dan QRIS. Setelah transfer, upload bukti pembayaran dan tim kami akan memverifikasi.",
  },
];

async function getHomeData() {
  const supabase = await createClient();

  const [
    { data: popularProducts },
    { data: categories },
    { count: orderCount },
    { count: customerCount },
    { count: productCount },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, short_description, base_price, price_type, price_unit, image")
      .eq("status", "published")
      .eq("popular", true)
      .limit(8),
    supabase
      .from("categories")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("sort_order")
      .limit(8),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("reviews")
      .select("rating, comment, image_url, profiles(full_name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    popularProducts: (popularProducts ?? []) as ProductCardData[],
    categories: categories ?? [],
    stats: {
      orders: orderCount ?? 0,
      customers: customerCount ?? 0,
      products: productCount ?? 0,
      rating: avgRating,
    },
    reviews: reviews ?? [],
  };
}

export default async function HomePage() {
  const { popularProducts, categories, stats, reviews } = await getHomeData();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <p className="font-display text-sm font-semibold text-signal-400 mb-4">AIDIL STORE — Solusi Digital</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight">
              Solusi digital untuk kebutuhanmu, dari ide sampai file jadi.
            </h1>
            <p className="mt-5 text-base text-paper-100/70 max-w-md leading-relaxed">
              Pesan layanan digital dengan mudah, cepat, aman, dan terpercaya — mulai dari jasa ketik
              sampai desain presentasi, dikerjakan tim yang paham tenggat waktumu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-signal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-signal-600 transition-colors"
              >
                Jelajahi Produk
              </Link>
              <Link
                href="/how-to-order"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Pesan Sekarang
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm aspect-square">
  <div className="absolute inset-0 rounded-full bg-signal-500/10 blur-2xl" />

  <div className="relative flex h-full items-center justify-center">
    <img
      src="/images/maskot-mahasiswa.png"
      alt="Maskot mahasiswa Aidil Store"
      className="h-full w-full object-contain"
    />
  </div>
</div>
</div>

<div className="border-t border-white/10">
  <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
    <Stat label="Pesanan" value={`${stats.orders}+`} />
    <Stat label="Pelanggan" value={`${stats.customers}+`} />
    <Stat label="Produk" value={`${stats.products}+`} />
    <Stat
      label="Rating"
  value={`${stats.rating ? stats.rating.toFixed(1) : "0.0"}/5`}
/>
          </div>
        </div>
      </section>

      {/* PRODUK & LAYANAN */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-ink-950">Produk & Layanan</h2>
          <Link href="/products" className="text-sm font-medium text-signal-500 hover:underline">
            Lihat semua
          </Link>
        </div>
        {popularProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <EmptyHint text="Belum ada produk populer — akan tampil di sini setelah admin menambahkan produk." />
        )}
      </section>

      {/* KATEGORI */}
      <section className="bg-paper-100 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink-950 mb-8">Kategori</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="rounded-card bg-white border border-ink-900/8 p-5 text-center shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <p className="font-display font-medium text-ink-950 text-sm">{c.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyHint text="Kategori akan tampil di sini setelah admin menambahkannya." />
          )}
        </div>
      </section>

      {/* KENAPA AIDIL STORE */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-8">Kenapa AIDIL STORE?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WHY_US.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-card border border-ink-900/8 bg-white p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal-500/10 text-signal-500">
                <Icon size={17} />
              </span>
              <span className="text-sm font-medium text-ink-800">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CARA ORDER */}
      <section className="bg-ink-950 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-2xl font-bold mb-10">Cara Order</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            {ORDER_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-display text-2xl font-bold text-signal-400">{i + 1}</span>
                <span className="text-sm text-paper-100/80 pt-1.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* REVIEW */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-8">Review Pelanggan</h2>
        {reviews.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-card border border-ink-900/8 bg-white p-5">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < r.rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"}
                    />
                  ))}
                </div>
                <p className="text-sm text-ink-700 leading-relaxed line-clamp-4">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint text="Review pelanggan akan tampil di sini setelah pesanan pertama selesai." />
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 lg:px-8 py-16">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-8">FAQ</h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-paper-100/60 mt-0.5">{label}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-ink-900/15 p-8 text-center text-sm text-ink-500">
      {text}
    </div>
  );
}
