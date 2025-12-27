/**
 * =============================================================================
 * Keyboard Shortcuts Helper
 * =============================================================================
 * Global keyboard shortcuts with visual helper overlay
 */

'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['H'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['S'], description: 'Search', category: 'Navigation' },
  { keys: ['B'], description: 'Browse', category: 'Navigation' },
  { keys: ['M'], description: 'My List', category: 'Navigation' },
  { keys: ['N'], description: 'Notifications', category: 'Navigation' },

  // Player
  { keys: ['Space', 'K'], description: 'Play / Pause', category: 'Player' },
  { keys: ['F'], description: 'Fullscreen', category: 'Player' },
  { keys: ['M'], description: 'Mute / Unmute', category: 'Player' },
  { keys: ['←'], description: 'Rewind 10s', category: 'Player' },
  { keys: ['→'], description: 'Forward 10s', category: 'Player' },
  { keys: ['↑'], description: 'Volume Up', category: 'Player' },
  { keys: ['↓'], description: 'Volume Down', category: 'Player' },
  { keys: ['0-9'], description: 'Jump to %', category: 'Player' },
  { keys: [','], description: 'Previous Frame', category: 'Player' },
  { keys: ['.'], description: 'Next Frame', category: 'Player' },
  { keys: ['C'], description: 'Toggle Captions', category: 'Player' },

  // General
  { keys: ['?'], description: 'Show Shortcuts', category: 'General' },
  { keys: ['Esc'], description: 'Close Modal', category: 'General' },
  { keys: ['/'], description: 'Focus Search', category: 'General' },
];

export default function KeyboardShortcutsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === '?' && (e.shiftKey || e.key === '/')) {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all z-40"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="h-6 w-6" />
      </motion.button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Keyboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Keyboard Shortcuts</h2>
                      <p className="text-sm text-gray-400">Master MoviesNow like a pro</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Shortcuts Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {SHORTCUTS.filter((s) => s.category === category).map(
                          (shortcut, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              <span className="text-gray-300 text-sm">
                                {shortcut.description}
                              </span>
                              <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && (
                                      <span className="text-gray-600 text-xs mx-1">or</span>
                                    )}
                                    <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-white shadow-sm min-w-[2rem] text-center">
                                      {key}
                                    </kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pro Tip */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      💡
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Pro Tip</h4>
                      <p className="text-sm text-gray-400">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">?</kbd>{' '}
                        anytime to view these shortcuts. Most shortcuts work globally across the app!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {SHORTCUTS.length} shortcuts available
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg font-medium transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for registering custom shortcuts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [key, callback, ...deps]);
}
