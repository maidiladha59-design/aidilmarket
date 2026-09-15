import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewModerationRow } from "@/components/admin/ReviewModerationRow";

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("id, rating, comment, status, created_at, products(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 mb-6">Review</h1>
      <div className="rounded-card border border-ink-900/8 bg-white divide-y divide-ink-900/8">
        {(reviews ?? []).map((r) => (
          <ReviewModerationRow
            key={r.id}
            id={r.id}
            rating={r.rating}
            comment={r.comment}
            status={r.status}
            productName={(r.products as unknown as { name: string } | null)?.name ?? "-"}
            customerName={(r.profiles as unknown as { full_name: string } | null)?.full_name ?? "-"}
          />
        ))}
        {(!reviews || reviews.length === 0) && <p className="p-5 text-sm text-ink-500">Belum ada review.</p>}
      </div>
    </div>
  );
}
