import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DownloadButton } from "@/components/DownloadButton";

export default async function DownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/downloads");

  const { data: purchases } = await supabase
    .from("digital_product_purchases")
    .select("id, download_count, created_at, products(name, image, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Produk Digital Saya</h1>

      {!purchases || purchases.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">Kamu belum punya produk digital.</p>
          <Link href="/digital-products" className="text-sm font-semibold text-signal-500 hover:underline">
            Jelajahi produk digital
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {purchases.map((p) => {
            const product = p.products as unknown as { name: string; image: string | null; slug: string };
            return (
              <div key={p.id} className="flex gap-4 rounded-card border border-ink-900/8 bg-white p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-900/5">
                  {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-display font-medium text-ink-950 text-sm">{product.name}</p>
                  <p className="text-xs text-ink-500 mb-2">
                    Dibeli {new Date(p.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })} · Diunduh{" "}
                    {p.download_count}x
                  </p>
                  <DownloadButton purchaseId={p.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
