'use client';

/**
 * Subtitle Customizer Component
 * ===============================
 * Advanced subtitle customization with real-time preview
 *
 * Features:
 * - Font size adjustment
 * - Color selection
 * - Background opacity
 * - Position adjustment
 * - Font family selection
 * - Edge style (none, drop shadow, outline)
 * - Real-time preview
 * - Preset templates
 *
 * Best Practices:
 * - Saves preferences to localStorage
 * - Accessible controls
 * - Visual preview
 * - Preset quick options
 */

import React, { useState, useEffect } from 'react';
import { Type, Palette, AlignCenter, Save, RotateCcw } from 'lucide-react';

export interface SubtitleSettings {
  fontSize: number; // percentage (50-200)
  fontFamily: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number; // 0-100
  position: 'top' | 'middle' | 'bottom';
  edgeStyle: 'none' | 'drop-shadow' | 'outline' | 'raised';
  edgeColor: string;
}

interface SubtitleCustomizerProps {
  /** Current subtitle settings */
  settings: SubtitleSettings;
  /** Callback when settings change */
  onChange: (settings: SubtitleSettings) => void;
  /** Whether the customizer is open */
  isOpen: boolean;
  /** Callback to close the customizer */
  onClose: () => void;
}

const DEFAULT_SETTINGS: SubtitleSettings = {
  fontSize: 100,
  fontFamily: 'Arial, sans-serif',
  color: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 75,
  position: 'bottom',
  edgeStyle: 'drop-shadow',
  edgeColor: '#000000',
};

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const COLOR_PRESETS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Yellow', value: '#FFFF00' },
  { label: 'Cyan', value: '#00FFFF' },
  { label: 'Green', value: '#00FF00' },
  { label: 'Magenta', value: '#FF00FF' },
  { label: 'Black', value: '#000000' },
];

const STYLE_PRESETS = [
  { label: 'Default', settings: DEFAULT_SETTINGS },
  {
    label: 'High Contrast',
    settings: {
      ...DEFAULT_SETTINGS,
      fontSize: 110,
      color: '#FFFF00',
      backgroundColor: '#000000',
      backgroundOpacity: 90,
      edgeStyle: 'outline' as const,
    },
  },
  {
    label: 'Minimal',
    settings: {
      ...DEFAULT_SETTINGS,
      fontSize: 90,
      backgroundColor: '#000000',
      backgroundOpacity: 50,
      edgeStyle: 'none' as const,
    },
  },
  {
    label: 'Large',
    settings: {
      ...DEFAULT_SETTINGS,
      fontSize: 150,
      edgeStyle: 'raised' as const,
    },
  },
];

export function SubtitleCustomizer({
  settings,
  onChange,
  isOpen,
  onClose,
}: SubtitleCustomizerProps) {
  const [localSettings, setLocalSettings] = useState<SubtitleSettings>(settings);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (updates: Partial<SubtitleSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onChange(newSettings);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    onChange(DEFAULT_SETTINGS);
  };

  const handlePresetSelect = (preset: SubtitleSettings) => {
    setLocalSettings(preset);
    onChange(preset);
  };

  const getPreviewStyle = (): React.CSSProperties => {
    return {
      fontSize: `${localSettings.fontSize}%`,
      fontFamily: localSettings.fontFamily,
      color: localSettings.color,
      backgroundColor: `${localSettings.backgroundColor}${Math.round((localSettings.backgroundOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
      padding: '4px 12px',
      borderRadius: '4px',
      textShadow:
        localSettings.edgeStyle === 'drop-shadow'
          ? `2px 2px 3px ${localSettings.edgeColor}`
          : localSettings.edgeStyle === 'outline'
          ? `-1px -1px 0 ${localSettings.edgeColor}, 1px -1px 0 ${localSettings.edgeColor}, -1px 1px 0 ${localSettings.edgeColor}, 1px 1px 0 ${localSettings.edgeColor}`
          : localSettings.edgeStyle === 'raised'
          ? `1px 1px 2px ${localSettings.edgeColor}, 2px 2px 4px ${localSettings.edgeColor}99`
          : 'none',
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Customizer Panel */}
      <div
        className="absolute bottom-full right-0 z-50 mb-2 w-96 rounded-lg border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
        role="dialog"
        aria-label="Subtitle customizer"
      >
        {/* Header */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-white" />
              <h3 className="text-sm font-semibold text-white">Subtitle Settings</h3>
            </div>
            <button
              onClick={handleReset}
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {/* Preview */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-gray-400">Preview</label>
            <div className="flex min-h-[80px] items-center justify-center rounded-lg bg-gray-900 p-4">
              <p style={getPreviewStyle()}>Sample subtitle text</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-gray-400">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset.settings)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="mb-2 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Font Size</span>
              <span className="text-white">{localSettings.fontSize}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={localSettings.fontSize}
              onChange={(e) => handleChange({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Font Family</label>
            <select
              value={localSettings.fontFamily}
              onChange={(e) => handleChange({ fontFamily: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value} className="bg-gray-900">
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Color */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Text Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleChange({ color: color.value })}
                  className={`h-10 w-10 rounded-lg border-2 transition ${
                    localSettings.color === color.value
                      ? 'border-white scale-110'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Background Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleChange({ backgroundColor: color.value })}
                  className={`h-10 w-10 rounded-lg border-2 transition ${
                    localSettings.backgroundColor === color.value
                      ? 'border-white scale-110'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Background Opacity */}
          <div className="mb-4">
            <label className="mb-2 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Background Opacity</span>
              <span className="text-white">{localSettings.backgroundOpacity}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localSettings.backgroundOpacity}
              onChange={(e) => handleChange({ backgroundOpacity: parseInt(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>

          {/* Position */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {(['top', 'middle', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => handleChange({ position: pos })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    localSettings.position === pos
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Style */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Edge Style</label>
            <select
              value={localSettings.edgeStyle}
              onChange={(e) => handleChange({ edgeStyle: e.target.value as SubtitleSettings['edgeStyle'] })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="none" className="bg-gray-900">None</option>
              <option value="drop-shadow" className="bg-gray-900">Drop Shadow</option>
              <option value="outline" className="bg-gray-900">Outline</option>
              <option value="raised" className="bg-gray-900">Raised</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-xs text-gray-500">
            Settings are saved automatically
          </p>
        </div>
      </div>
    </>
  );
}
