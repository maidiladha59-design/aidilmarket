import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink-950 text-paper-100">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-lg font-bold text-white">
            AIDIL<span className="text-signal-400">STORE</span>
          </span>
          <p className="mt-3 text-sm text-paper-100/60 max-w-xs">
            Solusi digital untuk kebutuhan tugas dan pekerjaanmu — cepat, rapi, dan terpercaya.
          </p>
        </div>

        <FooterColumn
          title="Layanan"
          links={[
            { label: "Semua Produk", href: "/products" },
            { label: "Kategori", href: "/categories" },
            { label: "Produk Digital", href: "/digital-products" },
            { label: "Cara Order", href: "/how-to-order" },
          ]}
        />
        <FooterColumn
          title="Bantuan"
          links={[
            { label: "Pusat Bantuan", href: "/help" },
            { label: "Tentang Kami", href: "/about" },
            { label: "Kontak", href: "/contact" },
          ]}
        />
        <FooterColumn
          title="Akun"
          links={[
            { label: "Masuk", href: "/login" },
            { label: "Daftar", href: "/register" },
            { label: "Pesanan Saya", href: "/orders" },
          ]}
        />
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-paper-100/50">
        © {new Date().getFullYear()} AIDIL STORE. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-paper-100/60 hover:text-white transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
