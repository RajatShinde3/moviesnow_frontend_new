/**
 * =============================================================================
 * ProfileEditor Component
 * =============================================================================
 * Create and edit profiles with avatar selection
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Check, Baby } from 'lucide-react';
import {
  useProfile,
  useCreateProfile,
  useUpdateProfile,
  useAvatars,
  useUploadAvatar,
} from '@/lib/api/hooks/useProfiles';
import { CreateProfileData, Avatar } from '@/lib/api/services/profiles';

interface ProfileEditorProps {
  profileId?: string; // If provided, edit mode. Otherwise, create mode
}

const AVATAR_CATEGORIES = ['default', 'kids', 'anime', 'movies', 'premium'];
const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'];

export default function ProfileEditor({ profileId }: ProfileEditorProps) {
  const router = useRouter();
  const isEditMode = !!profileId;

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isKidsProfile, setIsKidsProfile] = useState(false);
  const [language, setLanguage] = useState('en');
  const [contentRating, setContentRating] = useState('R');
  const [selectedCategory, setSelectedCategory] = useState('default');

  const { data: profileData } = useProfile(profileId || '', { enabled: isEditMode });
  const { data: avatarsData } = useAvatars(selectedCategory);
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile(profileId || '');
  const uploadAvatar = useUploadAvatar(profileId || '');

  const avatars = avatarsData?.avatars || [];

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && profileData) {
      setName(profileData.name);
      setSelectedAvatar(profileData.avatar_url || null);
      setIsKidsProfile(profileData.is_kids_profile);
      setLanguage(profileData.language_preference || 'en');
      setContentRating(profileData.content_rating_max || 'R');
    }
  }, [isEditMode, profileData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const data: CreateProfileData = {
      name: name.trim(),
      avatar_url: selectedAvatar || undefined,
      is_kids_profile: isKidsProfile,
      language_preference: language,
      content_rating_max: contentRating,
    };

    if (isEditMode) {
      updateProfile.mutate(data, {
        onSuccess: () => {
          router.push('/profiles');
        },
      });
    } else {
      createProfile.mutate(data, {
        onSuccess: () => {
          router.push('/profiles');
        },
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (isEditMode) {
      uploadAvatar.mutate(file, {
        onSuccess: (data) => {
          setSelectedAvatar(data.avatar_url);
        },
      });
    }
  };

  const isPending = createProfile.isPending || updateProfile.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-4xl font-bold text-white">
            {isEditMode ? 'Edit Profile' : 'Create Profile'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-4">
              Choose Avatar
            </label>

            {/* Current Avatar */}
            <div className="mb-6">
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 rounded-xl overflow-hidden border-4 border-purple-500">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Selected avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {name.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Custom Avatar */}
                {isEditMode && (
                  <div>
                    <label className="cursor-pointer px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Custom
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max 2MB, PNG/JPG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Categories */}
            <div className="flex gap-2 mb-4">
              {AVATAR_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-6 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-110 ${
                    selectedAvatar === avatar.url
                      ? 'border-purple-500'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="h-full w-full object-cover"
                  />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="p-1 bg-purple-500 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter profile name"
              maxLength={20}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/20 characters</p>
          </div>

          {/* Kids Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Baby className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Kids Profile</p>
                <p className="text-sm text-gray-400">
                  Only show age-appropriate content
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKidsProfile(!isKidsProfile)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isKidsProfile ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full transition-transform ${
                  isKidsProfile ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Language Preference
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Content Rating */}
          {!isKidsProfile && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Maximum Content Rating
              </label>
              <div className="grid grid-cols-5 gap-3">
                {CONTENT_RATINGS.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setContentRating(rating)}
                    className={`px-4 py-3 rounded-lg font-bold transition-all ${
                      contentRating === rating
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
