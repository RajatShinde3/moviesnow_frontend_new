/**
 * =============================================================================
 * NotificationCenter Component
 * =============================================================================
 * Full notification management page with filtering, sorting, and bulk actions
 */

'use client';

import { useState } from 'react';
import {
  Bell,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Pin,
  ExternalLink,
  AlertCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  usePinNotification,
  useUnpinNotification,
  useClearAllNotifications,
  useNotificationStats,
} from '@/lib/api/hooks/useNotifications';
import { Notification, NotificationType, NotificationPriority } from '@/lib/api/services/notifications';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | NotificationType;
type FilterPriority = 'all' | NotificationPriority;

export default function NotificationCenter() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const limit = 20;

  const { data, isLoading, refetch } = useNotifications({
    unread_only: unreadOnly,
    type: filterType !== 'all' ? filterType : undefined,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
    limit,
    offset: page * limit,
  });

  const { data: stats } = useNotificationStats();

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const pinNotification = usePinNotification();
  const unpinNotification = useUnpinNotification();
  const clearAll = useClearAllNotifications();

  const handleSelectAll = () => {
    if (selectedIds.size === data?.notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.notifications.map((n) => n.id) || []));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    await markAllAsRead.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notification(s)?`)) return;

    for (const id of selectedIds) {
      await deleteNotification.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-gray-400">
                Stay updated with the latest news and updates
              </p>
            </div>
            <Link
              href="/notifications/preferences"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
            >
              <Settings className="h-5 w-5" />
              <span>Preferences</span>
            </Link>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total"
                value={stats.total_count}
                icon="📊"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                label="Unread"
                value={stats.unread_count}
                icon="🔔"
                color="from-red-500 to-red-600"
              />
              <StatCard
                label="This Week"
                value={stats.recent_activity.reduce((sum, day) => sum + day.count, 0)}
                icon="📅"
                color="from-green-500 to-green-600"
              />
              <StatCard
                label="Categories"
                value={Object.keys(stats.by_type).length}
                icon="🏷️"
                color="from-purple-500 to-purple-600"
              />
            </div>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="new_release">New Releases</option>
                <option value="watchlist_update">Watchlist Updates</option>
                <option value="recommendation">Recommendations</option>
                <option value="subscription_update">Subscription</option>
                <option value="payment_reminder">Payments</option>
                <option value="account_security">Security</option>
                <option value="promotional">Promotional</option>
                <option value="system_announcement">Announcements</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Unread Toggle */}
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  unreadOnly
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Unread Only
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={data?.unread_count === 0}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear all notifications?')) {
                    clearAll.mutate();
                  }
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Bulk Selection Actions */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedIds.size} notification(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMarkRead}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : data?.notifications.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No notifications found</h3>
            <p className="text-gray-400 mb-6">
              {unreadOnly
                ? "You're all caught up! No unread notifications."
                : 'Notifications will appear here when you have updates.'}
            </p>
            {unreadOnly && (
              <button
                onClick={() => setUnreadOnly(false)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Show All Notifications
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data?.notifications.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
                />
                Select all on this page
              </label>
            </div>

            <div className="space-y-3">
              {data?.notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedIds.has(notification.id)}
                  onToggleSelect={() => handleToggleSelect(notification.id)}
                  onMarkRead={() => markAsRead.mutate(notification.id)}
                  onDelete={() => deleteNotification.mutate(notification.id)}
                  onPin={() =>
                    notification.is_pinned
                      ? unpinNotification.mutate(notification.id)
                      : pinNotification.mutate(notification.id)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.has_more && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg">
                  Page {page + 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.has_more}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function NotificationCard({
  notification,
  isSelected,
  onToggleSelect,
  onMarkRead,
  onDelete,
  onPin,
}: NotificationCardProps) {
  const getNotificationIcon = () => {
    const iconClass = 'h-6 w-6';
    switch (notification.type) {
      case 'new_release':
        return <span className="text-2xl">🎬</span>;
      case 'watchlist_update':
        return <span className="text-2xl">📺</span>;
      case 'recommendation':
        return <span className="text-2xl">✨</span>;
      case 'subscription_update':
        return <span className="text-2xl">💳</span>;
      case 'payment_reminder':
        return <span className="text-2xl">💰</span>;
      case 'account_security':
        return <span className="text-2xl">🔒</span>;
      case 'promotional':
        return <span className="text-2xl">🎁</span>;
      case 'system_announcement':
        return <span className="text-2xl">📢</span>;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-500/5';
      case 'high':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      default:
        return 'border-l-gray-700';
    }
  };

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200 border-l-4 ${getPriorityColor()} ${
        !notification.is_read ? 'shadow-lg shadow-red-500/10' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
        />

        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                {!notification.is_read && (
                  <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
                {notification.is_pinned && (
                  <Pin className="h-4 w-4 text-yellow-400" />
                )}
              </div>

              <p className="text-gray-400 mb-3">{notification.message}</p>

              {notification.summary && (
                <p className="text-sm text-gray-500 mb-3">{notification.summary}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    notification.priority === 'urgent'
                      ? 'bg-red-500/20 text-red-400'
                      : notification.priority === 'high'
                      ? 'bg-orange-500/20 text-orange-400'
                      : notification.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {notification.priority}
                </span>

                {notification.action_url && (
                  <a
                    href={notification.action_url}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                  >
                    {notification.action_label || 'View Details'}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {!notification.is_read && (
                <button
                  onClick={onMarkRead}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-green-400 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Check className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={onPin}
                className={`p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ${
                  notification.is_pinned ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                }`}
                title={notification.is_pinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="h-5 w-5" />
              </button>

              <button
                onClick={onDelete}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-5 w-5 bg-gray-800 rounded"></div>
        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6 mb-4"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-800 rounded w-24"></div>
            <div className="h-3 bg-gray-800 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
