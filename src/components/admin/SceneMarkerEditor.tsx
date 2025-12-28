// components/admin/SceneMarkerEditor.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RotateCcw, Trash2, Sparkles, Copy,
  Play, Pause, SkipForward, SkipBack, Volume2,
  Clock, Zap, Check, AlertCircle, Info
} from 'lucide-react';
import { useSceneMarkers } from '@/hooks/useSceneMarkers';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { SceneMarkerTimeline } from './SceneMarkerTimeline';
import { MarkerList } from './MarkerList';
import { VideoPreview } from './VideoPreview';
import { BatchMarkerEditor } from './BatchMarkerEditor';
import { AutoDetectPanel } from './AutoDetectPanel';

interface SceneMarkerEditorProps {
  titleId: string;
  episodeId?: string;
  videoUrl: string;
  isSeries?: boolean;
  totalEpisodes?: number;
}

export function SceneMarkerEditor({
  titleId,
  episodeId,
  videoUrl,
  isSeries = false,
  totalEpisodes
}: SceneMarkerEditorProps) {
  const {
    markers,
    isLoading,
    hasUnsavedChanges,
    isSaving,
    isAutoDetecting,
    updateMarker,
    clearMarker,
    clearAll,
    save,
    revert,
    autoDetect
  } = useSceneMarkers(titleId, episodeId);

  const {
    videoRef,
    metadata,
    togglePlay,
    seekTo,
    skip,
    setVolume,
    jumpToMarker
  } = useVideoPlayer();

  const [showBatchEditor, setShowBatchEditor] = useState(false);
  const [showAutoDetect, setShowAutoDetect] = useState(false);

  // Format time display
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <motion.div
          className="relative w-20 h-20 mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-accent-primary/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-primary" />
        </motion.div>
        <p className="text-white/60 text-lg">Loading scene markers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-elevated via-background-hover to-background-elevated p-8 border border-white/10 shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 20% 50%, rgba(229, 9, 20, 0.15), transparent 50%), radial-gradient(circle at 80% 50%, rgba(229, 9, 20, 0.1), transparent 50%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl border border-accent-primary/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Sparkles className="w-6 h-6 text-accent-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Scene Marker Editor
              </h2>
            </div>
            <p className="text-white/60 text-sm ml-16">
              Mark intro, recap, opening, ending, and preview timestamps with precision
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isSeries && totalEpisodes && (
              <motion.button
                onClick={() => setShowBatchEditor(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center gap-2 border border-purple-500/30 font-semibold shadow-lg shadow-purple-500/10"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" />
                Batch Apply
              </motion.button>
            )}

            <motion.button
              onClick={() => setShowAutoDetect(true)}
              disabled={isAutoDetecting}
              className="px-5 py-2.5 bg-gradient-to-r from-accent-secondary/20 to-yellow-500/20 text-accent-secondary rounded-xl hover:from-accent-secondary/30 hover:to-yellow-500/30 transition-all flex items-center gap-2 disabled:opacity-50 border border-accent-secondary/30 font-semibold shadow-lg shadow-accent-secondary/10"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAutoDetecting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-accent-secondary/30 border-t-accent-secondary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Detecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Detect
                </>
              )}
            </motion.button>

            <motion.button
              onClick={clearAll}
              disabled={!markers}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 rounded-xl hover:from-red-500/30 hover:to-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 font-semibold shadow-lg shadow-red-500/10"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Video Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <VideoPreview
          //@ts-expect-error
          videoRef={videoRef}
          videoUrl={videoUrl}
          metadata={metadata}
        />
      </motion.div>

      {/* Playback Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl p-6 border border-white/10 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Play Controls */}
          <div className="flex items-center gap-3">
            {/* Skip Back */}
            <motion.button
              onClick={() => skip(-10)}
              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Back 10s"
            >
              <SkipBack className="w-5 h-5 group-hover:text-accent-primary transition-colors" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              onClick={togglePlay}
              className="p-4 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full hover:brightness-110 transition-all shadow-lg shadow-accent-primary/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {metadata.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </motion.button>

            {/* Skip Forward */}
            <motion.button
              onClick={() => skip(10)}
              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Forward 10s"
            >
              <SkipForward className="w-5 h-5 group-hover:text-accent-primary transition-colors" />
            </motion.button>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-3 px-6 py-3 bg-black/20 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-accent-primary" />
            <div className="flex items-center gap-2 text-lg font-mono font-semibold">
              <span className="text-white">{formatTime(metadata.currentTime)}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/60">{formatTime(metadata.duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="ml-auto flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-white/60" />
            <div className="relative w-32 h-2 bg-white/10 rounded-full group cursor-pointer">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={metadata.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                style={{ width: `${metadata.volume * 100}%` }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                style={{ left: `calc(${metadata.volume * 100}% - 8px)` }}
                whileHover={{ scale: 1.3 }}
              />
            </div>
            <span className="text-sm font-mono text-white/60 w-12">
              {Math.round(metadata.volume * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Timeline Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SceneMarkerTimeline
          markers={markers}
          duration={metadata.duration}
          currentTime={metadata.currentTime}
          onUpdateMarker={updateMarker}
          onSeek={seekTo}
          onJumpToMarker={jumpToMarker}
        />
      </motion.div>

      {/* Marker List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MarkerList
          markers={markers}
          currentTime={metadata.currentTime}
          onUpdateMarker={updateMarker}
          onClearMarker={clearMarker}
          onJumpTo={jumpToMarker}
        />
      </motion.div>

      {/* Save/Revert Floating Panel */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 bg-gradient-to-br from-background-elevated to-background-hover border border-white/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl z-40"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 blur-xl -z-10" />

            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Unsaved Changes</h4>
                <p className="text-sm text-white/60">Don't forget to save your scene markers</p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={save}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 shadow-lg shadow-green-500/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={revert}
                disabled={isSaving}
                className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 font-semibold disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-5 h-5" />
                Revert
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Editor Modal */}
      <AnimatePresence>
        {showBatchEditor && (
          <BatchMarkerEditor
            titleId={titleId}
            currentMarkers={markers}
            totalEpisodes={totalEpisodes || 0}
            onClose={() => setShowBatchEditor(false)}
          />
        )}
      </AnimatePresence>

      {/* Auto-Detect Panel */}
      <AnimatePresence>
        {showAutoDetect && (
          <AutoDetectPanel
            onDetect={autoDetect}
            onClose={() => setShowAutoDetect(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Toast Placeholder */}
      <AnimatePresence>
        {!hasUnsavedChanges && !isLoading && markers && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 z-40"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">All changes saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
