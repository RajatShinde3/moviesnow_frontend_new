'use client';

/**
 * Change Email Page
 * Professional eye-comfortable design for changing account email
 * - Request email change with confirmation
 * - Resend functionality with cooldown
 * - Step-up authentication support
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

export default function ChangeEmailPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  // Email change mutation
  const emailChangeMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      return await fetchJson('/api/v1/auth/email/change-request', {
        method: 'POST',
        body: JSON.stringify({ new_email: newEmail }),
      });
    },
    onSuccess: () => {
      setSuccessEmail(email.trim());
      toast.success('Confirmation email sent');
      setCooldown(60); // 60 second cooldown
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send confirmation email');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (trimmed && trimmed.includes('@')) {
      emailChangeMutation.mutate(trimmed);
    }
  };

  const handleResend = () => {
    if (successEmail && cooldown === 0) {
      emailChangeMutation.mutate(successEmail);
    }
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="Change Email"
        description="Update your account email address"
        icon="mail"
      />

      {/* Info Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="info" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Email Change Process</h3>
            <p className="text-sm text-[#B0B0B0]">
              We'll send a confirmation link to your new email address. Click the link to complete
              the change. For security, we may ask you to re-authenticate.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successEmail && (
        <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[#10B981]/10 p-2.5 border border-[#10B981]/30">
              <Icon name="check" className="text-[#10B981]" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">
                Confirmation Email Sent
              </h3>
              <p className="text-sm text-[#B0B0B0] mb-3">
                We've sent a confirmation link to <span className="text-[#F0F0F0] font-medium">{successEmail}</span>.
                Check your inbox and click the link to complete the change.
              </p>
              {cooldown > 0 ? (
                <p className="text-xs text-[#808080]">
                  Resend available in {cooldown} seconds
                </p>
              ) : (
                <Button variant="ghost" onClick={handleResend} disabled={cooldown > 0}>
                  Resend Confirmation
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Change Form */}
      <SettingCard
        title="New Email Address"
        description="Enter the new email you want to use for your account"
        icon="mail"
        className="mb-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-email" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              New Email Address
            </label>
            <input
              id="new-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.new.email@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] placeholder-[#808080] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              required
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={emailChangeMutation.isPending}
            disabled={!email.trim() || !email.includes('@')}
            className="w-full"
          >
            Send Confirmation Email
          </Button>
        </form>
      </SettingCard>

      {/* Security Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="shield" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">Security Notice</h3>
            <p className="text-xs text-[#808080]">
              Your email address is used for important account notifications and password recovery.
              Make sure you have access to the new email before changing it.
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/settings">
          <Button variant="ghost">
            <Icon name="arrow-left" size={16} />
            Back to Settings
          </Button>
        </Link>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
