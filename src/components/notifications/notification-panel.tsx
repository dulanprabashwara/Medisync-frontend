import React, { useEffect } from "react";
import { useNotifications } from "./notification-provider";
import { NotificationItem } from "./notification-item";
import { Loader2 } from "lucide-react";

export function NotificationPanel({
  onClose,
  viewAllRoute,
}: {
  onClose: () => void;
  viewAllRoute: string;
}) {
  const {
    unreadCount,
    latestNotifications,
    panelLoading,
    panelError,
    notificationsLoaded,
    loadLatestNotifications,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    if (!notificationsLoaded) {
      void loadLatestNotifications();
    }
  }, [notificationsLoaded, loadLatestNotifications]);

  const hasUnread = unreadCount > 0 || latestNotifications.some((n) => !n.read);

  return (
    <div className="flex flex-col h-full sm:max-h-[520px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <h3 className="font-semibold text-slate-900">Notifications</h3>
        {latestNotifications.length > 0 && (
          <button
            onClick={() => void markAllRead()}
            disabled={!hasUnread}
            className={`text-xs font-medium transition-colors ${
              hasUnread
                ? "text-teal-600 hover:text-teal-700 cursor-pointer"
                : "text-slate-400 cursor-default"
            }`}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50">
        {panelLoading && !notificationsLoaded ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : panelError ? (
          <div className="flex flex-col justify-center items-center h-32 px-4 text-center">
            <p className="text-sm text-slate-600 mb-2">{panelError}</p>
            <button
              onClick={() => void loadLatestNotifications()}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Retry
            </button>
          </div>
        ) : latestNotifications.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 px-4 text-center text-slate-500">
            <p className="font-medium text-slate-900 mb-1">You&apos;re all caught up</p>
            <p className="text-sm">Important MediSync activity will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {latestNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onActionComplete={onClose}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 shrink-0">
        <a
          href={viewAllRoute}
          onClick={() => {
            // Let normal link navigation happen, just close panel
            onClose();
          }}
          className="block w-full text-center py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          View all notifications
        </a>
      </div>
    </div>
  );
}
