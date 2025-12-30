'use client';

/**
 * Account Deactivate Page
 * Professional eye-comfortable design for temporarily deactivating account
 * - OTP verification for security
 * - Clear explanation of deactivation effects
 * - Reactivation instructions
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

type Phase = 'intro' | 'code' | 'done';

export default function DeactivateAccountPage() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>('intro');
  const [otpCode, setOtpCode] = React.useState('');
  const [cooldown, setCooldown] = React.useState(0);

  // Request deactivation OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson('/api/v1/auth/account/deactivate/request-otp', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setPhase('code');
      setCooldown(60); // 60 second cooldown
      toast.success('Verification code sent to your email');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send verification code');
    },
  });

  // Deactivate account mutation
  const deactivateMutation = useMutation({
    mutationFn: async (code: string) => {
      return await fetchJson('/api/v1/auth/account/deactivate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: () => {
      setPhase('done');
      setOtpCode('');
      toast.success('Account deactivated successfully');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid verification code');
      setOtpCode('');
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

  const canResend = !requestOtpMutation.isPending && cooldown <= 0;

  const handleSendCode = () => {
    requestOtpMutation.mutate();
  };

  const handleDeactivate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.replace(/\D/g, '');
    if (code.length === 6) {
      deactivateMutation.mutate(code);
    }
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="Deactivate Account"
        description="Deactivating disables sign-ins and most notifications. You can reactivate later from your email."
        icon="lock-open"
      />

      {/* Phase: Intro / Explanation */}
      {phase === 'intro' && (
        <>
          {/* Info Card */}
          <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-6 mb-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#F59E0B]/20 p-2.5 border border-[#F59E0B]/30">
                <Icon name="info" className="text-[#F59E0B]" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Before you deactivate</h3>
                <ul className="space-y-1 text-sm text-[#B0B0B0]">
                  <li>• Sign-ins will be disabled until you reactivate</li>
                  <li>• You may still receive critical security emails where required</li>
                  <li>• You can reactivate later from the email on this account</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <SettingCard
            title="Confirm Deactivation"
            description="We'll send you a verification code to confirm"
            icon="shield"
            className="mb-6"
          >
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleSendCode}
                isLoading={requestOtpMutation.isPending}
              >
                {requestOtpMutation.isPending ? 'Sending code...' : 'Send confirmation code'}
              </Button>
              <Link href="/settings/security">
                <Button variant="secondary">Cancel</Button>
              </Link>
            </div>
          </SettingCard>
        </>
      )}

      {/* Phase: OTP Entry */}
      {phase === 'code' && (
        <form onSubmit={handleDeactivate} noValidate className="mt-8">
          <SettingCard
            title="Enter Verification Code"
            description="We sent a 6-digit code to your account email"
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
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors font-mono text-lg"
                  autoFocus
                />
                <p className="text-xs text-[#808080] mt-1">
                  Codes expire quickly. If it fails, request a new one and try again
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="danger"
                  disabled={deactivateMutation.isPending || otpCode.replace(/\D/g, '').length !== 6}
                  isLoading={deactivateMutation.isPending}
                >
                  Deactivate account
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendCode}
                  disabled={!canResend}
                >
                  {requestOtpMutation.isPending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Button>
              </div>
            </div>
          </SettingCard>
        </form>
      )}

      {/* Phase: Done */}
      {phase === 'done' && (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-8 text-center mt-8">
          <Icon name="check" className="text-[#10B981] mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">Account deactivated</h3>
          <p className="text-sm text-[#B0B0B0] mb-4">
            You won't be able to sign in until you reactivate. When you're ready, start reactivation below.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/reactivation">
              <Button variant="secondary">Start reactivation</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Go to sign in</Button>
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
