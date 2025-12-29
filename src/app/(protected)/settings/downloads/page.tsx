// app/(protected)/settings/downloads/page.tsx
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Download History - Enterprise-Grade Premium Design
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✨ Download history tracking
 * ✨ Quality indicators (480p/720p/1080p)
 * ✨ Download again functionality
 * ✨ Storage statistics
 * ✨ Clear history option
 * ✨ Beautiful glassmorphism design
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Film,
  Tv,
  HardDrive,
  Clock,
  ArrowLeft,
  RotateCcw,
  Trash2,
  Calendar,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ══════════════════════════════════════════════════════════════════════════════
// Types & Mock Data
// ══════════════════════════════════════════════════════════════════════════════

interface DownloadItem {
  id: string;
  title: string;
  type: "movie" | "episode";
  quality: "480p" | "720p" | "1080p";
  size: number; // in MB
  downloadedAt: string;
  thumbnail: string;
}

const MOCK_DOWNLOADS: DownloadItem[] = [
  {
    id: "1",
    title: "The Dark Knight",
    type: "movie",
    quality: "1080p",
    size: 2400,
    downloadedAt: "2025-12-28T10:30:00Z",
    thumbnail: "/api/placeholder/300/450",
  },
  {
    id: "2",
    title: "Breaking Bad S01E01",
    type: "episode",
    quality: "720p",
    size: 850,
    downloadedAt: "2025-12-27T15:45:00Z",
    thumbnail: "/api/placeholder/300/450",
  },
  {
    id: "3",
    title: "Inception",
    type: "movie",
    quality: "1080p",
    size: 2100,
    downloadedAt: "2025-12-25T20:00:00Z",
    thumbnail: "/api/placeholder/300/450",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function DownloadsPage() {
  const [downloads, setDownloads] = React.useState<DownloadItem[]>(MOCK_DOWNLOADS);
  const [clearingAll, setClearingAll] = React.useState(false);

  const totalSize = downloads.reduce((sum, item) => sum + item.size, 0);
  const totalDownloads = downloads.length;

  const formatSize = (mb: number) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(2)} GB`;
    }
    return `${mb} MB`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "1080p":
        return "from-purple-500 to-pink-500";
      case "720p":
        return "from-blue-500 to-cyan-500";
      case "480p":
        return "from-emerald-500 to-green-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDownloads([]);
    setClearingAll(false);
  };

  const handleRemove = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-4">
              <motion.div
                className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-2xl shadow-purple-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Download className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-black text-white">Download History</h1>
                <p className="text-slate-400 mt-1">
                  Track and manage your downloaded content
                </p>
              </div>
            </div>

            {downloads.length > 0 && (
              <motion.button
                onClick={handleClearAll}
                disabled={clearingAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {clearingAll ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-red-400 border-t-transparent rounded-full"
                    />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Clear All
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 ring-2 ring-blue-500/30">
                <Download className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Total Downloads</span>
            </div>
            <p className="text-3xl font-black text-white">{totalDownloads}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 ring-2 ring-purple-500/30">
                <HardDrive className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Total Size</span>
            </div>
            <p className="text-3xl font-black text-white">{formatSize(totalSize)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-2 ring-2 ring-emerald-500/30">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Most Recent</span>
            </div>
            <p className="text-xl font-bold text-white truncate">
              {downloads[0]?.title || "None"}
            </p>
          </motion.div>
        </div>

        {/* Downloads List */}
        <AnimatePresence mode="popLayout">
          {downloads.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {downloads.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all">
                    {/* Thumbnail */}
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.type === "movie" ? (
                          <Film className="h-16 w-16 text-slate-700" />
                        ) : (
                          <Tv className="h-16 w-16 text-slate-700" />
                        )}
                      </div>

                      {/* Quality Badge */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg bg-gradient-to-r",
                            getQualityColor(item.quality)
                          )}
                        >
                          {item.quality}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900/80 backdrop-blur-sm border border-slate-700/50">
                          {item.type === "movie" ? "Movie" : "Episode"}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <HardDrive className="h-4 w-4" />
                          <span>{formatSize(item.size)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(item.downloadedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Download Again
                        </motion.button>
                        <motion.button
                          onClick={() => handleRemove(item.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-12 text-center"
            >
              <div className="inline-flex p-6 bg-slate-800/30 border border-slate-700/50 rounded-full mb-6">
                <Download className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No downloads yet
              </h3>
              <p className="text-slate-400 mb-6">
                Your download history will appear here
              </p>
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/50"
                >
                  <Film className="h-5 w-5" />
                  Browse Content
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
