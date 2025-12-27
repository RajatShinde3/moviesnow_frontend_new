/**
 * =============================================================================
 * useProfiles Hooks
 * =============================================================================
 * React Query hooks for profile management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profilesService, CreateProfileData, UpdateProfileData } from '../services/profiles';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
  preferences: (id: string) => [...profileKeys.all, 'preferences', id] as const,
  avatars: (category?: string) => [...profileKeys.all, 'avatars', category] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to list all profiles
 */
export function useProfiles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: () => profilesService.listProfiles(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to get single profile
 */
export function useProfile(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.detail(profileId),
    queryFn: () => profilesService.getProfile(profileId),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false && !!profileId,
  });
}

/**
 * Hook to create profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileData) => profilesService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      toast.success('Profile created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create profile', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profilesService.updateProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileId) });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to delete profile
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => profilesService.deleteProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      toast.success('Profile deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete profile', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to get profile preferences
 */
export function useProfilePreferences(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.preferences(profileId),
    queryFn: () => profilesService.getPreferences(profileId),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false && !!profileId,
  });
}

/**
 * Hook to update profile preferences
 */
export function useUpdatePreferences(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => profilesService.updatePreferences(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences(profileId) });
      toast.success('Preferences updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update preferences', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to get available avatars
 */
export function useAvatars(category?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.avatars(category),
    queryFn: () => profilesService.getAvatars(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profilesService.uploadAvatar(profileId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      toast.success('Avatar uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload avatar', {
        description: error?.message || 'Please check file size and format',
      });
    },
  });
}

/**
 * Hook to switch active profile
 */
export function useSwitchProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => profilesService.switchProfile(profileId),
    onSuccess: () => {
      // Invalidate all queries to refresh with new profile context
      queryClient.invalidateQueries();
      toast.success('Profile switched');
    },
    onError: (error: any) => {
      toast.error('Failed to switch profile', {
        description: error?.message || 'Please try again',
      });
    },
  });
}
