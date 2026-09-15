import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationRow } from "@/components/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-950">Notifikasi</h1>
        {hasUnread && (
          <form
  action={async () => {
    "use server";
    await markAllNotificationsRead();
  }}
>
            <button className="text-sm text-signal-500 hover:underline">Tandai semua dibaca</button>
          </form>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <p className="text-sm text-ink-500 text-center py-12">Belum ada notifikasi.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
