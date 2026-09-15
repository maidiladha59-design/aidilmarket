"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  CreditCard,
  Ticket,
  Megaphone,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { adminLogout } from "@/lib/actions/admin-auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/products", label: "Produk", icon: Package, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/categories", label: "Kategori", icon: FolderTree, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag, roles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { href: "/admin/customers", label: "Pelanggan", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/payments", label: "Pembayaran", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/vouchers", label: "Voucher", icon: Ticket, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/promos", label: "Promo", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/reviews", label: "Review", icon: Star, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, roles: ["SUPER_ADMIN"] },
];

export function AdminSidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-60 shrink-0 bg-ink-950 text-white flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="font-display text-base font-bold">
          AIDIL<span className="text-signal-400">STORE</span>
        </span>
        <p className="text-xs text-paper-100/50 mt-0.5">{name} · {role}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-signal-500 text-white" : "text-paper-100/70 hover:bg-white/5"
              }`}
            >
              <item.icon size={17} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={adminLogout} className="px-3 py-4 border-t border-white/10">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-flag-500 hover:bg-white/5">
          <LogOut size={17} /> Logout
        </button>
      </form>
    </aside>
  );
}
