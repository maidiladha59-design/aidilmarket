"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: adminUser } = await supabase.from("admin_users").select("id, is_active").eq("id", user.id).single();
  if (!adminUser || !adminUser.is_active) return null;
  return adminUser;
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Tidak diizinkan." };

  const db = createAdminClient();
  await db.from("orders").update({ status }).eq("id", orderId);
  await db.from("order_status_history").insert({ order_id: orderId, status, note, changed_by: admin.id });

  const { data: order } = await db.from("orders").select("user_id, order_number").eq("id", orderId).single();
  if (order) {
    await db.from("notifications").insert({
      user_id: order.user_id,
      type: "order_status_changed",
      title: "Status pesanan diperbarui",
      body: `Pesanan ${order.order_number} sekarang berstatus "${status}".`,
      reference_order_id: orderId,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true as const };
}

export async function uploadOrderResult(orderItemId: string, orderId: string, files: { path: string; name: string }[]) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Tidak diizinkan." };

  const db = createAdminClient();
  const { data: item } = await db.from("order_items").select("result_files").eq("id", orderItemId).single();
  const existing = (item?.result_files as { path: string; name: string }[] | null) ?? [];

  await db
    .from("order_items")
    .update({ result_files: [...existing, ...files] })
    .eq("id", orderItemId);

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}
