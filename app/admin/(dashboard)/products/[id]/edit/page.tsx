import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariationManager, ConfigFieldManager } from "@/components/admin/ProductVariationManager";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin
      .from("products")
      .select("*, product_variations(*), product_configuration_fields(*)")
      .eq("id", id)
      .single(),
    admin.from("categories").select("id, name").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-950">Edit Produk</h1>

      <ProductForm
        productId={product.id}
        categories={categories ?? []}
        initial={{
          name: product.name,
          slug: product.slug,
          categoryId: product.category_id,
          description: product.description ?? "",
          shortDescription: product.short_description ?? "",
          priceType: product.price_type,
          basePrice: product.base_price,
          priceUnit: product.price_unit ?? "",
          estimatedTime: product.estimated_time ?? "",
          revisionLimit: product.revision_limit,
          isDigital: product.is_digital,
          status: product.status,
          featured: product.featured,
          popular: product.popular,
          image: product.image ?? "",
          expressFeePercent: product.express_fee_percent,
        }}
      />

      <VariationManager productId={product.id} variations={product.product_variations ?? []} />
      <ConfigFieldManager productId={product.id} fields={product.product_configuration_fields ?? []} />
    </div>
  );
}
