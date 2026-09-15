"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeVerifiedOrder } from "@/lib/actions/payments";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (!adminUser || !adminUser.is_active) return null;
  return adminUser;
}

export async function verifyOrderPayment(paymentId: string, approve: boolean, rejectionReason?: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Tidak diizinkan." };

  const db = createAdminClient();
  const { data: payment } = await db.from("payments").select("id, order_id").eq("id", paymentId).single();
  if (!payment) return { ok: false as const, error: "Data pembayaran tidak ditemukan." };

  if (approve) {
    await db
      .from("payments")
      .update({ status: "PAYMENT_VERIFIED", verified_by: admin.id, verified_at: new Date().toISOString() })
      .eq("id", paymentId);
    await finalizeVerifiedOrder(payment.order_id);
  } else {
    await db
      .from("payments")
      .update({ status: "PAYMENT_REJECTED", rejection_reason: rejectionReason ?? "Bukti pembayaran tidak valid." })
      .eq("id", paymentId);
    await db.from("orders").update({ status: "PENDING_PAYMENT" }).eq("id", payment.order_id);
    await db.from("order_status_history").insert({
      order_id: payment.order_id,
      status: "PENDING_PAYMENT",
      note: "Pembayaran ditolak — customer perlu mengunggah ulang bukti.",
      changed_by: admin.id,
    });

    const { data: order } = await db.from("orders").select("user_id, order_number").eq("id", payment.order_id).single();
    if (order) {
      await db.from("notifications").insert({
        user_id: order.user_id,
        type: "payment_rejected",
        title: "Pembayaran ditolak",
        body: `Bukti pembayaran untuk pesanan ${order.order_number} ditolak. Silakan unggah ulang.`,
        reference_order_id: payment.order_id,
      });
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath(`/orders/${payment.order_id}`);
  return { ok: true as const };
}

export async function verifyTopup(topupId: string, approve: boolean, rejectionReason?: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Tidak diizinkan." };

  const db = createAdminClient();
  const { data: topup } = await db.from("wallet_topup_requests").select("*").eq("id", topupId).single();
  if (!topup) return { ok: false as const, error: "Data top up tidak ditemukan." };

  if (approve) {
    const { error: rpcError } = await db.rpc("approve_wallet_topup", {
      p_topup_id: topupId,
      p_admin_id: admin.id,
    });
    if (rpcError) return { ok: false as const, error: rpcError.message || "Gagal menambah saldo." };

    await db.from("notifications").insert({
      user_id: topup.user_id,
      type: "topup_approved",
      title: "Top up berhasil",
      body: `Saldo sebesar Rp${topup.amount.toLocaleString("id-ID")} telah ditambahkan ke walletmu.`,
    });
  } else {
    await db
      .from("wallet_topup_requests")
      .update({ status: "REJECTED", rejection_reason: rejectionReason ?? "Bukti transfer tidak valid." })
      .eq("id", topupId);

    await db.from("notifications").insert({
      user_id: topup.user_id,
      type: "topup_rejected",
      title: "Top up ditolak",
      body: "Permintaan top up saldo kamu ditolak. Silakan ajukan ulang dengan bukti yang benar.",
    });
  }

  revalidatePath("/admin/payments");
  return { ok: true as const };
}
