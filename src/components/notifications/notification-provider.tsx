"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (ids?: string[]) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      const data = await response.json();
      if (data.success) {
        // Check for new notifications
        const previousIds = notifications.map((n) => n.id);
        const newNotifications = data.data.filter(
          (n: Notification) => !previousIds.includes(n.id) && !n.isRead
        );

        // Show toast for new notifications
        newNotifications.forEach((notification: Notification) => {
          toast[notification.type as "success" | "error" | "info" | "warning"](
            notification.title,
            {
              description: notification.message,
              action: notification.link
                ? {
                    label: "View",
                    onClick: () => {
                      window.location.href = notification.link!;
                    },
                  }
                : undefined,
            }
          );
        });

        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const markAsRead = async (ids?: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: ids,
          markAllAsRead: !ids,
        }),
      });

      if (ids) {
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - ids.length));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const refreshNotifications = async () => {
    setLoading(true);
    await fetchNotifications();
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        refreshNotifications,
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
