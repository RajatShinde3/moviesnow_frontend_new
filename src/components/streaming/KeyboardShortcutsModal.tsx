'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ⌨️ KEYBOARD SHORTCUTS MODAL
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Beautiful modal showing all keyboard shortcuts.
 * Triggered by pressing '?' key.
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { colors, shadows, animation, glassmorph, zIndex } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Home'], description: 'Go to homepage', category: 'Navigation' },
  { keys: ['/'], description: 'Focus search', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close modals/menus', category: 'Navigation' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Navigation' },

  // Playback
  { keys: ['Space'], description: 'Play/Pause', category: 'Playback' },
  { keys: ['←', '→'], description: 'Seek backward/forward', category: 'Playback' },
  { keys: ['↑', '↓'], description: 'Volume up/down', category: 'Playback' },
  { keys: ['M'], description: 'Mute/Unmute', category: 'Playback' },
  { keys: ['F'], description: 'Fullscreen', category: 'Playback' },
  { keys: ['C'], description: 'Toggle captions', category: 'Playback' },

  // Browse
  { keys: ['Tab'], description: 'Navigate between items', category: 'Browse' },
  { keys: ['Enter'], description: 'Select/Open', category: 'Browse' },
  { keys: ['W'], description: 'Add to watchlist', category: 'Browse' },
  { keys: ['D'], description: 'Download', category: 'Browse' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Listen for '?' key
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, Shortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
    });
    return groups;
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: zIndex.modalBackdrop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: zIndex.modal }}
          >
            <motion.div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl"
              style={{
                background: colors.bg.secondary,
                border: `1px solid ${colors.border.default}`,
                boxShadow: `${shadows.xl}, ${shadows.glow.purple}`,
              }}
              variants={animation.variants.scale}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between border-b p-6"
                style={{
                  background: colors.bg.secondary,
                  borderColor: colors.border.default,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      background: colors.gradient.premium,
                      boxShadow: shadows.glow.pink,
                    }}
                  >
                    <Keyboard size={20} style={{ color: colors.text.inverse }} />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: colors.text.primary }}
                    >
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                      Master MoviesNow like a pro
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: colors.bg.elevated,
                    color: colors.text.secondary,
                  }}
                  whileHover={{
                    background: colors.bg.tertiary,
                    color: colors.text.primary,
                    scale: 1.1,
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3
                      className="mb-3 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: colors.accent.secondary }}
                    >
                      {category}
                    </h3>

                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between rounded-lg p-3 transition-colors"
                          style={{
                            background: colors.bg.tertiary,
                          }}
                          whileHover={{
                            background: colors.bg.elevated,
                            scale: 1.01,
                          }}
                        >
                          <span
                            className="text-sm"
                            style={{ color: colors.text.secondary }}
                          >
                            {shortcut.description}
                          </span>

                          <div className="flex items-center gap-2">
                            {shortcut.keys.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                <kbd
                                  className="min-w-[2rem] rounded px-2 py-1 text-center text-xs font-semibold"
                                  style={{
                                    background: colors.bg.primary,
                                    color: colors.text.primary,
                                    border: `1px solid ${colors.border.default}`,
                                    boxShadow: shadows.sm,
                                  }}
                                >
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span style={{ color: colors.text.tertiary }}>+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Footer Tip */}
                <div
                  className="rounded-lg p-4 text-center text-sm"
                  style={{
                    background: colors.gradient.glass,
                    color: colors.text.tertiary,
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  💡 <strong>Pro tip:</strong> Press <kbd className="mx-1 rounded bg-white/10 px-2 py-0.5">?</kbd> anytime to toggle this modal
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
