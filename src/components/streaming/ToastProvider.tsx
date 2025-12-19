'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🔔 TOAST NOTIFICATION PROVIDER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Beautiful toast notifications with custom styling.
 */

import { Toaster } from 'sonner';
import { colors, shadows } from '@/lib/design-system';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: colors.bg.secondary,
          border: `1px solid ${colors.border.default}`,
          color: colors.text.primary,
          boxShadow: shadows.xl,
          backdropFilter: 'blur(20px)',
        },
        className: 'toast-custom',
      }}
    />
  );
}

// Export toast functions for easy use
export { toast } from 'sonner';
