import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AIDIL STORE — Solusi Digital",
  description:
    "Pesan jasa ketik, resume/CV, makalah, presentasi, desain grafis, dan produk digital lainnya. Cepat, rapi, dan terpercaya.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
