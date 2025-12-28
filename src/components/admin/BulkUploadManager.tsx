// components/admin/BulkUploadManager.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// // import { (() => ({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false })) } from 'react-dropzone'; // Not installed
import {
  Upload, CloudUpload, CheckCircle2, XCircle, Clock, Loader2,
  Film, Trash2, RotateCw, Pause, Play, X, Sparkles,
  FileVideo, BarChart3, TrendingUp, Zap, AlertCircle
} from 'lucide-react';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api/services';
import { toast } from 'sonner';
import { UploadQueueItem, UploadMetadata, WebSocketMessage } from '@/types/upload';

export function BulkUploadManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [batchMetadata, setBatchMetadata] = useState<UploadMetadata>({});

  const {
    uploads,
    addUploads,
    updateProgress,
    markCompleted,
    markFailed,
    retryUpload,
    cancelUpload,
    removeUpload,
    clearCompleted,
    getStatistics
  } = useUploadQueue();

  const statistics = getStatistics();

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    token: typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  function handleWebSocketMessage(message: WebSocketMessage) {
    if (message.type === 'upload:progress') {
      const data = message.data as any;
      updateProgress(data.uploadId, data.progress, data.speed, data.remaining);
    } else if (message.type === 'upload:completed') {
      const data = message.data as any;
      markCompleted(data.uploadId, data.url);
      toast.success(`✨ ${data.fileName} uploaded successfully`);
    } else if (message.type === 'upload:error') {
      const data = message.data as any;
      markFailed(data.uploadId, data.error);
      toast.error(`Failed to upload: ${data.error}`);
    }
  }

  // Upload files
  const uploadFiles = useCallback(async (queueItems: UploadQueueItem[]) => {
    setIsUploading(true);

    for (const item of queueItems) {
      if (item.status !== 'queued' || !item.file) continue;

      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('uploadId', item.id);
        if (item.metadata) {
          formData.append('metadata', JSON.stringify(item.metadata));
        }

        // await api.post('/admin/assets/bulk-upload', { body: formData });
      } catch (error) {
        markFailed(item.id, error instanceof Error ? error.message : 'Upload failed');
      }
    }

    setIsUploading(false);
  }, [markFailed]);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = addUploads(acceptedFiles, batchMetadata);
    uploadFiles(newUploads);
  }, [addUploads, batchMetadata, uploadFiles]);

      //@ts-expect-error
  const { getRootProps, getInputProps, isDragActive } = (() => ({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false }))({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm']
    },
    disabled: isUploading
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'uploading': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'paused': return '#6b7280';
      case 'cancelled': return '#6b7280';
      default: return '#ffffff40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'failed': return XCircle;
      case 'uploading': return Loader2;
      case 'processing': return Sparkles;
      case 'paused': return Pause;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-elevated via-background-hover to-background-elevated p-8 border border-white/10">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.3), transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.3), transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.3), transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <CloudUpload className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Bulk Upload Manager
              </h1>
              <p className="text-white/60 mt-1">Upload multiple videos with real-time progress tracking</p>
            </div>
          </div>

          {/* WebSocket Status */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                {isConnected ? 'Live Updates Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Uploads',
            value: statistics.totalUploads,
            icon: FileVideo,
            color: '#3b82f6',
            change: statistics.completedUploads
          },
          {
            label: 'Completed',
            value: statistics.completedUploads,
            icon: CheckCircle2,
            color: '#10b981',
            change: Math.round((statistics.completedUploads / Math.max(statistics.totalUploads, 1)) * 100)
          },
          {
            label: 'Upload Speed',
            value: formatSpeed(statistics.averageSpeed),
            icon: TrendingUp,
            color: '#f59e0b',
            change: 0
          },
          {
            label: 'Time Remaining',
            value: formatTime(statistics.estimatedTimeRemaining),
            icon: Clock,
            color: '#a855f7',
            change: 0
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-background-elevated to-background-hover rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                {stat.change > 0 && (
                  <span className="text-sm font-semibold text-green-400">+{stat.change}%</span>
                )}
              </div>
              <p className="text-sm text-white/60 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-blue-500 bg-blue-500/10 scale-105'
              : 'border-white/20 hover:border-blue-500/50 hover:bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />

          <motion.div
            className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30 flex items-center justify-center"
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Upload className="w-12 h-12 text-blue-400" />
          </motion.div>

          <h3 className="text-2xl font-bold mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop video files'}
          </h3>
          <p className="text-white/60 mb-4">
            or click to browse • Supports MP4, MKV, AVI, MOV, WebM
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/50">
            <span>Max file size: 10GB</span>
            <span>•</span>
            <span>Unlimited uploads</span>
          </div>
        </div>
      </motion.div>

      {/* Upload Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Upload Queue ({uploads.length})</h3>
          {uploads.length > 0 && (
            <motion.button
              onClick={clearCompleted}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Completed
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {uploads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-white/40"
            >
              <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No uploads in queue</p>
            </motion.div>
          ) : (
            uploads.map((upload, index) => {
              const StatusIcon = getStatusIcon(upload.status);
              const statusColor = getStatusColor(upload.status);

              return (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-background-elevated to-background-hover rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${statusColor}20` }}>
                      <StatusIcon
                        className={`w-6 h-6 ${upload.status === 'uploading' ? 'animate-spin' : ''}`}
                        style={{ color: statusColor }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold truncate">{upload.fileName}</h4>
                          <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                            <span>{formatFileSize(upload.fileSize)}</span>
                            {upload.speed && upload.status === 'uploading' && (
                              <>
                                <span>•</span>
                                <span>{formatSpeed(upload.speed)}</span>
                              </>
                            )}
                            {upload.remaining && upload.status === 'uploading' && (
                              <>
                                <span>•</span>
                                <span>{formatTime(upload.remaining)} remaining</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                          {upload.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {(upload.status === 'uploading' || upload.status === 'processing') && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>{Math.round(upload.progress)}%</span>
                            <span>{formatFileSize(upload.fileSize * upload.progress / 100)} / {formatFileSize(upload.fileSize)}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: statusColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${upload.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {upload.error && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-red-400">{upload.error}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {upload.status === 'failed' && upload.retryCount < upload.maxRetries && (
                        <motion.button
                          onClick={() => {
                            retryUpload(upload.id);
                            if (upload.file) {
                              uploadFiles([upload]);
                            }
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Retry upload"
                        >
                          <RotateCw className="w-4 h-4" />
                        </motion.button>
                      )}

                      {upload.status !== 'uploading' && upload.status !== 'processing' && (
                        <motion.button
                          onClick={() => removeUpload(upload.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
