// components/ProfileSelectorModal.tsx
/**
 * =============================================================================
 * Netflix-Style Profile Selector Modal - "Who's Watching?"
 * =============================================================================
 * Features:
 * - Full-screen modal overlay
 * - Large avatar cards for each profile
 * - Add profile option
 * - Kids profile badges
 * - Smooth animations
 * - Profile management link
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Plus, Settings, User } from "lucide-react";
import { api } from "@/lib/api/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  is_kids: boolean;
  is_active: boolean;
}

interface ProfileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSelect?: (profileId: string) => void;
}

export function ProfileSelectorModal({
  isOpen,
  onClose,
  onProfileSelect,
}: ProfileSelectorModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => api.profiles.list(),
    enabled: isOpen,
  });

  // Switch profile mutation
  const switchProfile = useMutation({
    mutationFn: (profileId: string) => api.profiles.switch(profileId),
    onSuccess: (_, profileId) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      onProfileSelect?.(profileId);
      onClose();
      // Refresh the page to load new profile data
      router.refresh();
    },
  });

  const handleProfileSelect = (profileId: string) => {
    switchProfile.mutate(profileId);
  };

  const handleAddProfile = () => {
    router.push("/profiles/new");
    onClose();
  };

  const handleManageProfiles = () => {
    router.push("/profiles");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Content */}
      <div className="w-full max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-medium text-white md:text-6xl">
            Who&apos;s watching?
          </h1>
        </div>

        {/* Profile Grid */}
        {isLoading ? (
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        ) : (
          <>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
              {/* Existing Profiles */}
              {profiles?.map((profile, index) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  disabled={switchProfile.isPending}
                  className="group relative flex flex-col items-center gap-3 transition-transform hover:scale-105 disabled:opacity-50"
                  style={{
                    animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Avatar Container */}
                  <div className="relative">
                    {/* Avatar */}
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="h-32 w-32 rounded-md border-4 border-transparent object-cover transition-all group-hover:border-white md:h-40 md:w-40"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-md border-4 border-transparent bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white transition-all group-hover:border-white md:h-40 md:w-40 md:text-5xl">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Kids Badge */}
                    {profile.is_kids && (
                      <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                        KIDS
                      </div>
                    )}

                    {/* Active Badge */}
                    {profile.is_active && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                        Active
                      </div>
                    )}
                  </div>

                  {/* Profile Name */}
                  <span className="text-center text-base font-medium text-gray-400 transition-colors group-hover:text-white md:text-lg">
                    {profile.name}
                  </span>
                </button>
              ))}

              {/* Add Profile Button */}
              {(!profiles || profiles.length < 5) && (
                <button
                  onClick={handleAddProfile}
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
                  style={{
                    animation: `fadeIn 0.4s ease-out ${
                      (profiles?.length || 0) * 0.1
                    }s both`,
                  }}
                >
                  {/* Add Icon */}
                  <div className="flex h-32 w-32 items-center justify-center rounded-md border-4 border-transparent bg-white/10 transition-all group-hover:border-white md:h-40 md:w-40">
                    <Plus className="h-16 w-16 text-gray-400 transition-colors group-hover:text-white md:h-20 md:w-20" />
                  </div>

                  {/* Label */}
                  <span className="text-center text-base font-medium text-gray-400 transition-colors group-hover:text-white md:text-lg">
                    Add Profile
                  </span>
                </button>
              )}
            </div>

            {/* Manage Profiles Button */}
            <div className="mt-16 flex justify-center">
              <button
                onClick={handleManageProfiles}
                className="flex items-center gap-2 rounded-md border-2 border-gray-500 px-6 py-2.5 text-lg font-medium text-gray-400 transition-all hover:border-white hover:text-white"
              >
                <Settings className="h-5 w-5" />
                Manage Profiles
              </button>
            </div>
          </>
        )}
      </div>

      {/* Close Button (Optional - for when shown as overlay) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * =============================================================================
 * Profile Selector Page - Full-Screen Version
 * =============================================================================
 * Use this for the dedicated /profiles/select route
 */

export function ProfileSelectorPage() {
  const router = useRouter();

  const handleProfileSelect = (profileId: string) => {
    // Navigate to home after profile selection
    router.push("/home");
  };

  return (
    <ProfileSelectorModal
      isOpen={true}
      onClose={() => router.push("/home")}
      onProfileSelect={handleProfileSelect}
    />
  );
}

/**
 * =============================================================================
 * Hook for Profile Switching
 * =============================================================================
 */

export function useProfileSelector() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openSelector = () => setIsOpen(true);
  const closeSelector = () => setIsOpen(false);

  return {
    isOpen,
    openSelector,
    closeSelector,
    ProfileSelector: () => (
      <ProfileSelectorModal
        isOpen={isOpen}
        onClose={closeSelector}
      />
    ),
  };
}
