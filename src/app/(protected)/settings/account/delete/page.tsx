'use client';

/**
 * Account Delete Page
 * Professional eye-comfortable design for permanently deleting account
 * - Confirmation with typed "DELETE" phrase
 * - OTP verification for security
 * - Clear warning about permanent deletion
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

type Phase = 'intro' | 'otp' | 'done';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>('intro');
  const [confirmText, setConfirmText] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [cooldown, setCooldown] = React.useState(0);

  // Request deletion OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson('/api/v1/auth/account/delete/request-otp', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setPhase('otp');
      setCooldown(60); // 60 second cooldown
      toast.success('Verification code sent to your email');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send verification code');
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async (code: string) => {
      return await fetchJson('/api/v1/auth/account/delete', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: () => {
      setPhase('done');
      toast.success('Account deleted successfully');
      setTimeout(() => {
        window.location.replace('/login');
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid verification code');
      setOtp('');
    },
  });

  // Cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const canSendOtp = !requestOtpMutation.isPending && agree && confirmText.trim().toUpperCase() === 'DELETE';
  const isOtpValid = otp.replace(/\D/g, '').length === 6;
  const canResend = !requestOtpMutation.isPending && cooldown <= 0;

  const handleSendOtp = () => {
    if (canSendOtp) {
      requestOtpMutation.mutate();
    }
  };

  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.replace(/\D/g, '');
    if (code.length === 6) {
      deleteMutation.mutate(code);
    }
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="Delete Account"
        description="This is permanent and cannot be undone. We'll ask you to confirm it's you."
        icon="trash"
      />

      {/* Phase: Intro / Acknowledgement */}
      {phase === 'intro' && (
        <>
          {/* Warning Card */}
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 mb-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#EF4444]/20 p-2.5 border border-[#EF4444]/30">
                <Icon name="alert" className="text-[#EF4444]" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Before you delete</h3>
                <ul className="space-y-1 text-sm text-[#B0B0B0]">
                  <li>• Your account and associated data will be deleted permanently</li>
                  <li>• Active sessions will be revoked. You'll be signed out everywhere</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Form */}
          <SettingCard
            title="Confirm Deletion"
            description="Type DELETE to confirm you want to permanently delete your account"
            icon="lock"
            className="mb-6"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="confirm-text" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm
                </label>
                <input
                  id="confirm-text"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors"
                />
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 rounded border-[#3A3A3A] bg-[#242424] text-[#E5E5E5] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[#F0F0F0]">
                  I understand that deleting my account is permanent and cannot be undone
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="danger"
                  onClick={handleSendOtp}
                  disabled={!canSendOtp}
                >
                  {requestOtpMutation.isPending ? 'Sending code...' : 'Send confirmation code'}
                </Button>
                <Link href="/settings/security">
                  <Button variant="secondary">Cancel</Button>
                </Link>
              </div>
            </div>
          </SettingCard>
        </>
      )}

      {/* Phase: OTP Entry */}
      {phase === 'otp' && (
        <form onSubmit={handleSubmitOtp} noValidate className="mt-8">
          <SettingCard
            title="Enter Verification Code"
            description="We sent a 6-digit code to your account email. Codes expire quickly."
            icon="key"
            className="mb-6"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  6-Digit Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors font-mono text-lg"
                  autoFocus
                />
                <p className="text-xs text-[#808080] mt-1">
                  If it fails, wait for a new code and try again
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="danger"
                  disabled={deleteMutation.isPending || !isOtpValid}
                  isLoading={deleteMutation.isPending}
                >
                  Permanently delete my account
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendOtp}
                  disabled={!canResend}
                >
                  {requestOtpMutation.isPending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Button>
                <Link href="/settings/security" className="ml-auto">
                  <Button variant="ghost">Cancel</Button>
                </Link>
              </div>
            </div>
          </SettingCard>
        </form>
      )}

      {/* Phase: Done */}
      {phase === 'done' && (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-8 text-center mt-8">
          <Icon name="check" className="text-[#10B981] mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">Account deleted</h3>
          <p className="text-sm text-[#B0B0B0]">
            We're signing you out. If this page doesn't change, you can continue below.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/login">
              <Button variant="secondary">Go to sign in</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Back Link */}
      {phase === 'intro' && (
        <div className="mt-8">
          <Link href="/settings/security">
            <Button variant="ghost">
              <Icon name="arrow-left" size={16} />
              Back to Security
            </Button>
          </Link>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
