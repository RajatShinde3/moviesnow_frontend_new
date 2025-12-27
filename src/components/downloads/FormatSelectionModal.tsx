/**
 * =============================================================================
 * Format Selection Modal
 * =============================================================================
 * Allows users to choose download format (MP4, MKV, AVI) with detailed info
 */

'use client';

import { useState } from 'react';
import { X, Check, FileVideo, HardDrive, Smartphone, Monitor, Info } from 'lucide-react';

export type DownloadFormat = 'mp4' | 'mkv' | 'avi';

interface FormatInfo {
  format: DownloadFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  fileSize: string;
  compatibility: string[];
  quality: 'high' | 'highest' | 'good';
  recommended: boolean;
  pros: string[];
  cons: string[];
  color: string;
}

interface FormatSelectionModalProps {
  titleName: string;
  onConfirm: (format: DownloadFormat) => void;
  onCancel: () => void;
  preSelectedFormat?: DownloadFormat;
  estimatedSize?: number; // in bytes
}

const formatOptions: FormatInfo[] = [
  {
    format: 'mp4',
    label: 'MP4',
    description: 'Universal format with excellent compatibility',
    icon: <Smartphone className="h-6 w-6" />,
    fileSize: '~100% base size',
    compatibility: ['All devices', 'iOS', 'Android', 'Smart TVs', 'Web browsers'],
    quality: 'high',
    recommended: true,
    pros: [
      'Works on virtually all devices',
      'Smaller file size',
      'Fast streaming capability',
      'Hardware acceleration support',
    ],
    cons: ['Slightly lower quality than MKV', 'Limited subtitle support'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    format: 'mkv',
    label: 'MKV',
    description: 'High-quality format with advanced features',
    icon: <Monitor className="h-6 w-6" />,
    fileSize: '~120% base size',
    compatibility: ['Desktop players', 'VLC', 'Plex', 'Kodi', 'Modern TVs'],
    quality: 'highest',
    recommended: false,
    pros: [
      'Best video quality',
      'Multiple audio tracks',
      'Multiple subtitle support',
      'Chapter markers',
    ],
    cons: ['Larger file size', 'Limited mobile support', 'Not supported on iOS natively'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    format: 'avi',
    label: 'AVI',
    description: 'Legacy format for older devices',
    icon: <HardDrive className="h-6 w-6" />,
    fileSize: '~110% base size',
    compatibility: ['Windows Media Player', 'Older devices', 'Basic players'],
    quality: 'good',
    recommended: false,
    pros: ['Compatible with older devices', 'Simple format', 'Wide software support'],
    cons: [
      'Outdated technology',
      'Larger file size than MP4',
      'Limited features',
      'Poor compression',
    ],
    color: 'from-gray-500 to-gray-600',
  },
];

export default function FormatSelectionModal({
  titleName,
  onConfirm,
  onCancel,
  preSelectedFormat = 'mp4',
  estimatedSize,
}: FormatSelectionModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>(preSelectedFormat);
  const [showDetails, setShowDetails] = useState<DownloadFormat | null>(null);

  const handleConfirm = () => {
    onConfirm(selectedFormat);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getEstimatedSize = (format: DownloadFormat): string => {
    if (!estimatedSize) return 'N/A';

    const multipliers = {
      mp4: 1.0,
      mkv: 1.2,
      avi: 1.1,
    };

    const adjustedSize = estimatedSize * multipliers[format];
    return formatBytes(adjustedSize);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Select Download Format</h2>
            <p className="text-gray-400">{titleName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Format Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {formatOptions.map((option) => (
              <FormatCard
                key={option.format}
                formatInfo={option}
                isSelected={selectedFormat === option.format}
                onSelect={() => setSelectedFormat(option.format)}
                onShowDetails={() => setShowDetails(option.format)}
                estimatedSize={getEstimatedSize(option.format)}
              />
            ))}
          </div>

          {/* Detailed Info Section */}
          {showDetails && (
            <DetailedFormatInfo
              formatInfo={formatOptions.find((f) => f.format === showDetails)!}
              onClose={() => setShowDetails(null)}
            />
          )}

          {/* Comparison Table */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Format Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">MP4</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">MKV</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">AVI</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow label="Quality" values={['High', 'Highest', 'Good']} />
                  <ComparisonRow label="File Size" values={['Smallest', 'Largest', 'Medium']} />
                  <ComparisonRow
                    label="Mobile Support"
                    values={['Excellent', 'Limited', 'Poor']}
                  />
                  <ComparisonRow
                    label="Desktop Support"
                    values={['Excellent', 'Excellent', 'Good']}
                  />
                  <ComparisonRow
                    label="Subtitles"
                    values={['Basic', 'Advanced', 'Basic']}
                  />
                  <ComparisonRow
                    label="Audio Tracks"
                    values={['Single', 'Multiple', 'Single']}
                  />
                  <ComparisonRow
                    label="Streaming"
                    values={['Excellent', 'Good', 'Fair']}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            {estimatedSize && (
              <span>
                Estimated size: <span className="text-white font-medium">{getEstimatedSize(selectedFormat)}</span>
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Continue with {selectedFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Format Card Component
// ─────────────────────────────────────────────────────────────────────────────

function FormatCard({
  formatInfo,
  isSelected,
  onSelect,
  onShowDetails,
  estimatedSize,
}: {
  formatInfo: FormatInfo;
  isSelected: boolean;
  onSelect: () => void;
  onShowDetails: () => void;
  estimatedSize: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
        isSelected
          ? `border-purple-500 bg-purple-500/10`
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      {/* Recommended Badge */}
      {formatInfo.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
            RECOMMENDED
          </span>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Icon and Label */}
      <div className="flex flex-col items-center mb-4">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${formatInfo.color} flex items-center justify-center mb-3`}
        >
          {formatInfo.icon}
        </div>
        <h3 className="text-2xl font-black text-white">{formatInfo.label}</h3>
        <p className="text-sm text-gray-400 text-center mt-1">{formatInfo.description}</p>
      </div>

      {/* Quality Badge */}
      <div className="flex justify-center mb-3">
        <span
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            formatInfo.quality === 'highest'
              ? 'bg-purple-500/20 text-purple-400'
              : formatInfo.quality === 'high'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {formatInfo.quality.toUpperCase()} QUALITY
        </span>
      </div>

      {/* File Size */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-400">Estimated Size</div>
        <div className="text-lg font-bold text-white">{estimatedSize}</div>
      </div>

      {/* Compatibility Preview */}
      <div className="text-center mb-4">
        <div className="text-xs text-gray-500 mb-1">Compatible With</div>
        <div className="text-xs text-gray-400">
          {formatInfo.compatibility.slice(0, 2).join(', ')}
          {formatInfo.compatibility.length > 2 && ` +${formatInfo.compatibility.length - 2} more`}
        </div>
      </div>

      {/* Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails();
        }}
        className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Info className="h-4 w-4" />
        View Details
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detailed Format Info Component
// ─────────────────────────────────────────────────────────────────────────────

function DetailedFormatInfo({
  formatInfo,
  onClose,
}: {
  formatInfo: FormatInfo;
  onClose: () => void;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileVideo className="h-6 w-6 text-purple-400" />
          {formatInfo.label} Format Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div>
          <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Advantages
          </h4>
          <ul className="space-y-2">
            {formatInfo.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
            <X className="h-5 w-5" />
            Limitations
          </h4>
          <ul className="space-y-2">
            {formatInfo.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compatibility */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="font-bold text-white mb-3">Full Compatibility List</h4>
        <div className="flex flex-wrap gap-2">
          {formatInfo.compatibility.map((device, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium"
            >
              {device}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison Row Component
// ─────────────────────────────────────────────────────────────────────────────

function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  const getColorClass = (value: string): string => {
    const lowercaseValue = value.toLowerCase();
    if (
      lowercaseValue.includes('excellent') ||
      lowercaseValue.includes('highest') ||
      lowercaseValue.includes('smallest')
    ) {
      return 'text-green-400';
    }
    if (
      lowercaseValue.includes('good') ||
      lowercaseValue.includes('high') ||
      lowercaseValue.includes('medium')
    ) {
      return 'text-blue-400';
    }
    if (
      lowercaseValue.includes('poor') ||
      lowercaseValue.includes('limited') ||
      lowercaseValue.includes('largest')
    ) {
      return 'text-red-400';
    }
    return 'text-gray-300';
  };

  return (
    <tr className="border-b border-gray-700/50">
      <td className="py-3 px-4 text-gray-300 font-medium">{label}</td>
      {values.map((value, index) => (
        <td key={index} className={`py-3 px-4 text-center font-medium ${getColorClass(value)}`}>
          {value}
        </td>
      ))}
    </tr>
  );
}
