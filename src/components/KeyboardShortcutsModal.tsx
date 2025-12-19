'use client';

/**
 * Keyboard Shortcuts Help Modal
 * ==============================
 * Displays all available keyboard shortcuts organized by category
 *
 * Features:
 * - Categorized shortcut list
 * - Visual key representations
 * - Searchable shortcuts
 * - Responsive design
 * - Accessible modal
 */

import React, { useState } from 'react';
import { X, Search, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['/'], description: 'Focus search', category: 'Navigation' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close modals / Unfocus', category: 'Navigation' },
  { keys: ['1'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['2'], description: 'Go to Browse', category: 'Navigation' },
  { keys: ['3'], description: 'Go to Watchlist', category: 'Navigation' },
  { keys: ['4'], description: 'Go to Downloads', category: 'Navigation' },
  { keys: ['g', 'h'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['g', 'b'], description: 'Go to Browse', category: 'Navigation' },
  { keys: ['g', 'w'], description: 'Go to Watchlist', category: 'Navigation' },
  { keys: ['g', 's'], description: 'Go to Settings', category: 'Navigation' },
  { keys: ['g', 'p'], description: 'Go to Profiles', category: 'Navigation' },

  // Video Player
  { keys: ['Space', 'k'], description: 'Play / Pause', category: 'Video Player' },
  { keys: ['f'], description: 'Toggle fullscreen', category: 'Video Player' },
  { keys: ['m'], description: 'Mute / Unmute', category: 'Video Player' },
  { keys: ['←'], description: 'Rewind 10 seconds', category: 'Video Player' },
  { keys: ['→'], description: 'Forward 10 seconds', category: 'Video Player' },
  { keys: ['↑'], description: 'Volume up', category: 'Video Player' },
  { keys: ['↓'], description: 'Volume down', category: 'Video Player' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter shortcuts by search query
  const filteredShortcuts = searchQuery
    ? SHORTCUTS.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SHORTCUTS;

  // Group shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const renderKey = (key: string) => {
    // Map special keys to visual representations
    const keyMap: Record<string, string> = {
      Space: '␣',
      Esc: 'Esc',
      '←': '←',
      '→': '→',
      '↑': '↑',
      '↓': '↓',
    };

    return (
      <kbd className="inline-flex min-w-[2rem] items-center justify-center rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white shadow-sm">
        {keyMap[key] || key}
      </kbd>
    );
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
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-600/20 p-2">
                <Keyboard className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-12rem)] overflow-y-auto p-6">
          {Object.keys(groupedShortcuts).length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No shortcuts found matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition hover:bg-white/10"
                      >
                        <span className="text-sm text-white">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && (
                                <span className="px-1 text-gray-500">then</span>
                              )}
                              {renderKey(key)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-center text-xs text-gray-500">
            Press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-white">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </>
  );
}
