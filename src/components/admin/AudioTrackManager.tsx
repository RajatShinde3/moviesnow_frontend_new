// components/admin/AudioTrackManager.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { (() => ({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false })) } from 'react-dropzone'; // Not installed
import {
  Music, Plus, Trash2, Check, Globe, Star, Volume2,
  Upload, X, Edit3, Save, AlertCircle, Zap, Headphones,
  Radio, // Waveform not available in lucide-react Settings, ChevronDown, FileAudio
} from 'lucide-react';
import { Music as FileAudio, Waves as Waveform, Settings2 as Settings } from 'lucide-react';
import { api } from '@/lib/api/services';
import { toast } from 'sonner';
import {
  AudioTrack,
  TrackType,
  AudioCodec,
  SUPPORTED_LANGUAGES,
  TRACK_TYPES,
  AUDIO_CODECS
} from '@/types/audio-track';

interface AudioTrackManagerProps {
  titleId: string;
}

export function AudioTrackManager({ titleId }: AudioTrackManagerProps) {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTrackType, setSelectedTrackType] = useState<TrackType>('primary');
  const [trackLabel, setTrackLabel] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch audio tracks
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['audioTracks', titleId],
    queryFn: async () => {
      return await api.audioTracks.listTracks(titleId);
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('titleId', titleId);
      formData.append('language', selectedLanguage);
      formData.append('trackType', selectedTrackType);
      formData.append('label', trackLabel);
      formData.append('isDefault', String(isDefault));

      // Upload track - API method not yet implemented
      const response = await fetch('/api/v1/admin/audio-tracks', { method: 'POST', body: formData });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioTracks', titleId] });
      toast.success('✨ Audio track uploaded successfully', {
        description: `${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name} track added`,
      });
      setShowUploadModal(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to upload audio track');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      // Temporarily disabled - needs proper API integration
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioTracks', titleId] });
      toast.success('Track deleted successfully');
    }
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (trackId: string) => {
      // Temporarily disabled - needs proper API integration
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioTracks', titleId] });
      toast.success('Default track updated');
    }
  });

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

      //@ts-expect-error
  const { getRootProps, getInputProps, isDragActive } = (() => ({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false }))({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.aac', '.flac', '.opus', '.ogg', '.m4a']
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending
  });

  const resetForm = () => {
    setSelectedLanguage('en');
    setSelectedTrackType('primary');
    setTrackLabel('');
    setIsDefault(false);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Headphones className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Track Manager
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Manage multi-language audio tracks and commentary
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl hover:brightness-110 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-accent-primary/20"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Audio Track
        </motion.button>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tracks && tracks.length > 0 ? (
            tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all overflow-hidden"
                whileHover={{ scale: 1.01, y: -2 }}
              >
                {/* Animated Background Glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.1), transparent 70%)'
                  }}
                />

                <div className="relative flex items-center gap-6">
                  {/* Icon & Waveform */}
                  <div className="relative">
                    <motion.div
                      className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Music className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    {track.is_default && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full"
                      >
                        <Star className="w-3 h-3 text-white" fill="currentColor" />
                      </motion.div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-semibold">
                            {(track as any).label || `${track.language_name} Audio`}
                          </h4>
                          <span className="text-2xl">
                            {SUPPORTED_LANGUAGES.find(l => l.code === track.language)?.flag}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 font-medium">
                            {(TRACK_TYPES as any)[(track as any).track_type]?.label || 'Unknown'}
                          </span>
                          {track.is_default && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 font-medium flex items-center gap-1.5">
                              <Star className="w-3 h-3" fill="currentColor" />
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Technical Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-background-hover/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                          <FileAudio className="w-3 h-3" />
                          Codec
                        </div>
                        <p className="font-semibold text-sm text-purple-400">{(track as any).metadata.codec}</p>
                      </div>
                      <div className="p-3 bg-background-hover/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                          <Waveform className="w-3 h-3" />
                          Bitrate
                        </div>
                        <p className="font-semibold text-sm text-white/90">{(track as any).metadata.bitrate} kbps</p>
                      </div>
                      <div className="p-3 bg-background-hover/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                          <Radio className="w-3 h-3" />
                          Channels
                        </div>
                        <p className="font-semibold text-sm text-white/90">
                          {(track as any).metadata.channels === 1 ? 'Mono' :
                           (track as any).metadata.channels === 2 ? 'Stereo' :
                           `${(track as any).metadata.channels}.1`}
                        </p>
                      </div>
                      <div className="p-3 bg-background-hover/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                          <Settings className="w-3 h-3" />
                          Size
                        </div>
                        <p className="font-semibold text-sm text-white/90">
                          {formatFileSize((track as any).metadata.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!track.is_default && (
                      <motion.button
                        onClick={() => setDefaultMutation.mutate(track.id)}
                        className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-all border border-yellow-500/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Set as default"
                      >
                        <Star className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => deleteMutation.mutate(track.id)}
                      className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete track"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Headphones className="w-12 h-12 text-white/30" />
              </motion.div>
              <p className="text-white/40 text-lg mb-6">No audio tracks yet</p>
              <motion.button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-accent-primary rounded-xl hover:brightness-110 transition-all inline-flex items-center gap-2 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Upload First Track
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/20 p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Upload Audio Track</h3>
                    <p className="text-white/60 text-sm">Add a new language or commentary track</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                    ${isDragActive
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-white/20 hover:border-accent-primary/50 hover:bg-white/5'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <FileAudio className="w-10 h-10 text-purple-400" />
                  </motion.div>
                  <p className="text-lg font-semibold mb-2">
                    {isDragActive ? 'Drop the audio file here' : 'Drag & drop audio file'}
                  </p>
                  <p className="text-sm text-white/50">
                    or click to browse • MP3, AAC, FLAC, Opus, OGG
                  </p>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Language</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`
                          p-3 rounded-xl border transition-all flex flex-col items-center gap-2
                          ${selectedLanguage === lang.code
                            ? 'bg-accent-primary border-accent-primary text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-xs font-medium">{lang.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Track Type */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Track Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(TRACK_TYPES) as TrackType[]).map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedTrackType(type)}
                        className={`
                          p-4 rounded-xl border transition-all
                          ${selectedTrackType === type
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="font-semibold text-sm">{TRACK_TYPES[type].label}</p>
                        <p className="text-xs text-white/50 mt-1">{TRACK_TYPES[type].description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Optional Label */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackLabel}
                    onChange={(e) => setTrackLabel(e.target.value)}
                    placeholder="e.g., 'Director Commentary', 'English 5.1'"
                    className="w-full px-4 py-3 bg-background-hover border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Default Track */}
                <label className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-5 h-5 rounded border-yellow-500/50 bg-yellow-500/10 checked:bg-yellow-500"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-yellow-300 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Set as default track
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">This will be the primary audio track for playback</p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <motion.button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
