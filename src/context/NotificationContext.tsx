import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import notificationsApi from "../lib/api/notifications.api";

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
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const res = await notificationsApi.list();
    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: NotificationItem) => n.status === "unread").length);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, fetchNotifications, markAsRead }),
    [notifications, unreadCount, fetchNotifications, markAsRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
