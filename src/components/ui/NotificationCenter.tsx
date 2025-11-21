// components/ui/NotificationCenter.tsx
/**
 * =============================================================================
 * Smart Notification Center - Netflix-Style Alerts
 * =============================================================================
 * Toast notifications for new episodes, downloads, recommendations
 */

"use client";

import * as React from "react";
import { X, Bell, Download, Play, Star, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";

export type NotificationType =
  | "new_episode"
  | "download_complete"
  | "recommendation"
  | "trending"
  | "review_reply"
  | "watchlist_available"
  | "success"
  | "error"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      type: "new_episode",
      title: "New Episode Available",
      message: "Stranger Things S5E3 'The Upside Down' is now available",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
      read: false,
      actionUrl: "/watch/stranger-things/s5/e3",
      actionLabel: "Watch Now",
      imageUrl: "https://via.placeholder.com/60x90",
    },
    {
      id: "2",
      type: "download_complete",
      title: "Download Complete",
      message: "The Matrix (1999) - 1080p is ready to watch offline",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      read: false,
      actionUrl: "/downloads",
      actionLabel: "View Downloads",
    },
    {
      id: "3",
      type: "recommendation",
      title: "New Recommendation",
      message: "Based on your viewing history, you might like 'Inception'",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      actionUrl: "/title/inception",
      actionLabel: "View Title",
      imageUrl: "https://via.placeholder.com/60x90",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "new_episode":
        return <Play className="h-5 w-5 text-primary" />;
      case "download_complete":
        return <Download className="h-5 w-5 text-green-500" />;
      case "recommendation":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "trending":
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l bg-card shadow-2xl sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="border-b p-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary transition-colors hover:text-primary/80"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll notify you when something new happens
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-primary" />
                  )}

                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {notification.imageUrl && (
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={notification.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Icon (if no image) */}
                    {!notification.imageUrl && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        {getIcon(notification.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-tight">
                          {notification.title}
                        </h3>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="rounded-full p-1 transition-colors hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>

                        {notification.actionUrl && notification.actionLabel && (
                          <Link
                            href={notification.actionUrl}
                            onClick={() => {
                              markAsRead(notification.id);
                              onClose();
                            }}
                            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            {notification.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
