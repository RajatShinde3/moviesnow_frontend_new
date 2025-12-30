'use client';

/**
 * Change Password Page
 * Professional eye-comfortable design for changing account password
 * - Current and new password fields
 * - Password strength indicator
 * - Secure validation
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import {
  SettingsLayout,
  PageHeader,
  SettingCard,
  Button,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPasswords, setShowPasswords] = React.useState(false);

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      return await fetchJson('/api/v1/auth/password/change', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.push('/settings/security');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { score, label: 'Fair', color: '#F59E0B' };
    if (score <= 4) return { score, label: 'Good', color: '#10B981' };
    return { score, label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const canSubmit = currentPassword && newPassword.length >= 8 && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      passwordMutation.mutate({
        current_password: currentPassword,
        new_password: newPassword,
      });
    }
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="Change Password"
        description="Update your account password"
        icon="key"
      />

      {/* Security Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="shield" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Password Security</h3>
            <p className="text-sm text-[#B0B0B0]">
              Use a strong, unique password with at least 8 characters, including uppercase,
              lowercase, numbers, and special characters.
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <SettingCard
        title="Update Password"
        description="Enter your current and new password"
        icon="lock"
        className="mb-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#F0F0F0] transition-colors"
              >
                <Icon name={showPasswords ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              required
              minLength={8}
              autoComplete="new-password"
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#808080]">Password Strength</span>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-[#3A3A3A] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-[#EF4444] mt-1">Passwords do not match</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-xs text-[#10B981] mt-1">Passwords match</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={passwordMutation.isPending}
            disabled={!canSubmit}
            className="w-full"
          >
            Change Password
          </Button>
        </form>
      </SettingCard>

      {/* Password Tips */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6">
        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-3">Password Tips</h3>
        <ul className="space-y-2 text-xs text-[#B0B0B0]">
          <li className="flex items-start gap-2">
            <Icon name="check" className="text-[#10B981] mt-0.5" size={14} />
            <span>Use at least 8 characters (12+ recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check" className="text-[#10B981] mt-0.5" size={14} />
            <span>Mix uppercase and lowercase letters</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check" className="text-[#10B981] mt-0.5" size={14} />
            <span>Include numbers and special characters</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check" className="text-[#10B981] mt-0.5" size={14} />
            <span>Avoid common words and personal information</span>
          </li>
        </ul>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/settings/security">
          <Button variant="ghost">
            <Icon name="arrow-left" size={16} />
            Back to Security
          </Button>
        </Link>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
