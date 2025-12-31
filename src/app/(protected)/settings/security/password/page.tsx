'use client';

/**
 * Change Password Page - Professional Dark Theme
 * Premium design for changing account password
 * - Current and new password fields
 * - Password strength indicator
 * - Secure validation with real-time feedback
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';

// ══════════════════════════════════════════════════════════════════════════════
// Custom SVG Icons
// ══════════════════════════════════════════════════════════════════════════════

const KeyIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const ShieldIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      return await fetchJson('/auth/password/change', {
        method: 'POST',
        json: data,
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
    if (score <= 4) return { score, label: 'Good', color: '#22C55E' };
    return { score, label: 'Strong', color: '#22C55E' };
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
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] text-[#E5E5E5] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-6 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-[#252525] via-[#1C1C1C] to-[#161616] p-5 border border-[#2F2F2F] shadow-2xl shadow-black/60 backdrop-blur-sm">
            <KeyIcon className="text-[#999999]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2 tracking-tight bg-gradient-to-r from-[#F5F5F5] to-[#D0D0D0] bg-clip-text text-transparent">
              Change Password
            </h1>
            <p className="text-sm text-[#999999] leading-relaxed max-w-2xl">
              Update your account password to keep your account secure
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-start gap-5">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3.5 border border-[#2F2F2F] shadow-lg">
              <ShieldIcon className="text-[#888888]" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-2.5 tracking-tight">Password Security</h3>
              <p className="text-sm text-[#999999] leading-relaxed max-w-3xl">
                Use a strong, unique password with at least 8 characters, including uppercase,
                lowercase, numbers, and special characters. Avoid using common words or personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1A1A1A]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-center gap-4 mb-7">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <LockIcon className="text-[#888888]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Update Password</h2>
              <p className="text-sm text-[#888888] mt-1">
                Enter your current and new password below
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-bold text-[#F0F0F0] mb-2.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg pr-12"
                  placeholder="Enter your current password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                  {showCurrentPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-bold text-[#F0F0F0] mb-2.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg pr-12"
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                  {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">
                      Password Strength
                    </span>
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#252525]">
                    <div
                      className="h-full transition-all duration-500 ease-out"
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
              <label htmlFor="confirm-password" className="block text-sm font-bold text-[#F0F0F0] mb-2.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg pr-12"
                  placeholder="Confirm your new password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-[#EF4444] mt-2 font-semibold">Passwords do not match</p>
              )}
              {confirmPassword && passwordsMatch && (
                <div className="flex items-center gap-1.5 text-xs text-[#22C55E] mt-2 font-semibold">
                  <CheckIcon size={14} />
                  Passwords match
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!canSubmit || passwordMutation.isPending}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/50 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {passwordMutation.isPending ? 'Changing Password...' : 'Change Password'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </button>
            </div>
          </form>
        </div>

        {/* Password Tips */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#1F1F1F]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <h3 className="text-base font-bold text-[#F0F0F0] mb-4 tracking-tight">Password Security Tips</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 p-1 mt-0.5">
                <CheckIcon className="text-[#22C55E]" size={12} />
              </div>
              <span className="text-sm text-[#D0D0D0] leading-relaxed flex-1">
                Use at least 8 characters (12+ recommended for maximum security)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 p-1 mt-0.5">
                <CheckIcon className="text-[#22C55E]" size={12} />
              </div>
              <span className="text-sm text-[#D0D0D0] leading-relaxed flex-1">
                Mix uppercase and lowercase letters for complexity
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 p-1 mt-0.5">
                <CheckIcon className="text-[#22C55E]" size={12} />
              </div>
              <span className="text-sm text-[#D0D0D0] leading-relaxed flex-1">
                Include numbers and special characters (!@#$%^&*)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 p-1 mt-0.5">
                <CheckIcon className="text-[#22C55E]" size={12} />
              </div>
              <span className="text-sm text-[#D0D0D0] leading-relaxed flex-1">
                Avoid common words, personal information, and easily guessable patterns
              </span>
            </li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/settings/security"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] via-[#1A1A1A] to-[#161616] border border-[#2A2A2A] text-[#E0E0E0] text-sm font-bold hover:from-[#252525] hover:via-[#202020] hover:to-[#1C1C1C] hover:border-[#353535] hover:text-[#F0F0F0] transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-black/60 group"
          >
            <ArrowLeftIcon className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Security
          </Link>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
