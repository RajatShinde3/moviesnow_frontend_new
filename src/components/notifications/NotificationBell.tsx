/**
 * =============================================================================
 * NotificationBell Component
 * =============================================================================
 * Notification bell icon with unread badge for navigation bar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Pin, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useUnreadCount, useNotifications, useMarkAsRead, useDeleteNotification, usePinNotification } from '@/lib/api/hooks/useNotifications';
import { Notification } from '@/lib/api/services/notifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = useUnreadCount();
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 5,
    enabled: isOpen,
  });

  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const pinNotification = usePinNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }

    if (notification.action_url) {
      setIsOpen(false);
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />

        {/* Unread Badge */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                {unreadCount !== undefined && unreadCount > 0 && (
                  <p className="text-sm text-gray-400">{unreadCount} unread</p>
                )}
              </div>
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-red-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : notificationsData?.notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-600 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notificationsData?.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkRead={() => markAsRead.mutate(notification.id)}
                    onDelete={() => deleteNotification.mutate(notification.id)}
                    onPin={() => pinNotification.mutate(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificationsData && notificationsData.notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 bg-gray-900/50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 px-4 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium"
              >
                See All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function NotificationItem({
  notification,
  onClick,
  onMarkRead,
  onDelete,
  onPin,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = () => {
    const iconClass = 'h-5 w-5';
    switch (notification.type) {
      case 'new_release':
        return <span className={`${iconClass} text-green-400`}>🎬</span>;
      case 'watchlist_update':
        return <span className={`${iconClass} text-blue-400`}>📺</span>;
      case 'recommendation':
        return <span className={`${iconClass} text-purple-400`}>✨</span>;
      case 'subscription_update':
        return <span className={`${iconClass} text-yellow-400`}>💳</span>;
      case 'payment_reminder':
        return <span className={`${iconClass} text-red-400`}>💰</span>;
      case 'account_security':
        return <span className={`${iconClass} text-orange-400`}>🔒</span>;
      case 'promotional':
        return <span className={`${iconClass} text-pink-400`}>🎁</span>;
      case 'system_announcement':
        return <span className={`${iconClass} text-cyan-400`}>📢</span>;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer relative group ${
        !notification.is_read ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white line-clamp-1">
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="flex-shrink-0 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </div>

          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>

            {notification.is_pinned && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}

            {notification.action_label && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {notification.action_label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions (show on hover) */}
      {showActions && (
        <div
          className="absolute top-2 right-2 flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!notification.is_read && (
            <button
              onClick={onMarkRead}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-green-400 transition-colors"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onPin}
            className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-yellow-400 transition-colors"
            title={notification.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
