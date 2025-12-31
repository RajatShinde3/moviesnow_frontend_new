'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/services';

// Custom SVG Icons
const UserIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CalendarIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowLeftIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const InfoIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CheckCircleIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const EditIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CameraIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Mock data
  const MOCK_PROFILE: UserProfile = {
    user_id: 'mock-user-id',
    email: 'user@example.com',
    full_name: 'John Doe',
    username: 'johndoe',
    bio: 'Movie enthusiast and binge-watcher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Fetch profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_PROFILE;
    },
  });

  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...profileData, ...updates } as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
      setHasChanges(false);
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (profile) {
      saveMutation.mutate({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
      });
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setProfile(profileData);
      setHasChanges(false);
      setIsEditing(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-[#1A1A1A]"></div>
            <div className="h-12 w-12 rounded-full border-4 border-[#2A2A2A] border-t-[#CECECE] animate-spin absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] relative overflow-hidden">
      {/* Animated background blur orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#151515] to-[#0A0A0A] rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Back link */}
        <a
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200 mb-8 group"
        >
          <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Settings
        </a>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#222222] to-[#181818] p-4 border border-[#2F2F2F] shadow-2xl">
              <UserIcon size={32} className="text-[#F0F0F0]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#F0F0F0] tracking-tight">Profile Settings</h1>
              <p className="text-base text-[#999999] mt-2 max-w-2xl">
                Manage your personal information and profile details
              </p>
            </div>
          </div>
        </div>

        {/* Profile Avatar Section */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <CameraIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Profile Picture</h2>
              <p className="text-sm text-[#888888] mt-1">Upload or change your profile picture</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-[#1C1C1C] border-2 border-[#3A3A3A] flex items-center justify-center shadow-lg overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-[#666666]" />
                )}
              </div>
              <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center">
                <CameraIcon size={24} className="text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#D0D0D0] mb-4">
                Choose an image up to 5MB. Recommended size: 400x400px
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => toast.info('Upload feature coming soon')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] shadow-lg transition-all duration-300"
                >
                  Upload Photo
                </button>
                <button
                  onClick={() => toast.info('Remove feature coming soon')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#2A2A2A] text-[#D0D0D0] text-sm font-semibold hover:from-[#242424] hover:to-[#1F1F1F] hover:border-[#353535] transition-all duration-300 shadow-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#222222]">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
                <UserIcon size={24} className="text-[#888888]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F0F0F0]">Personal Information</h2>
                <p className="text-sm text-[#888888] mt-1">Update your personal details</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <EditIcon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full-name" className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                value={profile.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                disabled={!isEditing}
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={!isEditing}
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your username"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                Bio
              </label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#2A2A2A] text-[#D0D0D0] text-sm font-semibold hover:from-[#242424] hover:to-[#1F1F1F] hover:border-[#353535] transition-all duration-300 shadow-xl shadow-black/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saveMutation.isPending}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/50 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {saveMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-[#F0F0F0] border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <InfoIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Account Information</h2>
              <p className="text-sm text-[#888888] mt-1">View your account details</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MailIcon size={16} className="text-[#666666]" />
                <label className="text-sm font-bold text-[#999999] uppercase tracking-wide">
                  Email Address
                </label>
              </div>
              <div className="px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-[#D0D0D0] text-sm">
                {profile.email}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon size={16} className="text-[#666666]" />
                <label className="text-sm font-bold text-[#999999] uppercase tracking-wide">
                  Member Since
                </label>
              </div>
              <div className="px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-[#D0D0D0] text-sm">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* User ID */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon size={16} className="text-[#666666]" />
                <label className="text-sm font-bold text-[#999999] uppercase tracking-wide">
                  User ID
                </label>
              </div>
              <div className="px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-[#666666] text-sm font-mono">
                {profile.user_id}
              </div>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#131313] p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <InfoIcon size={20} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#22C55E] mb-2">Need to Change Your Email?</h3>
              <p className="text-sm text-[#D0D0D0]">
                To change your email address or update other sensitive account settings, please visit the{' '}
                <a href="/settings/account/email" className="text-[#F0F0F0] font-bold hover:underline">
                  Email Settings
                </a>{' '}
                page. For security reasons, email changes require verification.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
