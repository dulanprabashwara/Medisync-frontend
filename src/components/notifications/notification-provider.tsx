"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { NotificationDTO } from "@/types/notification";
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from "@/lib/api/notifications";
import { useNotificationEvents } from "@/hooks/use-notification-events";
import { useAuth } from "@/components/auth-provider";
import { toast } from "react-hot-toast";

interface NotificationContextValue {
  unreadCount: number;
  latestNotifications: NotificationDTO[];
  panelLoading: boolean;
  panelError: string | null;
  notificationsLoaded: boolean;
  loadLatestNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearNotificationState: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState<NotificationDTO[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const { session } = useAuth();
  const token = session?.access_token || "";

  const refreshUnreadCount = useCallback(async () => {
    try {
      if (!token) return;
      const count = await getUnreadNotificationCount(token);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to refresh unread count", err);
    }
  }, [token]);

  const loadLatestNotifications = useCallback(async () => {
    setPanelLoading(true);
    setPanelError(null);
    try {
      if (!token) throw new Error("No token");
      const page = await getNotifications(token, { page: 0, size: 20 });
      setLatestNotifications(page.content);
      setNotificationsLoaded(true);
    } catch {
      setPanelError("We couldn't load notifications.");
    } finally {
      setPanelLoading(false);
    }
  }, [token]);

  const clearNotificationState = useCallback(() => {
    setUnreadCount(0);
    setLatestNotifications([]);
    setNotificationsLoaded(false);
    setPanelError(null);
    setPanelLoading(false);
  }, []);

  const handleRealtimeNotification = useCallback((notification: NotificationDTO) => {
    setLatestNotifications((prev) => {
      // Deduplicate
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
      toast.success(`${notification.title}: ${notification.message}`);
    }
  }, []);

  useNotificationEvents(
    handleRealtimeNotification,
    refreshUnreadCount // Reconnect action
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  const markRead = async (id: string) => {
    // Optimistic UI update to prevent duplicate clicks decrementing unread twice
    let wasUnread = false;
    setLatestNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          if (!n.read) wasUnread = true;
          return { ...n, read: true };
        }
        return n;
      })
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      if (token) await markNotificationRead(token, id);
    } catch {
      // Revert if failed
      if (wasUnread) {
        setUnreadCount((prev) => prev + 1);
        setLatestNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      }
    }
  };

  const markAllRead = async () => {
    setLatestNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      if (token) await markAllNotificationsRead(token);
    } catch {
      // Refresh count on failure to fix sync
      void refreshUnreadCount();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        latestNotifications,
        panelLoading,
        panelError,
        notificationsLoaded,
        loadLatestNotifications,
        refreshUnreadCount,
        markRead,
        markAllRead,
        clearNotificationState,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
