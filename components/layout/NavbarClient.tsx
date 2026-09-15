"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  Download,
  User,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type MenuItem = { label: string; href: string };
type Props = {
  menu: MenuItem[];
  user: { profile: { full_name: string | null; avatar_url: string | null; wallet_balance: number } | null } | null;
  cartCount: number;
};

export function NavbarClient({ menu, user, cartCount }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/5 bg-paper-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold tracking-tight text-ink-950">
            AIDIL<span className="text-signal-500">STORE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-700 hover:text-signal-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1">
          <button
            aria-label="Cari"
            className="rounded-full p-2.5 text-ink-700 hover:bg-ink-900/5 transition-colors"
          >
            <Search size={19} />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="rounded-full p-2.5 text-ink-700 hover:bg-ink-900/5 transition-colors"
          >
            <Heart size={19} />
          </Link>
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative rounded-full p-2.5 text-ink-700 hover:bg-ink-900/5 transition-colors"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-flag-500 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-ink-900/5 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                  {(user.profile?.full_name ?? "U").charAt(0).toUpperCase()}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-medium text-ink-950">
                    {user.profile?.full_name ?? "Pengguna"}
                  </span>
                  <span className="block text-xs text-gold-500">
                    Rp{(user.profile?.wallet_balance ?? 0).toLocaleString("id-ID")}
                  </span>
                </span>
                <ChevronDown size={15} className="text-ink-600" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-card border border-ink-900/10 bg-white py-2 shadow-card">
                  <AccountLink href="/orders" icon={LayoutDashboard} label="Dashboard" />
                  <AccountLink href="/orders" icon={Package} label="Pesanan Saya" />
                  <AccountLink href="/wishlist" icon={Heart} label="Wishlist" />
                  <AccountLink href="/downloads" icon={Download} label="Download" />
                  <AccountLink href="/profile" icon={User} label="Profil" />
                  <AccountLink href="/notifications" icon={Bell} label="Notifikasi" />
                  <hr className="my-2 border-ink-900/10" />
                  <button className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-flag-500 hover:bg-ink-900/5">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-800 transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        <button
          className="lg:hidden rounded-full p-2 text-ink-950"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-ink-900/10 bg-white px-4 py-3">
          {[
            ...menu,
            { label: "Pesanan Saya", href: "/orders" },
            { label: "Download", href: "/downloads" },
            { label: "Profil", href: "/profile" },
            { label: "Bantuan", href: "/help" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 text-sm font-medium text-ink-800 border-b border-ink-900/5 last:border-0"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-800 hover:bg-ink-900/5">
      <Icon size={16} /> {label}
    </Link>
  );
}
