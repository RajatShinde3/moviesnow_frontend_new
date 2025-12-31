'use client';

/**
 * Two-Factor Authentication (MFA) Settings - Professional Dark Theme
 * Enterprise-grade MFA management with QR code setup
 * - Enable/Disable MFA with TOTP authenticator apps
 * - QR code generation for easy setup
 * - Manual key entry option
 * - Device trust management
 * - Recovery code integration
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════════════════
// Custom SVG Icons
// ══════════════════════════════════════════════════════════════════════════════

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

const SmartphoneIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
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
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

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

const CopyIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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

const InfoIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = React.useState(false);
  const [isEnabling, setIsEnabling] = React.useState(false);
  const [isDisabling, setIsDisabling] = React.useState(false);
  const [showSetup, setShowSetup] = React.useState(false);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState(['', '', '', '', '', '']);
  const [showSecret, setShowSecret] = React.useState(false);
  const [trustDevice, setTrustDevice] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleEnableMFA = async () => {
    setIsEnabling(true);
    try {
      // Simulate API call to enable MFA
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock secret and generate real QR code
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const issuer = 'MoviesNow';
      const accountName = 'user@example.com'; // This would come from the user's actual email

      // Create otpauth URL for TOTP
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${mockSecret}&issuer=${encodeURIComponent(issuer)}`;

      // Generate QR code using qrcode library
      const QRCode = (await import('qrcode')).default;
      const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      setSecret(mockSecret);
      setQrCode(qrDataUrl);
      setShowSetup(true);
      toast.success('MFA setup started - Scan the QR code with your authenticator app');
    } catch (error) {
      toast.error('Failed to start MFA setup');
      console.error('QR code generation error:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisableMFA = async () => {
    setIsDisabling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMfaEnabled(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error('Failed to disable MFA');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMfaEnabled(true);
      setShowSetup(false);
      toast.success('Two-factor authentication enabled successfully!');
    } catch (error) {
      toast.error('Invalid verification code - please try again');
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] text-[#E5E5E5] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-6 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-[#252525] via-[#1C1C1C] to-[#161616] p-5 border border-[#2F2F2F] shadow-2xl shadow-black/60 backdrop-blur-sm">
            <ShieldIcon className="text-[#999999]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2 tracking-tight bg-gradient-to-r from-[#F5F5F5] to-[#D0D0D0] bg-clip-text text-transparent">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-[#999999] leading-relaxed max-w-2xl">
              Add an extra layer of security to your account using an authenticator app
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-start gap-5">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3.5 border border-[#2F2F2F] shadow-lg">
              <InfoIcon className="text-[#888888]" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-2.5 tracking-tight">Enhanced Account Security</h3>
              <p className="text-sm text-[#999999] leading-relaxed max-w-3xl">
                Two-factor authentication adds an extra verification step when signing in. You'll need both your password
                and a code from your authenticator app to access your account.
              </p>
            </div>
          </div>
        </div>

        {/* MFA Status Card */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1A1A1A]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
                <SmartphoneIcon className="text-[#888888]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Authenticator App (TOTP)</h2>
                <p className="text-sm text-[#888888] mt-1">
                  {mfaEnabled
                    ? 'Enabled - You\'ll be asked for a code when signing in'
                    : 'Disabled - Add an extra step to protect your account'}
                </p>
              </div>
            </div>
            <div>
              {!mfaEnabled && !showSetup && (
                <button
                  onClick={handleEnableMFA}
                  disabled={isEnabling}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/50"
                >
                  {isEnabling ? 'Starting...' : 'Enable MFA'}
                </button>
              )}
              {mfaEnabled && (
                <button
                  onClick={handleDisableMFA}
                  disabled={isDisabling}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#2A2A2A] text-[#D0D0D0] text-sm font-semibold hover:from-[#242424] hover:to-[#1F1F1F] hover:border-[#353535] transition-all duration-300 disabled:opacity-50 shadow-xl shadow-black/40"
                >
                  {isDisabling ? 'Disabling...' : 'Disable MFA'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Flow */}
        {showSetup && (
          <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#1F1F1F]/10 to-transparent rounded-full blur-3xl -z-10"></div>

            <h3 className="text-xl font-bold text-[#F0F0F0] mb-6 tracking-tight">Set Up Your Authenticator</h3>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* QR Code Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                  <h4 className="text-base font-bold text-[#F0F0F0]">Step 1: Scan QR Code</h4>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-white p-6 flex items-center justify-center">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="MFA QR Code"
                      className="w-64 h-64 rounded-lg"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-[#E0E0E0] rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-center text-sm text-[#999999]">Generating QR Code...</div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#999999] leading-relaxed">
                  Use Google Authenticator, 1Password, Authy, or any TOTP-compatible app to scan this code.
                </p>
              </div>

              {/* Manual Key Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                  <h4 className="text-base font-bold text-[#F0F0F0]">Alternative: Manual Key</h4>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#999999] uppercase tracking-wide">Secret Key</span>
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-xs font-semibold text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200 flex items-center gap-1.5"
                    >
                      {showSecret ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className={`px-4 py-3 rounded-lg bg-[#0F0F0F] border border-[#252525] font-mono text-sm text-[#F0F0F0] break-all ${!showSecret ? 'blur-sm select-none' : ''}`}>
                    {showSecret ? secret : '•••• •••• •••• ••••'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(secret, 'Secret key')}
                    disabled={!showSecret}
                    className="mt-3 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#222222] to-[#1A1A1A] border border-[#2F2F2F] text-[#D0D0D0] text-sm font-semibold hover:from-[#252525] hover:to-[#1F1F1F] hover:border-[#3A3A3A] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CopyIcon size={16} />
                    Copy Key
                  </button>
                </div>
                <p className="text-xs text-[#999999] leading-relaxed">
                  If you can't scan the QR code, enter this key manually. Use 6 digits and 30-second interval.
                </p>
              </div>
            </div>

            {/* Verification Section */}
            <div className="border-t border-[#222222] pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                <h4 className="text-base font-bold text-[#F0F0F0]">Step 2: Enter Verification Code</h4>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg"
                  />
                ))}
              </div>

              <p className="text-xs text-[#888888] text-center mb-6">
                Codes refresh every 30 seconds. If verification fails, wait for the next code and try again.
              </p>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gradient-to-r from-[#222222] to-[#1C1C1C] border border-[#2A2A2A] rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#4F4F4F] peer-checked:via-[#454545] peer-checked:to-[#3C3C3C] peer-checked:border-[#5A5A5A] transition-all duration-300 shadow-lg"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-gradient-to-br from-[#7A7A7A] to-[#606060] rounded-full transition-all duration-300 peer-checked:translate-x-6 peer-checked:from-[#FAFAFA] peer-checked:to-[#E5E5E5] shadow-lg"></div>
                  </div>
                  <span className="text-sm font-semibold text-[#D0D0D0] group-hover:text-[#F0F0F0] transition-colors duration-200">
                    Remember this device
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSetup(false);
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#2A2A2A] text-[#D0D0D0] text-sm font-semibold hover:from-[#242424] hover:to-[#1F1F1F] hover:border-[#353535] transition-all duration-300 shadow-xl shadow-black/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={verificationCode.join('').length !== 6}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/50 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Verify & Enable</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MFA Enabled Success */}
        {mfaEnabled && (
          <div className="relative rounded-2xl border border-[#22C55E]/30 bg-gradient-to-br from-[#22C55E]/10 via-[#22C55E]/5 to-transparent p-7 mb-8 shadow-2xl shadow-[#22C55E]/10 overflow-hidden">
            <div className="flex items-start gap-5">
              <div className="rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 p-3 shadow-lg">
                <CheckIcon className="text-[#22C55E]" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#22C55E] mb-2 tracking-tight">MFA Successfully Enabled</h3>
                <p className="text-sm text-[#D0D0D0] leading-relaxed mb-4">
                  Your account is now protected with two-factor authentication. We recommend saving your recovery codes.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/settings/security/recovery-codes"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#222222] to-[#1A1A1A] border border-[#2F2F2F] text-[#D0D0D0] text-sm font-semibold hover:from-[#252525] hover:to-[#1F1F1F] hover:border-[#3A3A3A] transition-all duration-300 shadow-lg inline-flex items-center gap-2"
                  >
                    <KeyIcon size={16} />
                    View Recovery Codes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
