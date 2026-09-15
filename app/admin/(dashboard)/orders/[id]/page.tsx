import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { StatusUpdateControl, ResultUploader } from "@/components/admin/AdminOrderActions";
import { ChatPanel } from "@/components/ChatPanel";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*, order_items(*), profiles(full_name, whatsapp), payments(method, status, proof_file_url, created_at)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: chatMessages } = await admin
    .from("order_chat_messages")
    .select("id, sender_type, message_type, content, file_url, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const customer = order.profiles as unknown as { full_name: string; whatsapp: string } | null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-ink-950">{order.order_number}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="text-sm text-ink-500 mb-6">
        {customer?.full_name} · {customer?.whatsapp}
      </p>

      <div className="mb-6">
        <StatusUpdateControl orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="rounded-card border border-ink-900/8 bg-white p-5 space-y-5 mb-6">
        <h2 className="font-display font-semibold text-ink-950">Item Pesanan</h2>
        {order.order_items.map(
          (item: {
            id: string;
            product_name_snapshot: string;
            quantity: number;
            unit_price: number;
            configuration: Record<string, string>;
            material_status: string;
            material_text: string | null;
            material_files: { path: string; name: string }[];
            notes: string | null;
            result_files: { path: string; name: string }[];
          }) => (
            <div key={item.id} className="border-t border-ink-900/8 pt-4 first:border-0 first:pt-0">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-ink-900">{item.product_name_snapshot}</span>
                <span className="font-medium text-ink-900">{formatRupiah(item.unit_price * item.quantity)}</span>
              </div>

              {Object.keys(item.configuration ?? {}).length > 0 && (
                <div className="text-xs text-ink-600 mb-2">
                  {Object.entries(item.configuration).map(([k, v]) => (
                    <p key={k}>
                      {k}: <span className="text-ink-900">{v}</span>
                    </p>
                  ))}
                </div>
              )}

              <p className="text-xs text-ink-600 mb-1">
                Materi: <span className="font-medium">{item.material_status === "available" ? "Sudah ada" : "Belum ada"}</span>
              </p>
              {item.material_text && <p className="text-xs text-ink-600 mb-1 bg-paper-100 rounded p-2">{item.material_text}</p>}
              {item.material_files?.length > 0 && (
                <ul className="text-xs text-signal-600 mb-2">
                  {item.material_files.map((f) => (
                    <li key={f.path}>{f.name}</li>
                  ))}
                </ul>
              )}
              {item.notes && <p className="text-xs text-ink-500 mb-2">Catatan: {item.notes}</p>}

              <div className="mt-2">
                {item.result_files?.length > 0 && (
                  <ul className="text-xs text-emerald-600 mb-2">
                    {item.result_files.map((f) => (
                      <li key={f.path}>✓ {f.name}</li>
                    ))}
                  </ul>
                )}
                <ResultUploader orderItemId={item.id} orderId={order.id} />
              </div>
            </div>
          )
        )}
      </div>

      {order.payments?.length > 0 && (
        <div className="rounded-card border border-ink-900/8 bg-white p-5">
          <h2 className="font-display font-semibold text-ink-950 mb-3">Riwayat Pembayaran</h2>
          {order.payments.map(
            (p: { method: string; status: string; proof_file_url: string | null; created_at: string }, i: number) => (
              <div key={i} className="text-sm text-ink-700 border-t border-ink-900/8 pt-2 mt-2 first:border-0 first:mt-0 first:pt-0">
                {p.method.toUpperCase()} · {p.status} ·{" "}
                {new Date(p.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-6">
        <ChatPanel orderId={order.id} messages={chatMessages ?? []} role="admin" />
      </div>
    </div>
  );
}
