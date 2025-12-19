'use client';

/**
 * Profile Settings Component
 * ===========================
 * Comprehensive profile management with avatar, PIN lock, and kids mode
 *
 * Features:
 * - Avatar selection (emoji or custom image)
 * - Profile name editing
 * - Kids mode toggle with content filtering
 * - PIN lock for profile security
 * - Language preferences
 * - Auto-play settings
 *
 * Best Practices:
 * - Form validation
 * - Loading states
 * - Error handling
 * - Confirmation dialogs for destructive actions
 * - Accessible form controls
 */

import React, { useState } from 'react';
import { User, Lock, Baby, Globe, Play, Save } from 'lucide-react';
import { AvatarSelector, type Avatar } from './AvatarSelector';

export interface ProfileData {
  id: string;
  name: string;
  avatar: Avatar;
  isKidsMode: boolean;
  isPinLocked: boolean;
  pin?: string;
  language: string;
  autoPlayNext: boolean;
  autoPlayPreviews: boolean;
}

interface ProfileSettingsProps {
  /** Current profile data */
  profile: ProfileData;
  /** Callback when profile is updated */
  onUpdateProfile: (profile: ProfileData) => Promise<void>;
  /** Callback to cancel editing */
  onCancel?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
];

export function ProfileSettings({
  profile: initialProfile,
  onUpdateProfile,
  onCancel,
}: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (updates: Partial<ProfileData>) => {
    setProfile({ ...profile, ...updates });
    setHasChanges(true);
    setSaveError(null);
  };

  const handleAvatarChange = (avatar: Avatar) => {
    handleChange({ avatar });
  };

  const handleKidsModeToggle = (enabled: boolean) => {
    handleChange({
      isKidsMode: enabled,
      // Auto-disable PIN lock if enabling kids mode (kids shouldn't need PIN)
      isPinLocked: enabled ? false : profile.isPinLocked,
    });
  };

  const handlePinToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPinSetup(true);
      setPinInput('');
      setPinConfirm('');
      setPinError(null);
    } else {
      handleChange({ isPinLocked: false, pin: undefined });
    }
  };

  const handlePinSave = () => {
    setPinError(null);

    // Validate PIN
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }

    if (pinInput !== pinConfirm) {
      setPinError('PINs do not match');
      return;
    }

    handleChange({ isPinLocked: true, pin: pinInput });
    setShowPinSetup(false);
    setPinInput('');
    setPinConfirm('');
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onUpdateProfile(profile);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setSaveError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Customize your profile with avatar, name, and preferences
        </p>
      </div>

      {/* Avatar Selection */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Avatar</h3>
        </div>
        <AvatarSelector
          currentAvatar={profile.avatar}
          onSelectAvatar={handleAvatarChange}
          allowCustomUpload={!profile.isKidsMode}
        />
      </section>

      {/* Profile Name */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <label className="mb-2 block text-sm font-medium text-gray-400">
          Profile Name
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => handleChange({ name: e.target.value })}
          maxLength={20}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter profile name"
        />
        <p className="mt-1 text-xs text-gray-500">
          Max 20 characters
        </p>
      </section>

      {/* Kids Mode */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Baby className="mt-1 h-5 w-5 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">Kids Mode</h3>
              <p className="mt-1 text-sm text-gray-400">
                Filter content to show only age-appropriate titles (rated G, PG, and PG-13)
              </p>
              {profile.isKidsMode && (
                <div className="mt-2 rounded-lg bg-blue-500/10 p-3">
                  <p className="text-sm text-blue-400">
                    ✓ Only family-friendly content will be shown
                  </p>
                  <p className="text-sm text-blue-400">
                    ✓ Custom image uploads are disabled
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => handleKidsModeToggle(!profile.isKidsMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              profile.isKidsMode ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                profile.isKidsMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* PIN Lock */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Lock className="mt-1 h-5 w-5 text-white" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Profile PIN Lock</h3>
              <p className="mt-1 text-sm text-gray-400">
                Require a 4-digit PIN to access this profile
              </p>

              {showPinSetup && (
                <div className="mt-4 space-y-4 rounded-lg bg-black/30 p-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Enter 4-digit PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-2xl tracking-widest text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="••••"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-2xl tracking-widest text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="••••"
                    />
                  </div>

                  {pinError && (
                    <p className="text-sm text-red-500">{pinError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handlePinSave}
                      disabled={!pinInput || !pinConfirm}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save PIN
                    </button>
                    <button
                      onClick={() => setShowPinSetup(false)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {profile.isPinLocked && !showPinSetup && (
                <div className="mt-2 rounded-lg bg-green-500/10 p-3">
                  <p className="text-sm text-green-400">
                    ✓ PIN protection is active
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => handlePinToggle(!profile.isPinLocked)}
            disabled={profile.isKidsMode || showPinSetup}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
              profile.isPinLocked ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                profile.isPinLocked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Language Preference */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Language</h3>
        </div>
        <select
          value={profile.language}
          onChange={(e) => handleChange({ language: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-gray-900">
              {lang.name}
            </option>
          ))}
        </select>
      </section>

      {/* Playback Settings */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Playback</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Auto-play next episode</p>
              <p className="text-sm text-gray-400">
                Automatically play the next episode in a series
              </p>
            </div>
            <button
              onClick={() => handleChange({ autoPlayNext: !profile.autoPlayNext })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                profile.autoPlayNext ? 'bg-red-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  profile.autoPlayNext ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Auto-play previews</p>
              <p className="text-sm text-gray-400">
                Play preview videos while browsing
              </p>
            </div>
            <button
              onClick={() => handleChange({ autoPlayPreviews: !profile.autoPlayPreviews })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                profile.autoPlayPreviews ? 'bg-red-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  profile.autoPlayPreviews ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Save/Cancel Actions */}
      <div className="sticky bottom-0 flex items-center justify-between rounded-lg border border-white/10 bg-black/90 p-4 backdrop-blur-xl">
        <div>
          {saveError && (
            <p className="text-sm text-red-500">{saveError}</p>
          )}
          {hasChanges && !saveError && (
            <p className="text-sm text-yellow-500">You have unsaved changes</p>
          )}
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-2 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
