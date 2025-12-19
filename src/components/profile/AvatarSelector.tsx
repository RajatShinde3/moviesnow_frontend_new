'use client';

/**
 * Avatar Selector Component
 * =========================
 * Allows users to select custom avatars for their profiles
 *
 * Features:
 * - Preset avatar collection (emojis and icons)
 * - Custom image upload support
 * - Avatar preview
 * - Grid layout with hover effects
 * - Accessible keyboard navigation
 * - File validation (size, type)
 *
 * Best Practices:
 * - Image optimization before upload
 * - File size limits (max 2MB)
 * - Supported formats: JPG, PNG, GIF, WebP
 * - Avatar cropping to square aspect ratio
 */

import React, { useState, useRef } from 'react';
import { User, Upload, Check, Camera } from 'lucide-react';

export interface Avatar {
  id: string;
  type: 'emoji' | 'icon' | 'custom';
  value: string; // emoji character, icon name, or image URL
  label?: string;
}

interface AvatarSelectorProps {
  /** Currently selected avatar */
  currentAvatar?: Avatar;
  /** Callback when avatar is selected */
  onSelectAvatar: (avatar: Avatar) => void;
  /** Whether to show custom upload option */
  allowCustomUpload?: boolean;
  /** Maximum file size in bytes (default: 2MB) */
  maxFileSize?: number;
}

// Preset emoji avatars
const EMOJI_AVATARS: Avatar[] = [
  { id: 'emoji-1', type: 'emoji', value: '😀', label: 'Happy' },
  { id: 'emoji-2', type: 'emoji', value: '😎', label: 'Cool' },
  { id: 'emoji-3', type: 'emoji', value: '🤓', label: 'Nerdy' },
  { id: 'emoji-4', type: 'emoji', value: '😇', label: 'Angel' },
  { id: 'emoji-5', type: 'emoji', value: '🥳', label: 'Party' },
  { id: 'emoji-6', type: 'emoji', value: '😴', label: 'Sleepy' },
  { id: 'emoji-7', type: 'emoji', value: '🤩', label: 'Starstruck' },
  { id: 'emoji-8', type: 'emoji', value: '🥸', label: 'Disguise' },
  { id: 'emoji-9', type: 'emoji', value: '👻', label: 'Ghost' },
  { id: 'emoji-10', type: 'emoji', value: '👽', label: 'Alien' },
  { id: 'emoji-11', type: 'emoji', value: '🤖', label: 'Robot' },
  { id: 'emoji-12', type: 'emoji', value: '🎃', label: 'Pumpkin' },
  { id: 'emoji-13', type: 'emoji', value: '🐶', label: 'Dog' },
  { id: 'emoji-14', type: 'emoji', value: '🐱', label: 'Cat' },
  { id: 'emoji-15', type: 'emoji', value: '🐼', label: 'Panda' },
  { id: 'emoji-16', type: 'emoji', value: '🦊', label: 'Fox' },
  { id: 'emoji-17', type: 'emoji', value: '🦁', label: 'Lion' },
  { id: 'emoji-18', type: 'emoji', value: '🐯', label: 'Tiger' },
  { id: 'emoji-19', type: 'emoji', value: '🐸', label: 'Frog' },
  { id: 'emoji-20', type: 'emoji', value: '🐵', label: 'Monkey' },
  { id: 'emoji-21', type: 'emoji', value: '🦄', label: 'Unicorn' },
  { id: 'emoji-22', type: 'emoji', value: '🦖', label: 'Dinosaur' },
  { id: 'emoji-23', type: 'emoji', value: '🦀', label: 'Crab' },
  { id: 'emoji-24', type: 'emoji', value: '🐙', label: 'Octopus' },
];

const DEFAULT_AVATAR: Avatar = {
  id: 'default',
  type: 'icon',
  value: 'user',
  label: 'Default',
};

export function AvatarSelector({
  currentAvatar = DEFAULT_AVATAR,
  onSelectAvatar,
  allowCustomUpload = true,
  maxFileSize = 2 * 1024 * 1024, // 2MB
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(currentAvatar);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    onSelectAvatar(avatar);
    setUploadError(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError(`File size must be less than ${maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);

      // In production, upload to S3 and get URL
      // For now, use the local preview
      const customAvatar: Avatar = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        value: previewUrl,
        label: file.name,
      };

      handleSelectAvatar(customAvatar);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderAvatar = (avatar: Avatar, size: 'small' | 'large' = 'small') => {
    const sizeClasses = size === 'large' ? 'h-24 w-24 text-5xl' : 'h-16 w-16 text-3xl';

    if (avatar.type === 'emoji') {
      return (
        <div className={`flex items-center justify-center ${sizeClasses}`}>
          {avatar.value}
        </div>
      );
    } else if (avatar.type === 'custom') {
      return (
        <img
          src={avatar.value}
          alt={avatar.label || 'Avatar'}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    } else {
      return (
        <div className={`flex items-center justify-center ${sizeClasses} rounded-full bg-gray-700`}>
          <User className="h-8 w-8 text-white" />
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Current Selection Preview */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-shrink-0">
          {renderAvatar(selectedAvatar, 'large')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Current Avatar</h3>
          <p className="text-sm text-gray-400">
            {selectedAvatar.label || selectedAvatar.type}
          </p>
        </div>
      </div>

      {/* Preset Avatars Grid */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-400">Choose an avatar</h4>
        <div className="grid grid-cols-6 gap-3">
          {EMOJI_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelectAvatar(avatar)}
              className={`relative flex items-center justify-center rounded-lg border-2 p-2 transition hover:border-red-500 hover:bg-white/5 ${
                selectedAvatar.id === avatar.id
                  ? 'border-red-600 bg-white/10'
                  : 'border-white/10 bg-white/5'
              }`}
              aria-label={avatar.label}
              title={avatar.label}
            >
              {renderAvatar(avatar, 'small')}
              {selectedAvatar.id === avatar.id && (
                <div className="absolute -right-1 -top-1 rounded-full bg-red-600 p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Upload */}
      {allowCustomUpload && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-400">Upload custom image</h4>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-6 text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                <span>Upload Image</span>
              </>
            )}
          </button>

          {uploadError && (
            <p className="mt-2 text-sm text-red-500">{uploadError}</p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            Max file size: {maxFileSize / (1024 * 1024)}MB. Supported: JPG, PNG, GIF, WebP
          </p>
        </div>
      )}
    </div>
  );
}
