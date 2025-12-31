'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// Custom SVG Icons
const MailIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
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

const ArrowLeftIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ClockIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SendIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const AlertTriangleIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ChangeEmailPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  // Email change mutation
  const emailChangeMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, email: newEmail };
    },
    onSuccess: () => {
      setSuccessEmail(email.trim());
      toast.success('Confirmation email sent successfully');
      setCooldown(60);
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
              <MailIcon size={32} className="text-[#F0F0F0]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#F0F0F0] tracking-tight">Change Email</h1>
              <p className="text-base text-[#999999] mt-2 max-w-2xl">
                Update your account email address securely
              </p>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#131313] p-6 shadow-2xl mb-8">
          <div className="flex items-start gap-4">
            <InfoIcon size={20} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#22C55E] mb-2">Email Change Process</h3>
              <p className="text-sm text-[#D0D0D0]">
                We'll send a confirmation link to your new email address. Click the link to complete the change. For security, we may ask you to re-authenticate.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successEmail && (
          <div className="rounded-2xl border border-[#22C55E]/30 bg-gradient-to-br from-[#1A2A1A] to-[#131813] p-8 shadow-2xl mb-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/10 p-3 border border-[#22C55E]/30 shadow-lg">
                <CheckCircleIcon size={24} className="text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#22C55E] mb-3">
                  Confirmation Email Sent
                </h3>
                <p className="text-sm text-[#D0D0D0] mb-4">
                  We've sent a confirmation link to <span className="text-[#F0F0F0] font-bold">{successEmail}</span>.
                  Check your inbox and click the link to complete the change.
                </p>
                {cooldown > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-[#888888] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 inline-flex">
                    <ClockIcon size={14} />
                    Resend available in {cooldown} seconds
                  </div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2A2A2A] to-[#222222] text-[#F0F0F0] font-bold text-sm border border-[#333333] hover:border-[#444444] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <SendIcon size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    Resend Confirmation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Change Form */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <MailIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">New Email Address</h2>
              <p className="text-sm text-[#888888] mt-1">Enter the new email you want to use for your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-email" className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                New Email Address
              </label>
              <input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.new.email@example.com"
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] placeholder-[#666666] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg"
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={!email.trim() || !email.includes('@') || emailChangeMutation.isPending}
              className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/50 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {emailChangeMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#F0F0F0] border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendIcon size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    Send Confirmation Email
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="rounded-2xl border border-[#EF4444]/30 bg-gradient-to-br from-[#2A1515] to-[#1F1010] p-8 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-gradient-to-br from-[#3A1A1A] to-[#2A1010] p-3 border border-[#EF4444]/30 shadow-lg">
              <AlertTriangleIcon size={24} className="text-[#EF4444]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#EF4444] mb-2">Security Notice</h3>
              <ul className="text-sm text-[#D0D0D0] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">•</span>
                  <span>Your email address is used for important account notifications and password recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">•</span>
                  <span>Make sure you have access to the new email before changing it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">•</span>
                  <span>You'll need to verify the new email address before the change takes effect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">•</span>
                  <span>Your current email will remain active until the new one is confirmed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
