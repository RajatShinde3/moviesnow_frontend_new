/**
 * =============================================================================
 * Notifications Page
 * =============================================================================
 * Complete notification center with real-time updates and filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Play,
  Heart,
  MessageSquare,
  Star,
  Download,
  CreditCard,
  AlertCircle,
  Info,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/lib/api/hooks/useNotifications';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationType =
  | 'new_episode'
  | 'new_content'
  | 'review_like'
  | 'review_reply'
  | 'subscription'
  | 'download_ready'
  | 'recommendation'
  | 'system';

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const { data: notificationsData, isLoading, refetch } = useNotifications({
    unread_only: filter === 'unread',
    page,
    per_page: 20,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Auto-refresh every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (window.confirm('Mark all notifications as read?')) {
      await markAllAsRead.mutateAsync();
    }
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification.mutateAsync(notificationId);
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedNotifications.size} notifications?`)) {
      for (const id of selectedNotifications) {
        await deleteNotification.mutateAsync(id);
      }
      setSelectedNotifications(new Set());
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="h-10 w-10 text-purple-400" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-400">Stay updated with your latest activity</p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-bold transition-colors border border-purple-500/30 flex items-center gap-2"
              >
                <CheckCheck className="h-5 w-5" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters and Actions */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                {(['all', 'unread', 'read'] as NotificationFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === f
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'unread' && unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors border border-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedNotifications.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.has(notification.id)}
                onToggleSelect={() => toggleSelection(notification.id)}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
                onDelete={() => handleDelete(notification.id)}
                onClick={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id);
                  }
                  if (notification.action_url) {
                    router.push(notification.action_url);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <Bell className="h-24 w-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Notifications</h2>
            <p className="text-gray-400">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here when you have new activity'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {notificationsData && notificationsData.total_count > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-900/50 text-white rounded-lg">
              Page {page} of {Math.ceil(notificationsData.total_count / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(notificationsData.total_count / 20)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Card Component
// ─────────────────────────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  isSelected,
  onToggleSelect,
  onMarkAsRead,
  onDelete,
  onClick,
}: {
  notification: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const icon = getNotificationIcon(notification.notification_type);
  const color = getNotificationColor(notification.notification_type);

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border transition-all ${
        notification.is_read
          ? 'border-gray-800 hover:border-gray-700'
          : 'border-purple-500/50 bg-purple-500/5'
      } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
    >
      <div className="flex items-start gap-4 p-6">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-5 h-5 bg-gray-800 border-gray-700 rounded"
        />

        {/* Icon */}
        <div
          className={`p-3 bg-gradient-to-br ${color} rounded-xl flex-shrink-0`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3
              className={`font-bold ${
                notification.is_read ? 'text-gray-300' : 'text-white'
              }`}
            >
              {notification.title}
            </h3>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>

          <p
            className={`text-sm mb-3 ${
              notification.is_read ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {notification.body}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}</span>
            {notification.notification_type && (
              <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                {notification.notification_type.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Mark as read"
            >
              <Check className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getNotificationIcon(type: NotificationType) {
  const iconMap = {
    new_episode: <Play className="h-6 w-6 text-white" />,
    new_content: <Film className="h-6 w-6 text-white" />,
    review_like: <Heart className="h-6 w-6 text-white" />,
    review_reply: <MessageSquare className="h-6 w-6 text-white" />,
    subscription: <CreditCard className="h-6 w-6 text-white" />,
    download_ready: <Download className="h-6 w-6 text-white" />,
    recommendation: <TrendingUp className="h-6 w-6 text-white" />,
    system: <Info className="h-6 w-6 text-white" />,
  };

  return iconMap[type] || <Bell className="h-6 w-6 text-white" />;
}

function getNotificationColor(type: NotificationType) {
  const colorMap = {
    new_episode: 'from-blue-500 to-blue-600',
    new_content: 'from-purple-500 to-purple-600',
    review_like: 'from-red-500 to-pink-500',
    review_reply: 'from-green-500 to-green-600',
    subscription: 'from-yellow-500 to-orange-500',
    download_ready: 'from-cyan-500 to-blue-500',
    recommendation: 'from-indigo-500 to-purple-500',
    system: 'from-gray-500 to-gray-600',
  };

  return colorMap[type] || 'from-purple-500 to-pink-500';
}
