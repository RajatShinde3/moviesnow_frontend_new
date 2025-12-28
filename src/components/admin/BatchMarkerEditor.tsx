// components/admin/BatchMarkerEditor.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Loader2, AlertCircle, Info, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/services';
import { SceneMarkers } from '@/types/sceneMarkers';

interface BatchMarkerEditorProps {
  titleId: string;
  currentMarkers: SceneMarkers | null;
  totalEpisodes: number;
  onClose: () => void;
}

export function BatchMarkerEditor({
  titleId,
  currentMarkers,
  totalEpisodes,
  onClose
}: BatchMarkerEditorProps) {
  const queryClient = useQueryClient();
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);
  const [applyAll, setApplyAll] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const batchMutation = useMutation({
    mutationFn: async () => {
      const episodeIds = applyAll
        ? Array.from({ length: totalEpisodes }, (_, i) => String(i + 1))
        : selectedEpisodes.map(String);

      // Batch update markers - API method placeholder
      const response = await fetch(`/api/v1/admin/titles/${titleId}/scene-markers/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeIds, markers: currentMarkers })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`✨ Successfully updated ${data.updated} episodes`, {
        description: 'Scene markers have been applied',
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['sceneMarkers'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to batch update markers', {
        description: 'Please try again or contact support',
      });
    }
  });

  const toggleEpisode = (ep: number) => {
    setSelectedEpisodes(prev =>
      prev.includes(ep) ? prev.filter(e => e !== ep) : [...prev, ep]
    );
  };

  const selectRange = (start: number, end: number) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setSelectedEpisodes(prev => {
      const set = new Set([...prev, ...range]);
      return Array.from(set);
    });
  };

  const applyRange = () => {
    const start = parseInt(rangeStart) || 1;
    const end = parseInt(rangeEnd) || totalEpisodes;
    if (start > 0 && end <= totalEpisodes && start <= end) {
      selectRange(start, end);
      setRangeStart('');
      setRangeEnd('');
    } else {
      toast.error('Invalid range', {
        description: `Please enter a valid range between 1 and ${totalEpisodes}`,
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const markerCount = currentMarkers ? Object.entries(currentMarkers).filter(([k, v]) => v && typeof v === 'object').length : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/20 shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Copy className="w-7 h-7 text-purple-400" />
            </motion.div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Batch Apply Markers
              </h3>
              <p className="text-white/60 mt-1 text-sm">
                Apply current scene markers to multiple episodes at once
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Marker Preview Card */}
        {currentMarkers && markerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">Markers to Apply ({markerCount})</h4>
                <p className="text-sm text-white/60">These timestamps will be copied to selected episodes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(currentMarkers).filter(([k, v]) => v && typeof v === 'object').map(([key, range]: [string, any]) => (
                <motion.div
                  key={key}
                  className="flex items-center justify-between p-3 bg-background-elevated/50 rounded-lg border border-white/5"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="capitalize text-sm font-medium text-white/80">{key}</span>
                  <span className="font-mono text-sm text-blue-400">
                    {formatTime(range.start)} - {formatTime(range.end)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Apply to All Option */}
        <motion.div
          className="mb-6 p-5 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 rounded-xl"
          whileHover={{ borderColor: 'rgba(229, 9, 20, 0.5)' }}
        >
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={applyAll}
                onChange={(e) => setApplyAll(e.target.checked)}
                className="peer w-6 h-6 rounded-lg border-2 border-white/30 bg-white/5 checked:bg-accent-primary checked:border-accent-primary appearance-none cursor-pointer transition-all"
              />
              <Check className="absolute inset-0 m-auto w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">Apply to all {totalEpisodes} episodes</p>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-sm text-white/60 mt-0.5">Override markers for the entire series in one click</p>
            </div>
          </label>
        </motion.div>

        {/* Episode Selection */}
        <AnimatePresence mode="wait">
          {!applyAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              {/* Selection Tools */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Select Episodes</h4>
                <div className="flex gap-2 text-sm">
                  <motion.button
                    onClick={() => selectRange(1, totalEpisodes)}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Select All
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedEpisodes([])}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear
                  </motion.button>
                </div>
              </div>

              {/* Range Selector */}
              <div className="mb-4 p-4 bg-background-elevated rounded-xl border border-white/10">
                <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Quick range selection
                </p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-white/60 mb-1.5">From Episode</label>
                    <input
                      type="number"
                      min="1"
                      max={totalEpisodes}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2.5 bg-background-hover border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-white/60 mb-1.5">To Episode</label>
                    <input
                      type="number"
                      min="1"
                      max={totalEpisodes}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      placeholder={String(totalEpisodes)}
                      className="w-full px-3 py-2.5 bg-background-hover border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={applyRange}
                    className="px-6 py-2.5 bg-accent-primary rounded-lg hover:brightness-110 transition-all font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply Range
                  </motion.button>
                </div>
              </div>

              {/* Episode Grid */}
              <div className="grid grid-cols-10 gap-2 max-h-72 overflow-y-auto p-3 bg-background-hover/50 rounded-xl border border-white/5">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                  <motion.button
                    key={ep}
                    onClick={() => toggleEpisode(ep)}
                    className={`
                      relative p-3 rounded-lg text-sm font-semibold transition-all overflow-hidden
                      ${selectedEpisodes.includes(ep)
                        ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }
                    `}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ep * 0.005 }}
                  >
                    {selectedEpisodes.includes(ep) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                    {ep}
                  </motion.button>
                ))}
              </div>

              <motion.p
                className="text-sm text-white/60 mt-3 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={`w-2 h-2 rounded-full ${selectedEpisodes.length > 0 ? 'bg-green-400' : 'bg-white/40'}`} />
                {selectedEpisodes.length} episode{selectedEpisodes.length !== 1 ? 's' : ''} selected
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning for no markers */}
        {markerCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">No markers to apply</p>
              <p className="text-sm text-white/60 mt-1">
                Please set some scene markers before using batch apply
              </p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-white/10">
          <motion.button
            onClick={() => batchMutation.mutate()}
            disabled={(!applyAll && selectedEpisodes.length === 0) || markerCount === 0 || batchMutation.isPending}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {batchMutation.isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Applying markers...
              </>
            ) : (
              <>
                <Copy className="w-6 h-6" />
                Apply to {applyAll ? 'All' : selectedEpisodes.length} Episode{(applyAll || selectedEpisodes.length !== 1) ? 's' : ''}
              </>
            )}
          </motion.button>

          <motion.button
            onClick={onClose}
            disabled={batchMutation.isPending}
            className="px-8 py-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-semibold text-lg disabled:opacity-50"
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
