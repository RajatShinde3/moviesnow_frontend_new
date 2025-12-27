// components/admin/MarkerHandle.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit3, Play, Clock, Zap } from 'lucide-react';
import { MarkerConfig, MarkerRange } from '@/types/sceneMarkers';

interface MarkerHandleProps {
  config: MarkerConfig;
  range: MarkerRange | undefined;
  currentTime: number;
  onUpdate: (range: MarkerRange) => void;
}

export function MarkerHandle({ config, range, currentTime, onUpdate }: MarkerHandleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  const Icon = config.icon;

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Parse mm:ss or ss to seconds
  const parseTime = (value: string): number => {
    if (value.includes(':')) {
      const [m, s] = value.split(':').map(Number);
      return (m || 0) * 60 + (s || 0);
    }
    return parseInt(value) || 0;
  };

  // Set start time to current
  const setStartToCurrent = () => {
    if (!range) {
      onUpdate({ start: currentTime, end: currentTime + 90 });
    } else {
      onUpdate({ ...range, start: currentTime });
    }
  };

  // Set end time to current
  const setEndToCurrent = () => {
    if (!range) {
      onUpdate({ start: Math.max(0, currentTime - 90), end: currentTime });
    } else {
      onUpdate({ ...range, end: currentTime });
    }
  };

  // Start editing
  const startEdit = () => {
    if (range) {
      setTempStart(formatTime(range.start));
      setTempEnd(formatTime(range.end));
    } else {
      setTempStart('');
      setTempEnd('');
    }
    setIsEditing(true);
  };

  // Save edit
  const saveEdit = () => {
    const start = parseTime(tempStart);
    const end = parseTime(tempEnd);
    if (start < end) {
      onUpdate({ start, end });
      setIsEditing(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setTempStart('');
    setTempEnd('');
  };

  const duration = range ? range.end - range.start : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="group relative bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl p-5 border border-white/10 hover:border-white/30 transition-all overflow-hidden"
      style={{
        borderLeftColor: config.color,
        borderLeftWidth: '4px',
        boxShadow: `0 0 20px ${config.color}15`
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${config.color}10, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <motion.div
          className="p-3 rounded-xl relative overflow-hidden"
          style={{ backgroundColor: `${config.color}20` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-6 h-6 relative z-10" style={{ color: config.color }} />
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: config.color }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.2 }}
          />
        </motion.div>

        <div className="flex-grow">
          <h4 className="font-semibold text-lg">{config.label}</h4>
          <p className="text-xs text-white/50">{config.description}</p>
        </div>

        <AnimatePresence>
          {config.skipByDefault && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="px-3 py-1.5 bg-accent-primary/20 text-accent-primary text-xs rounded-full font-semibold flex items-center gap-1.5 border border-accent-primary/30"
            >
              <Zap className="w-3 h-3" />
              Auto-Skip
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                    <Play className="w-3 h-3" />
                    Start Time (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    placeholder="0:00"
                    className="w-full px-4 py-2.5 bg-background-hover border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent font-mono transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    End Time (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    placeholder="0:00"
                    className="w-full px-4 py-2.5 bg-background-hover border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent font-mono transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:brightness-110 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-4 h-4" />
                  Save
                </motion.button>
                <motion.button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : range ? (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {/* Time Display Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-background-hover/50 rounded-xl border border-white/5">
                  <p className="text-xs text-white/50 mb-1">Start</p>
                  <p className="font-mono font-semibold text-base" style={{ color: config.color }}>
                    {formatTime(range.start)}
                  </p>
                </div>
                <div className="p-3 bg-background-hover/50 rounded-xl border border-white/5">
                  <p className="text-xs text-white/50 mb-1">End</p>
                  <p className="font-mono font-semibold text-base" style={{ color: config.color }}>
                    {formatTime(range.end)}
                  </p>
                </div>
                <div className="p-3 bg-background-hover/50 rounded-xl border border-white/5">
                  <p className="text-xs text-white/50 mb-1">Duration</p>
                  <p className="font-mono font-semibold text-base text-white/90">
                    {formatTime(duration)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: config.color,
                    width: `${Math.min(100, (duration / 180) * 100)}%` // Assume 3 min max
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (duration / 180) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Edit Button */}
              <motion.button
                onClick={startEdit}
                className="w-full px-4 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Edit Times
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="text-center py-4">
                <motion.div
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-8 h-8 text-white/30" />
                </motion.div>
                <p className="text-sm text-white/40 mb-4">No marker set</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={setStartToCurrent}
                    className="px-3 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:brightness-110 transition-all text-xs font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Set Start
                  </motion.button>
                  <motion.button
                    onClick={setEndToCurrent}
                    className="px-3 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:brightness-110 transition-all text-xs font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Set End
                  </motion.button>
                </div>

                <motion.button
                  onClick={startEdit}
                  className="w-full px-4 py-2.5 bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-xl hover:bg-accent-primary/30 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit3 className="w-4 h-4" />
                  Enter Manually
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Time Indicator */}
      <AnimatePresence>
        {range && currentTime >= range.start && currentTime <= range.end && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-2 bg-accent-primary/20 border border-accent-primary/30 rounded-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
            <span className="text-xs font-medium text-accent-primary">Currently in this marker</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
