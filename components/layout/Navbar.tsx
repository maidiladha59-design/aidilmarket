import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "./NavbarClient";

const MAIN_MENU = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/products" },
  { label: "Kategori", href: "/categories" },
  { label: "Cara Order", href: "/how-to-order" },
  { label: "Produk Digital", href: "/digital-products" },
  { label: "Tentang Kami", href: "/about" },
];

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string | null; avatar_url: string | null; wallet_balance: number } | null = null;
  let cartCount = 0;

  if (user) {
    const [{ data: profileData }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, avatar_url, wallet_balance")
        .eq("id", user.id)
        .single(),
      supabase
        .from("cart_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
    profile = profileData ?? null;
    cartCount = count ?? 0;
  }

  return <NavbarClient menu={MAIN_MENU} user={user ? { profile } : null} cartCount={cartCount} />;
}
