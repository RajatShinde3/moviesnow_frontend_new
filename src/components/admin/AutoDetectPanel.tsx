// components/admin/AutoDetectPanel.tsx
'use client';

import { motion } from 'framer-motion';
import { X, Sparkles, Info } from 'lucide-react';

interface AutoDetectPanelProps {
  onDetect: () => void;
  onClose: () => void;
}

export function AutoDetectPanel({ onDetect, onClose }: AutoDetectPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background-elevated rounded-xl border border-white/20 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-secondary/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-accent-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Auto-Detect Markers</h3>
              <p className="text-sm text-white/60">AI-powered scene detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">How it works</p>
                <p className="text-white/60">
                  Our AI analyzes the video to automatically detect:
                </p>
                <ul className="mt-2 space-y-1 text-white/60">
                  <li>• Opening sequences</li>
                  <li>• Recap sections</li>
                  <li>• Theme songs (for anime)</li>
                  <li>• End credits</li>
                  <li>• Next episode previews</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              Note: Auto-detection may take 1-2 minutes depending on video length. You can review and adjust the detected markers before saving.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={() => {
              onDetect();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-accent-secondary rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5" />
            Start Auto-Detection
          </motion.button>

          <motion.button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
