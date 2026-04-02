import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import notificationsApi from "../lib/api/notifications.api";
import { useAuth } from "./AuthContext";
import { useAdminAuth } from "./AdminAuthContext";
import { extractArray } from "../lib/api/response";

export type NotificationType = "success" | "error" | "info";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: "read" | "unread";
  createdAt: string;
};

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  const fetchNotifications = useCallback(async () => {
    // Avoid hitting protected notification endpoints on public pages / logged-out sessions.
    if (isLoading || isAdminLoading) return;
    if (!isAuthenticated && !isAdminAuthenticated) return;

    const res = await notificationsApi.list({ limit: 20 });
    if (res.success) {
      const data = extractArray(res.data);
      setNotifications(data);
      setUnreadCount(data.filter((n: NotificationItem) => n.status === "unread").length);
    }
  }, [isAuthenticated, isLoading, isAdminAuthenticated, isAdminLoading]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => n.status === "unread").map((n) => n.id);
    if (!unreadIds.length) return;
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => (n.status === "unread" ? { ...n, status: "read" } : n)));
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    void fetchNotifications();
    // Poll every 30 seconds to keep the notification badge accurate.
    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }),
    [notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
