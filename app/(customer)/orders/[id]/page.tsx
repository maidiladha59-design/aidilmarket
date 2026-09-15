import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Check } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { PaymentPanel } from "@/components/order/PaymentPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { ResultFiles, RevisionForm, ReviewForm } from "@/components/order/OrderItemActions";

const TIMELINE = [
  { status: "PENDING_PAYMENT", label: "Pesanan dibuat" },
  { status: "PAYMENT_VERIFIED", label: "Pembayaran diverifikasi" },
  { status: "PROCESSING", label: "Pengerjaan berlangsung" },
  { status: "COMPLETED", label: "Pesanan selesai" },
];

function timelineIndex(status: string) {
  if (status === "CANCELLED" || status === "REFUNDED") return -1;
  if (status === "REVISION_REQUESTED" || status === "REVISION_PROCESSING") return 2; // tetap di tahap "diproses"
  return TIMELINE.findIndex((t) => t.status === status);
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orders/${id}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("order_item_id")
    .eq("user_id", user.id)
    .in("order_item_id", (order.order_items ?? []).map((i: { id: string }) => i.id));
  const reviewedItemIds = new Set((existingReviews ?? []).map((r) => r.order_item_id));

  const currentStep = timelineIndex(order.status);

  let paymentPanelData: { methods: { type: "bank_jago" | "dana" | "gopay" | "qris"; label: string; account_number: string | null; account_name: string | null; qris_image_url: string | null }[]; walletBalance: number } | null = null;

  if (order.status === "PENDING_PAYMENT") {
    const [{ data: methods }, { data: profile }] = await Promise.all([
      supabase.from("payment_methods").select("*").eq("is_enabled", true),
      supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
    ]);

    const METHOD_LABEL: Record<string, string> = {
      bank_jago: "Bank Jago",
      dana: "DANA",
      gopay: "GoPay",
      qris: "QRIS",
    };

    paymentPanelData = {
      methods: (methods ?? [])
        .filter((m) => m.type !== "wallet")
        .map((m) => ({
          type: m.type,
          label: METHOD_LABEL[m.type] ?? m.type,
          account_number: m.account_number,
          account_name: m.account_name,
          qris_image_url: m.qris_image_url,
        })),
      walletBalance: profile?.wallet_balance ?? 0,
    };
  }

  const { data: latestPayment } = await supabase
    .from("payments")
    .select("status, rejection_reason")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: chatMessages } = await supabase
    .from("order_chat_messages")
    .select("id, sender_type, message_type, content, file_url, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-ink-950">{order.order_number}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="text-sm text-ink-500 mb-8">
        Dibuat {new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
      </p>

      {currentStep >= 0 && (
        <div className="mb-10 rounded-card border border-ink-900/8 bg-white p-5">
          <ol className="flex justify-between">
            {TIMELINE.map((step, i) => (
              <li key={step.status} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && (
                  <span
                    className={`absolute top-3.5 right-1/2 h-0.5 w-full -z-10 ${
                      i <= currentStep ? "bg-signal-500" : "bg-ink-900/10"
                    }`}
                  />
                )}
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${
                    i <= currentStep ? "bg-signal-500" : "bg-ink-900/15"
                  }`}
                >
                  {i <= currentStep && <Check size={14} />}
                </span>
                <span className="mt-2 text-[11px] text-ink-600 max-w-[80px]">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {order.status === "PENDING_PAYMENT" && paymentPanelData && (
        <div className="mb-8">
          <PaymentPanel
            orderId={order.id}
            total={order.total}
            methods={paymentPanelData.methods}
            walletBalance={paymentPanelData.walletBalance}
          />
        </div>
      )}

      {order.status === "PAYMENT_REVIEW" && (
        <div className="mb-8 rounded-card border border-gold-500/30 bg-gold-500/5 p-4 text-sm text-ink-700">
          Bukti pembayaran kamu sedang diperiksa tim kami. Kami akan mengabari lewat notifikasi begitu selesai.
        </div>
      )}

      {latestPayment?.status === "PAYMENT_REJECTED" && (
        <div className="mb-8 rounded-card border border-flag-500/30 bg-flag-500/5 p-4 text-sm text-ink-700">
          Pembayaran sebelumnya ditolak
          {latestPayment.rejection_reason ? `: ${latestPayment.rejection_reason}` : "."} Silakan unggah ulang bukti
          pembayaran yang benar.
        </div>
      )}

      <div className="rounded-card border border-ink-900/8 bg-white p-5 space-y-4">
        <h2 className="font-display font-semibold text-ink-950">Detail Pesanan</h2>
        {order.order_items.map((item: { id: string; product_id: string; product_name_snapshot: string; quantity: number; unit_price: number; deadline_at: string | null; revision_used: number; revision_limit: number; result_files: { path: string; name: string }[] }) => (
          <div key={item.id} className="border-t border-ink-900/8 pt-4 first:border-0 first:pt-0">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-ink-900">{item.product_name_snapshot}</span>
              <span className="font-medium text-ink-900">{formatRupiah(item.unit_price * item.quantity)}</span>
            </div>
            <p className="text-xs text-ink-500 mt-1">Qty {item.quantity}</p>
            {item.deadline_at && (
              <p className="text-xs text-ink-500">
                Deadline: {new Date(item.deadline_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
            <p className="text-xs text-ink-500">Revisi: {item.revision_used}/{item.revision_limit}</p>

            <ResultFiles orderId={order.id} files={item.result_files ?? []} />

            {order.status === "COMPLETED" && (
              <>
                <RevisionForm orderItemId={item.id} orderId={order.id} revisionUsed={item.revision_used} revisionLimit={item.revision_limit} />
                {!reviewedItemIds.has(item.id) && <ReviewForm orderItemId={item.id} productId={item.product_id} />}
              </>
            )}
          </div>
        ))}

        <div className="border-t border-ink-900/8 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.express_fee > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Biaya express</span>
              <span>{formatRupiah(order.express_fee)}</span>
            </div>
          )}
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-flag-500">
              <span>Diskon</span>
              <span>-{formatRupiah(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-ink-950 text-base pt-1.5">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ChatPanel orderId={order.id} messages={chatMessages ?? []} role="customer" />
      </div>
    </div>
  );
}
