// app/(protected)/admin/upload/bulk/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Upload, Clock, FileVideo, AlertCircle } from 'lucide-react';
import { BulkUploadManager } from '@/components/admin/BulkUploadManager';

export default function BulkUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background-dark/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Bulk Upload Manager
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Upload multiple content files with real-time progress tracking
              </motion.p>
            </div>

            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Upload className="w-8 h-8 text-accent-primary" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileVideo className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-100 mb-1">Supported Formats</h3>
                <p className="text-sm text-blue-200/60">
                  MP4, MKV, AVI, MOV, WebM up to 50GB per file
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-1">Real-Time Tracking</h3>
                <p className="text-sm text-green-200/60">
                  Live progress updates via WebSocket connection
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <AlertCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-100 mb-1">Auto-Retry</h3>
                <p className="text-sm text-purple-200/60">
                  Failed uploads retry automatically up to 3 times
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bulk Upload Manager Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <BulkUploadManager />
        </motion.div>

        {/* Pro Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            Pro Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div className="flex items-start gap-2">
              <span className="text-accent-primary mt-0.5">•</span>
              <p>
                <strong className="text-white/90">Queue Management:</strong> Add multiple files at once - they'll be processed sequentially to prevent server overload
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-primary mt-0.5">•</span>
              <p>
                <strong className="text-white/90">Connection Status:</strong> Green indicator means WebSocket is connected for real-time updates
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-primary mt-0.5">•</span>
              <p>
                <strong className="text-white/90">Resume Uploads:</strong> If upload fails, use retry button to resume from where it stopped
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-primary mt-0.5">•</span>
              <p>
                <strong className="text-white/90">Performance:</strong> For best results, upload during off-peak hours and ensure stable internet connection
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
