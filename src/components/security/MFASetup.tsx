// components/security/MFASetup.tsx
/**
 * =============================================================================
 * MFA/2FA Setup Component - Production-Grade Security
 * =============================================================================
 * Features:
 * - QR code generation for authenticator apps
 * - Manual secret key entry option
 * - TOTP verification
 * - Backup codes generation and secure display
 * - Enable/disable flow
 * - Recovery options
 *
 * Best Practices:
 * - Secure state management
 * - Input validation
 * - Error handling
 * - Accessibility (ARIA labels)
 * - Progressive disclosure
 * - Clear instructions
 */

"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Shield,
  Smartphone,
  Key,
  Download,
  Check,
  Copy,
  AlertTriangle,
  ChevronRight,
  X,
} from "lucide-react";

interface MFASetupData {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

/**
 * Main MFA Setup Component
 */
export function MFASetup({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = React.useState<"intro" | "setup" | "verify" | "backup" | "complete">("intro");
  const [setupData, setSetupData] = React.useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check current MFA status
  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.user.getMe(),
  });

  // Step 1: Initiate MFA setup
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/auth/mfa/setup", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to initiate MFA setup");
      }

      return response.json();
    },
    onSuccess: (data: MFASetupData) => {
      setSetupData(data);
      setStep("setup");
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Step 2: Verify TOTP code
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/v1/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Invalid verification code");
      }

      return response.json();
    },
    onSuccess: () => {
      setStep("backup");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Disable MFA
  const disableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/auth/mfa/disable", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to disable MFA");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      setStep("intro");
      setSetupData(null);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    verifyMutation.mutate(verificationCode);
  };

  const handleComplete = () => {
    setStep("complete");
    onComplete?.();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Render different steps
  if (user?.is_2fa_enabled && step === "intro") {
    return <MFAAlreadyEnabled onDisable={() => disableMutation.mutate()} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      {step !== "intro" && step !== "complete" && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["setup", "verify", "backup"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-semibold",
                    step === s
                      ? "bg-blue-600 text-white"
                      : ["setup", "verify", "backup"].indexOf(step) > i
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  )}
                >
                  {["setup", "verify", "backup"].indexOf(step) > i ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "h-1 flex-1",
                      ["setup", "verify", "backup"].indexOf(step) > i
                        ? "bg-green-600"
                        : "bg-gray-700"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-400">
            <span>Scan QR Code</span>
            <span>Verify Code</span>
            <span>Backup Codes</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-500">Error</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Step content */}
      {step === "intro" && <IntroStep onStart={() => setupMutation.mutate()} isLoading={setupMutation.isPending} />}
      {step === "setup" && setupData && <SetupStep data={setupData} onNext={() => setStep("verify")} />}
      {step === "verify" && (
        <VerifyStep
          code={verificationCode}
          onCodeChange={setVerificationCode}
          onSubmit={handleVerify}
          isLoading={verifyMutation.isPending}
        />
      )}
      {step === "backup" && setupData && (
        <BackupCodesStep codes={setupData.backup_codes} onComplete={handleComplete} />
      )}
      {step === "complete" && <CompleteStep />}
    </div>
  );
}

/**
 * Intro Step
 */
function IntroStep({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-full bg-blue-500/20 p-4">
          <Shield className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Enable Two-Factor Authentication</h2>
          <p className="text-gray-400">Add an extra layer of security to your account</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-white">Protect your account</p>
            <p className="text-sm text-gray-400">
              Even if someone knows your password, they won&apos;t be able to access your account
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-white">Use any authenticator app</p>
            <p className="text-sm text-gray-400">
              Google Authenticator, Authy, 1Password, or any TOTP-compatible app
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-white">Get backup codes</p>
            <p className="text-sm text-gray-400">
              Store backup codes in a safe place in case you lose access to your device
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            Setting up...
          </>
        ) : (
          <>
            Get Started
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Setup Step - QR Code Display
 */
function SetupStep({ data, onNext }: { data: MFASetupData; onNext: () => void }) {
  const [showSecret, setShowSecret] = React.useState(false);

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
        <p className="text-gray-400">Use your authenticator app to scan this QR code</p>
      </div>

      {/* QR Code */}
      <div className="mb-6 flex justify-center rounded-lg bg-white p-8">
        <img
          src={data.qr_code_url}
          alt="MFA QR Code"
          className="h-64 w-64"
        />
      </div>

      {/* Manual entry option */}
      <div className="mb-6">
        <button
          onClick={() => setShowSecret(!showSecret)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showSecret ? "Hide" : "Show"} manual entry key
        </button>

        {showSecret && (
          <div className="mt-3 rounded-lg bg-gray-800 p-4">
            <p className="mb-2 text-xs text-gray-400">Enter this key manually:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-700 px-3 py-2 font-mono text-sm text-white">
                {data.secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(data.secret)}
                className="rounded bg-gray-700 p-2 text-gray-300 hover:bg-gray-600 hover:text-white"
                aria-label="Copy secret key"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-6 space-y-3 rounded-lg bg-gray-800 p-4">
        <p className="font-medium text-white">How to set up:</p>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>Open your authenticator app (Google Authenticator, Authy, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>Scan the QR code above or enter the key manually</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Click &quot;Next&quot; to verify your setup</span>
          </li>
        </ol>
      </div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Next
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

/**
 * Verify Step - Code Input
 */
function VerifyStep({
  code,
  onCodeChange,
  onSubmit,
  isLoading,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    onCodeChange(value);
  };

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Verify Your Setup</h2>
        <p className="text-gray-400">Enter the 6-digit code from your authenticator app</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Code input */}
        <div>
          <label htmlFor="mfa-code" className="mb-2 block text-sm font-medium text-gray-300">
            Verification Code
          </label>
          <input
            ref={inputRef}
            id="mfa-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={handleChange}
            placeholder="000000"
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
            required
          />
          <p className="mt-2 text-xs text-gray-400">
            The code changes every 30 seconds
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Continue
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium">Tip:</p>
            <p>Make sure your device&apos;s time is synchronized correctly for accurate codes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Backup Codes Step
 */
function BackupCodesStep({ codes, onComplete }: { codes: string[]; onComplete: () => void }) {
  const [downloaded, setDownloaded] = React.useState(false);

  const downloadCodes = () => {
    const content = `MoviesNow - Two-Factor Authentication Backup Codes

Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place. You can use each code once if you lose access to your authenticator app.

${codes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

Do not share these codes with anyone!
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moviesnow-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
  };

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Save Your Backup Codes</h2>
        <p className="text-gray-400">
          Store these codes in a safe place. You can use each code once.
        </p>
      </div>

      {/* Warning */}
      <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-500 mt-0.5" />
        <div className="text-sm text-yellow-200">
          <p className="font-medium">Important!</p>
          <p>
            These backup codes will only be shown once. Download or copy them now before continuing.
          </p>
        </div>
      </div>

      {/* Backup codes grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg bg-gray-800 p-4">
        {codes.map((code, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded bg-gray-700 px-3 py-2"
          >
            <span className="font-mono text-sm text-white">{code}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-gray-400 hover:text-white"
              aria-label={`Copy code ${i + 1}`}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={downloadCodes}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
        >
          <Download className="h-5 w-5" />
          Download Backup Codes
        </button>

        <button
          onClick={onComplete}
          disabled={!downloaded}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {downloaded ? (
            <>
              <Check className="h-5 w-5" />
              I&apos;ve Saved My Codes
            </>
          ) : (
            "Download Codes First"
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Complete Step
 */
function CompleteStep() {
  return (
    <div className="rounded-lg bg-gray-900 p-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-500/20 p-6">
          <Check className="h-16 w-16 text-green-500" />
        </div>
      </div>

      <h2 className="mb-3 text-2xl font-bold text-white">Two-Factor Authentication Enabled!</h2>
      <p className="mb-8 text-gray-400">
        Your account is now more secure. You&apos;ll need to enter a code from your authenticator app
        when you sign in.
      </p>

      <div className="rounded-lg bg-gray-800 p-4 text-left">
        <p className="mb-2 font-medium text-white">What&apos;s next?</p>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span>•</span>
            <span>You&apos;ll be asked for a code when you sign in on a new device</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Keep your backup codes in a safe place</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>You can disable 2FA anytime from your security settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * MFA Already Enabled State
 */
function MFAAlreadyEnabled({ onDisable }: { onDisable: () => void }) {
  const [confirmDisable, setConfirmDisable] = React.useState(false);

  return (
    <div className="rounded-lg bg-gray-900 p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-full bg-green-500/20 p-4">
          <Shield className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">2FA is Enabled</h2>
          <p className="text-gray-400">Your account is protected with two-factor authentication</p>
        </div>
      </div>

      {!confirmDisable ? (
        <button
          onClick={() => setConfirmDisable(true)}
          className="w-full rounded-lg border-2 border-red-500 px-6 py-3 font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
        >
          Disable Two-Factor Authentication
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-300">
              Are you sure? Disabling 2FA will make your account less secure.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDisable(false)}
              className="flex-1 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onDisable}
              className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
