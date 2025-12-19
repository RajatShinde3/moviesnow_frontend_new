/**
 * useKeyboardShortcuts Hook
 * =========================
 * Global keyboard shortcuts for the entire application
 *
 * Shortcuts:
 * - / : Focus search
 * - ? : Show shortcuts help modal
 * - Esc : Close modals, unfocus inputs
 * - Space : Play/Pause video (when focused)
 * - 1-9 : Navigate to sections (home, browse, watchlist, etc.)
 * - g+h : Go to home
 * - g+b : Go to browse
 * - g+w : Go to watchlist
 * - g+s : Go to settings
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category: string;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Custom shortcuts to register */
  shortcuts?: KeyboardShortcut[];
  /** Callback when help modal should be shown */
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts({
  enabled = true,
  shortcuts = [],
  onShowHelp,
}: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();
  const lastKeyRef = useRef<string | null>(null);
  const keyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to unfocus
        if (event.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Handle sequential key combinations (e.g., "g" then "h")
      if (lastKeyRef.current === 'g') {
        switch (event.key) {
          case 'h':
            router.push('/home');
            break;
          case 'b':
            router.push('/browse');
            break;
          case 'w':
            router.push('/watchlist');
            break;
          case 's':
            router.push('/settings');
            break;
          case 'p':
            router.push('/profiles');
            break;
        }
        lastKeyRef.current = null;
        if (keyTimeoutRef.current) {
          clearTimeout(keyTimeoutRef.current);
        }
        return;
      }

      // Handle single key shortcuts
      switch (event.key) {
        case '/':
          event.preventDefault();
          // Focus search input
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"], input[placeholder*="Search" i], input[placeholder*="search" i]'
          );
          searchInput?.focus();
          break;

        case '?':
          event.preventDefault();
          onShowHelp?.();
          break;

        case 'Escape':
          event.preventDefault();
          // Close any open modals or unfocus inputs
          document.activeElement?.closest('[role="dialog"]')?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
          (document.activeElement as HTMLElement)?.blur();
          break;

        case 'g':
          // Start sequential command
          lastKeyRef.current = 'g';
          // Clear after 1 second if no second key
          if (keyTimeoutRef.current) {
            clearTimeout(keyTimeoutRef.current);
          }
          keyTimeoutRef.current = setTimeout(() => {
            lastKeyRef.current = null;
          }, 1000);
          break;

        case '1':
          if (!event.ctrlKey && !event.metaKey) {
            router.push('/home');
          }
          break;

        case '2':
          if (!event.ctrlKey && !event.metaKey) {
            router.push('/browse');
          }
          break;

        case '3':
          if (!event.ctrlKey && !event.metaKey) {
            router.push('/watchlist');
          }
          break;

        case '4':
          if (!event.ctrlKey && !event.metaKey) {
            router.push('/downloads');
          }
          break;
      }

      // Handle custom shortcuts
      shortcuts.forEach((shortcut) => {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.altKey === !!shortcut.alt &&
          !!event.shiftKey === !!shortcut.shift &&
          !!event.metaKey === !!shortcut.meta
        ) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [enabled, shortcuts, router, onShowHelp]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (keyTimeoutRef.current) {
        clearTimeout(keyTimeoutRef.current);
      }
    };
  }, [enabled, handleKeyPress]);

  return {
    enabled,
  };
}
