"use client";

import { useTransition } from "react";
import Link from "next/link";
import { markNotificationRead } from "@/lib/actions/notifications";

export type NotificationData = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_order_id: string | null;
  created_at: string;
};

export function NotificationRow({ notification }: { notification: NotificationData }) {
  const [, startTransition] = useTransition();

  const content = (
    <div
      onClick={() =>
        !notification.is_read &&
        startTransition(() => {
          void markNotificationRead(notification.id);
        })
      }
      className={`rounded-card border p-4 cursor-pointer transition-colors ${
        notification.is_read ? "border-ink-900/8 bg-white" : "border-signal-500/30 bg-signal-500/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-950">{notification.title}</p>
        {!notification.is_read && <span className="h-2 w-2 rounded-full bg-signal-500 mt-1.5 shrink-0" />}
      </div>
      {notification.body && <p className="mt-1 text-sm text-ink-600">{notification.body}</p>}
      <p className="mt-2 text-xs text-ink-400">
        {new Date(notification.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );

  return notification.reference_order_id ? (
    <Link href={`/orders/${notification.reference_order_id}`}>{content}</Link>
  ) : (
    content
  );
}
