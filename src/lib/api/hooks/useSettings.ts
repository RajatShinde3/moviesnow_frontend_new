/**
 * =============================================================================
 * useSettings Hooks
 * =============================================================================
 * React Query hooks for user settings and preferences
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const settingsKeys = {
  all: ['settings'] as const,
  settings: () => [...settingsKeys.all, 'user-settings'] as const,
  privacy: () => [...settingsKeys.all, 'privacy'] as const,
  devices: () => [...settingsKeys.all, 'devices'] as const,
  activity: (page?: number) => [...settingsKeys.all, 'activity', page] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get user settings
 */
export function useSettings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: settingsKeys.settings(),
    queryFn: () => settingsService.getSettings(),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update settings', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to get privacy settings
 */
export function usePrivacySettings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: settingsKeys.privacy(),
    queryFn: () => settingsService.getPrivacySettings(),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to update privacy settings
 */
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => settingsService.updatePrivacySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.privacy() });
      toast.success('Privacy settings updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update privacy settings', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to get devices
 */
export function useDevices(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: settingsKeys.devices(),
    queryFn: () => settingsService.getDevices(),
    staleTime: 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to remove device
 */
export function useRemoveDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => settingsService.removeDevice(deviceId),
    onMutate: async (deviceId) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.devices() });
      const previous = queryClient.getQueryData(settingsKeys.devices());

      queryClient.setQueryData(settingsKeys.devices(), (old: any) => ({
        ...old,
        devices: old?.devices?.filter((d: any) => d.id !== deviceId) || [],
      }));

      return { previous };
    },
    onError: (error: any, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.devices(), context.previous);
      }
      toast.error('Failed to remove device');
    },
    onSuccess: () => {
      toast.success('Device removed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.devices() });
    },
  });
}

/**
 * Hook to trust device
 */
export function useTrustDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => settingsService.trustDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.devices() });
      toast.success('Device trusted');
    },
    onError: () => {
      toast.error('Failed to trust device');
    },
  });
}

/**
 * Hook to sign out all devices
 */
export function useSignOutAllDevices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.signOutAllDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.devices() });
      toast.success('Signed out from all devices');
    },
    onError: () => {
      toast.error('Failed to sign out from all devices');
    },
  });
}

/**
 * Hook to get activity log
 */
export function useActivityLog(options?: { page?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: settingsKeys.activity(options?.page),
    queryFn: () => settingsService.getActivityLog({ page: options?.page }),
    staleTime: 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      settingsService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to change password', {
        description: error?.message || 'Please check your current password',
      });
    },
  });
}

/**
 * Hook to change email
 */
export function useChangeEmail() {
  return useMutation({
    mutationFn: (data: { new_email: string; password: string }) =>
      settingsService.changeEmail(data),
    onSuccess: () => {
      toast.success('Email changed successfully', {
        description: 'Please verify your new email address',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to change email', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to delete account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => settingsService.deleteAccount(password),
    onSuccess: () => {
      toast.success('Account deleted', {
        description: 'You will be redirected shortly',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: any) => {
      toast.error('Failed to delete account', {
        description: error?.message || 'Please check your password',
      });
    },
  });
}

/**
 * Hook to export data
 */
export function useExportData() {
  return useMutation({
    mutationFn: () => settingsService.exportData(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moviesnow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data exported successfully');
    },
    onError: () => {
      toast.error('Failed to export data');
    },
  });
}
