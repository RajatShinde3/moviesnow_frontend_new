/**
 * =============================================================================
 * ProfileSelector Component
 * =============================================================================
 * Netflix-style profile selection with create/edit options
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Baby } from 'lucide-react';
import { useProfiles, useSwitchProfile, useDeleteProfile } from '@/lib/api/hooks/useProfiles';
import { Profile } from '@/lib/api/services/profiles';

interface ProfileSelectorProps {
  onProfileSelect?: (profileId: string) => void;
  showManagement?: boolean;
}

export default function ProfileSelector({
  onProfileSelect,
  showManagement = true,
}: ProfileSelectorProps) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  const { data, isLoading } = useProfiles();
  const switchProfile = useSwitchProfile();
  const deleteProfile = useDeleteProfile();

  const profiles = data?.profiles || [];

  const handleSelectProfile = (profileId: string) => {
    switchProfile.mutate(profileId, {
      onSuccess: () => {
        if (onProfileSelect) {
          onProfileSelect(profileId);
        } else {
          router.push('/home');
        }
      },
    });
  };

  const handleDeleteProfile = (profileId: string, profileName: string) => {
    if (window.confirm(`Delete profile "${profileName}"? This action cannot be undone.`)) {
      deleteProfile.mutate(profileId);
    }
  };

  if (isLoading) {
    return <ProfileSelectorSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Who's watching?</h1>
          <p className="text-gray-400 text-lg">Select a profile to continue</p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              editMode={editMode}
              onSelect={() => handleSelectProfile(profile.id)}
              onEdit={() => router.push(`/profiles/edit/${profile.id}`)}
              onDelete={() => handleDeleteProfile(profile.id, profile.name)}
              isSelecting={switchProfile.isPending}
            />
          ))}

          {/* Add Profile Card */}
          {profiles.length < 5 && (
            <button
              onClick={() => router.push('/profiles/create')}
              className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-transparent border-2 border-gray-700 hover:border-white transition-all transform hover:scale-105"
            >
              <div className="h-32 w-32 rounded-xl bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <Plus className="h-16 w-16 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium transition-colors">
                Add Profile
              </span>
            </button>
          )}
        </div>

        {/* Manage Profiles Button */}
        {showManagement && profiles.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-8 py-3 border-2 border-gray-600 hover:border-white text-gray-400 hover:text-white rounded-lg font-medium transition-all"
            >
              {editMode ? 'Done' : 'Manage Profiles'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: Profile;
  editMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelecting: boolean;
}

function ProfileCard({
  profile,
  editMode,
  onSelect,
  onEdit,
  onDelete,
  isSelecting,
}: ProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={editMode ? onEdit : onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isSelecting}
        className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Avatar */}
        <div
          className={`h-32 w-32 rounded-xl overflow-hidden border-4 transition-all ${
            isHovered && !editMode
              ? 'border-white scale-110'
              : 'border-transparent'
          }`}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Kids Badge */}
          {profile.is_kids_profile && (
            <div className="absolute top-2 right-2 p-1.5 bg-yellow-500 rounded-full">
              <Baby className="h-4 w-4 text-white" />
            </div>
          )}

          {/* Edit Mode Overlay */}
          {editMode && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
              >
                <Trash2 className="h-5 w-5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </button>

      {/* Profile Name */}
      <span
        className={`text-center font-medium transition-colors ${
          isHovered && !editMode ? 'text-white' : 'text-gray-400'
        }`}
      >
        {profile.name}
      </span>
    </div>
  );
}

function ProfileSelectorSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 w-64 bg-gray-800 rounded mx-auto mb-4" />
          <div className="h-6 w-48 bg-gray-800 rounded mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
              <div className="h-32 w-32 bg-gray-800 rounded-xl" />
              <div className="h-4 w-20 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
