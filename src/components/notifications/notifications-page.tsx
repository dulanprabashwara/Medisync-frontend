"use client";

import React, { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsRead } from "@/lib/api/notifications";
import { useNotifications } from "./notification-provider";
import { useAuth } from "@/components/auth-provider";
import { NotificationItem } from "./notification-item";
import { Pagination } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import type { NotificationDTO } from "@/types/notification";

export function NotificationsPage() {
  const { refreshUnreadCount } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { session } = useAuth();
  const token = session?.access_token || "";

  const fetchNotifications = React.useCallback(async (currentPage: number, currentFilter: "all" | "unread") => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("No token");
      const result = await getNotifications(token, {
        page: currentPage,
        size: 20,
        unreadOnly: currentFilter === "unread" ? true : undefined,
      });
      setNotifications(result.content);
      setTotalPages(result.totalPages);
    } catch {
      setError("We couldn't load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications(page, filter);
  }, [page, filter, fetchNotifications]);

  const handleFilterChange = (newFilter: "all" | "unread") => {
    if (filter === newFilter) return;
    setFilter(newFilter);
    setPage(0);
  };

  const handleMarkAll = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      if (token) await markAllNotificationsRead(token);
      // Update local state to reflect all are read
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      void refreshUnreadCount();
      if (filter === "unread") {
        void fetchNotifications(0, "unread"); // Refetch which will yield empty if actually filtered by backend
      }
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600 mt-1">Stay updated on important MediSync activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("unread")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={() => void handleMarkAll()}
            disabled={isMarkingAll || (filter === "unread" && notifications.length === 0)}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 transition-colors"
          >
            {isMarkingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
          <p className="text-slate-600 font-medium">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center px-4">
          <p className="text-slate-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => void fetchNotifications(page, filter)}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            {filter === "unread" ? "No unread notifications" : "You're all caught up"}
          </h2>
          <p className="text-slate-500">
            {filter === "unread" ? "You've read all your notifications." : "Important MediSync activity will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} isFullPage />
          ))}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
