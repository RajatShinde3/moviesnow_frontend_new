// components/NotificationCenter.tsx
/**
 * =============================================================================
 * Notification Center Component
 * =============================================================================
 * Best Practices:
 * - Real-time notifications
 * - Notification types (new release, watchlist, system)
 * - Mark as read functionality
 * - Clear all / bulk actions
 * - Dropdown UI with animations
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Bell,
  X,
  Film,
  Star,
  Clock,
  Settings,
  CheckCircle,
  Trash2,
  Play,
} from "lucide-react";

interface Notification {
  id: string;
  type: "new_release" | "watchlist" | "recommendation" | "system" | "download";
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/v1/notifications", { credentials: "include" });
      if (!response.ok) {
        // Mock data for demo
        return [
          {
            id: "1",
            type: "new_release",
            title: "New Release",
            message: "Stranger Things Season 5 is now available",
            action_url: "/watch/stranger-things-5",
            is_read: false,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "watchlist",
            title: "Watchlist Update",
            message: "The movie you saved is expiring soon",
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "recommendation",
            title: "Recommended for You",
            message: "Based on your history, you might like Inception",
            action_url: "/title/inception",
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ] as Notification[];
      }
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30s
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/v1/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/notifications/clear", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n: Notification) => !n.is_read).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
      setIsOpen(false);
    }
  };

  const typeIcons = {
    new_release: <Film className="h-5 w-5 text-blue-400" />,
    watchlist: <Star className="h-5 w-5 text-yellow-400" />,
    recommendation: <Play className="h-5 w-5 text-green-400" />,
    system: <Settings className="h-5 w-5 text-gray-400" />,
    download: <Clock className="h-5 w-5 text-purple-400" />,
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg bg-gray-900 shadow-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Mark all read
                </button>
              )}
              {notifications && notifications.length > 0 && (
                <button
                  onClick={() => clearAllMutation.mutate()}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group flex cursor-pointer gap-3 p-4 transition-colors hover:bg-gray-800",
                    !notification.is_read && "bg-blue-900/10"
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {notification.image_url ? (
                      <img
                        src={notification.image_url}
                        alt=""
                        className="h-12 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                        {typeIcons[notification.type]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(notification.id);
                    }}
                    className="flex-shrink-0 rounded p-1 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-600" />
                <p className="mt-2 text-gray-400">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 p-3">
            <button
              onClick={() => {
                router.push("/settings/notifications");
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
