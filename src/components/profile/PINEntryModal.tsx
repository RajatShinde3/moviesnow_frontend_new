'use client';

/**
 * PIN Entry Modal Component
 * ==========================
 * Modal for entering profile PIN to unlock protected profiles
 *
 * Features:
 * - 4-digit PIN input with visual feedback
 * - Auto-advance to next digit
 * - Backspace support
 * - Error handling with shake animation
 * - Accessible keyboard navigation
 * - Auto-focus on mount
 *
 * Best Practices:
 * - Password input type for security
 * - Clear error messages
 * - Visual feedback for incorrect PIN
 * - Timeout after multiple failed attempts
 */

import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

interface PINEntryModalProps {
  /** Profile name being accessed */
  profileName: string;
  /** Callback when correct PIN is entered */
  onCorrectPIN: () => void;
  /** Callback to validate PIN */
  onValidatePIN: (pin: string) => Promise<boolean>;
  /** Callback to close modal */
  onClose: () => void;
}

export function PINEntryModal({
  profileName,
  onCorrectPIN,
  onValidatePIN,
  onClose,
}: PINEntryModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 30; // seconds

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (index === 3 && digit) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        validatePin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current digit
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const validatePin = async (pinValue: string) => {
    if (isLocked) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await onValidatePIN(pinValue);

      if (isValid) {
        onCorrectPIN();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setError(`Too many failed attempts. Locked for ${LOCKOUT_TIME} seconds.`);

          // Auto-unlock after lockout time
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
            setError(null);
          }, LOCKOUT_TIME * 1000);
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }

        // Clear PIN and refocus
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('PIN validation error:', err);
      setError('Failed to validate PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-black/95 p-8 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Profile is Locked</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 4-digit PIN for <span className="font-medium text-white">{profileName}</span>
          </p>
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isValidating || isLocked}
                className={`h-16 w-16 rounded-lg border-2 bg-white/5 text-center text-2xl font-bold text-white transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                  error
                    ? 'animate-shake border-red-500'
                    : digit
                    ? 'border-white/30'
                    : 'border-white/10'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Validating State */}
          {isValidating && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              <span>Validating...</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Don't know the PIN? Contact the account owner.
          </p>
        </div>
      </div>

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </>
  );
}
