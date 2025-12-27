/**
 * =============================================================================
 * useNotifications Hooks
 * =============================================================================
 * React Query hooks for notification management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationsService,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
} from '../services/notifications';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: any) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification List & Details
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch notifications list with filtering
 */
export function useNotifications(options?: {
  unread_only?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: notificationKeys.list(options),
    queryFn: () => notificationsService.listNotifications(options),
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - notifications are time-sensitive
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

/**
 * Hook to fetch unread notifications count (for badge)
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.list({ unread_only: true, limit: 1 }),
    queryFn: async () => {
      const data = await notificationsService.listNotifications({
        unread_only: true,
        limit: 1,
      });
      return data.unread_count;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh badge every minute
  });
}

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationsService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single notification
 */
export function useNotification(notificationId: string) {
  return useQuery({
    queryKey: notificationKeys.detail(notificationId),
    queryFn: () => notificationsService.getNotification(notificationId),
    enabled: !!notificationId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark Read/Unread
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Optimistic update: mark as read immediately in UI
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      const previousData = queryClient.getQueryData(notificationKeys.lists());

      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old?.notifications) return old;
        return {
          ...old,
          notifications: old.notifications.map((n: any) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unread_count: Math.max(0, old.unread_count - 1),
        };
      });

      return { previousData };
    },
    onError: (_error, _notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.lists(), context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds?: string[]) =>
      notificationsService.markAllAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to mark notifications as read');
    },
  });
}

/**
 * Hook to mark a notification as unread
 */
export function useMarkAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsUnread(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to mark as unread');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Pin/Delete/Clear
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to pin a notification
 */
export function usePinNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.pinNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('Notification pinned');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to pin notification');
    },
  });
}

/**
 * Hook to unpin a notification
 */
export function useUnpinNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.unpinNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('Notification unpinned');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to unpin notification');
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete notification');
    },
  });
}

/**
 * Hook to clear all notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications cleared');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to clear notifications');
    },
  });
}

/**
 * Hook to track notification click
 */
export function useTrackNotificationClick() {
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.trackClick(notificationId),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preferences
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsService.getPreferences(),
    staleTime: 10 * 60 * 1000, // 10 minutes - preferences don't change often
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      notificationsService.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success('Preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update preferences');
    },
  });
}

/**
 * Hook to quick toggle a notification type
 */
export function useQuickToggleNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationType,
      channel,
      enabled,
    }: {
      notificationType: string;
      channel: string;
      enabled: boolean;
    }) => notificationsService.quickToggle(notificationType, channel, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to toggle notification');
    },
  });
}

/**
 * Hook to reset preferences to defaults
 */
export function useResetNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.resetPreferences(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success('Preferences reset to defaults');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reset preferences');
    },
  });
}

/**
 * Hook to mute notifications temporarily
 */
export function useMuteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hours: number) => notificationsService.muteTemporarily(hours),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to mute notifications');
    },
  });
}

/**
 * Hook to unmute notifications
 */
export function useUnmuteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.unmute(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to unmute notifications');
    },
  });
}
