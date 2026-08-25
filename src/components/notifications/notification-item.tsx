import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationDTO } from "@/types/notification";
import { NotificationIcon } from "./notification-icon";
import { formatRelativeTime, isSafeInternalNotificationPath } from "@/lib/notification-format";
import { useNotifications } from "./notification-provider";

export function NotificationItem({
  notification,
  onActionComplete,
  isFullPage = false,
}: {
  notification: NotificationDTO;
  onActionComplete?: () => void;
  isFullPage?: boolean;
}) {
  const router = useRouter();
  const { markRead } = useNotifications();
  const [isHandling, setIsHandling] = useState(false);

  const handleClick = async () => {
    if (isHandling) return;
    setIsHandling(true);

    try {
      if (!notification.read) {
        await markRead(notification.id);
      }

      if (isSafeInternalNotificationPath(notification.actionUrl)) {
        router.push(notification.actionUrl!);
      }
      onActionComplete?.();
    } finally {
      setIsHandling(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isHandling}
      className={`w-full text-left p-4 transition-colors flex items-start gap-4 ${
        !notification.read ? "bg-teal-50 hover:bg-teal-100/50" : "bg-white hover:bg-slate-50"
      } ${
        isFullPage ? "rounded-xl border border-slate-100 shadow-sm mb-3" : "border-b border-slate-100 last:border-0"
      }`}
    >
      <div className={`flex-shrink-0 mt-1 flex items-center justify-center rounded-full ${
        isFullPage ? "w-12 h-12 bg-slate-100" : "w-10 h-10 bg-slate-100"
      }`}>
        <NotificationIcon type={notification.type} className={`text-slate-600 ${isFullPage ? "w-6 h-6" : "w-5 h-5"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" aria-label="Unread" />
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap break-words">
          {notification.message}
        </p>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
