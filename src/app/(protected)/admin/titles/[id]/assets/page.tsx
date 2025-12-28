"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  FileText,
  Film,
  Music,
  Upload,
  Trash2,
  Star,
  CloudOff,
  ExternalLink,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { AdvancedFileUploader } from "@/components/ui/forms/AdvancedFileUploader";
import { ConfirmDialog } from "@/components/ui";

type TabType = "artwork" | "subtitles" | "trailers" | "audio";

export default function AssetManagerPage() {
  const params = useParams();
  const titleId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("artwork");
  const [showUploader, setShowUploader] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: TabType;
    id: string;
  }>({ isOpen: false, type: "artwork", id: "" });
  const [cdnInvalidating, setCdnInvalidating] = useState(false);

  // Fetch all assets
  const { data: artworkData, isLoading: artworkLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "artwork"],
    queryFn: () => api.assets.getArtwork(titleId),
  });

  const { data: subtitlesData, isLoading: subtitlesLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "subtitles"],
    queryFn: () => api.assets.getSubtitles(titleId),
  });

  const { data: trailersData, isLoading: trailersLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "trailers"],
    queryFn: () => api.assets.getTrailers(titleId),
  });

  const { data: audioTracksData, isLoading: audioTracksLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "audio-tracks"],
    queryFn: () => api.audioTracks.listTracks(titleId),
  });

  // Delete mutations
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: TabType; id: string }) => {
      switch (type) {
        case "artwork":
          return api.assets.deleteArtwork(id);
        case "subtitles":
          return api.assets.deleteSubtitle(id);
        case "trailers":
          return api.assets.deleteTrailer(id);
        case "audio":
          return api.audioTracks.deleteTrack(id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "titles", titleId, variables.type],
      });
    },
  });

  // CDN Invalidation mutation
  const invalidateCDN = useMutation({
    mutationFn: async (paths: string[]) => {
      setCdnInvalidating(true);
      return api.assets.invalidateCache({ paths });
    },
    onSettled: () => {
      setCdnInvalidating(false);
    },
  });

  const tabs = [
    {
      id: "artwork" as TabType,
      label: "Artwork",
      icon: Image,
      count: artworkData?.length || 0,
    },
    {
      id: "subtitles" as TabType,
      label: "Subtitles",
      icon: FileText,
      count: subtitlesData?.length || 0,
    },
    {
      id: "trailers" as TabType,
      label: "Trailers",
      icon: Film,
      count: trailersData?.length || 0,
    },
    {
      id: "audio" as TabType,
      label: "Audio Tracks",
      icon: Music,
      count: audioTracksData?.length || 0,
    },
  ];

  const isLoading =
    artworkLoading || subtitlesLoading || trailersLoading || audioTracksLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Asset Manager</h1>
          <p className="text-slate-400">
            Manage artwork, subtitles, trailers, and audio tracks for this title
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload {activeTab === "artwork" ? "Artwork" : activeTab === "subtitles" ? "Subtitle" : activeTab === "trailers" ? "Trailer" : "Audio Track"}
          </button>

          <button
            onClick={() => {
              const paths: string[] = [];
              if (activeTab === "artwork" && artworkData) {
                paths.push(...artworkData.map((a) => a.cdn_url));
              } else if (activeTab === "subtitles" && subtitlesData) {
                paths.push(...subtitlesData.map((s) => s.cdn_url).filter((url): url is string => !!url));
              } else if (activeTab === "trailers" && trailersData) {
                paths.push(...trailersData.map((t) => t.cdn_url));
              }
              if (paths.length > 0) {
                invalidateCDN.mutate(paths);
              }
            }}
            disabled={cdnInvalidating}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <CloudOff className="w-5 h-5" />
            {cdnInvalidating ? "Invalidating..." : "Invalidate CDN Cache"}
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-800 animate-pulse rounded-xl"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
            >
              {/* Artwork Tab */}
              {activeTab === "artwork" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworkData?.map((artwork) => (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden group"
                    >
                      <div className="relative aspect-video bg-slate-800">
                        <img
                          src={artwork.cdn_url}
                          alt={artwork.type}
                          className="w-full h-full object-cover"
                        />
                        {artwork.is_primary && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Primary
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                          <a
                            href={artwork.cdn_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "artwork",
                                id: artwork.id,
                              })
                            }
                            className="px-4 py-2 bg-red-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold capitalize">
                            {artwork.type}
                          </h3>
                          {artwork.language && (
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                              {artwork.language}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          {artwork.width} × {artwork.height} •{" "}
                          {(artwork.file_size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div className="text-xs text-slate-500">
                          {artwork.mime_type}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!artworkData || artworkData.length === 0) && (
                    <div className="col-span-full text-center py-12">
                      <Image className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No artwork uploaded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subtitles Tab */}
              {activeTab === "subtitles" && (
                <div className="space-y-3">
                  {subtitlesData?.map((subtitle) => (
                    <motion.div
                      key={subtitle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">
                                {subtitle.language_name}
                              </h3>
                              {subtitle.is_default && (
                                <span className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-xs rounded">
                                  Default
                                </span>
                              )}
                              {subtitle.is_sdh && (
                                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded">
                                  SDH
                                </span>
                              )}
                              {subtitle.is_forced && (
                                <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded">
                                  Forced
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-400">
                              {subtitle.format?.toUpperCase() || 'N/A'} •{" "}
                              {subtitle.file_size ? (subtitle.file_size / 1024).toFixed(2) : '0'} KB •{" "}
                              {subtitle.language}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={subtitle.cdn_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "subtitles",
                                id: subtitle.id,
                              })
                            }
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!subtitlesData || subtitlesData.length === 0) && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No subtitles uploaded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Trailers Tab */}
              {activeTab === "trailers" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trailersData?.map((trailer) => (
                    <motion.div
                      key={trailer.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
                    >
                      {trailer.thumbnail_url && (
                        <div className="relative aspect-video bg-slate-800">
                          <img
                            src={trailer.thumbnail_url}
                            alt={trailer.name}
                            className="w-full h-full object-cover"
                          />
                          {trailer.is_primary && (
                            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-sm font-semibold rounded-full">
                              <Star className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded">
                            {Math.floor(trailer.duration / 60)}:
                            {(trailer.duration % 60).toString().padStart(2, "0")}
                          </div>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">{trailer.name}</h3>
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                            {trailer.quality}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{(trailer.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{trailer.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={trailer.cdn_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center"
                          >
                            Watch
                          </a>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "trailers",
                                id: trailer.id,
                              })
                            }
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!trailersData || trailersData.length === 0) && (
                    <div className="col-span-full text-center py-12">
                      <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No trailers uploaded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Tracks Tab */}
              {activeTab === "audio" && (
                <div className="space-y-3">
                  {audioTracksData?.map((track) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Music className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">
                                {track.language_name}
                              </h3>
                              {track.is_default && (
                                <span className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-xs rounded">
                                  Default
                                </span>
                              )}
                              {track.is_descriptive_audio && (
                                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded">
                                  Descriptive
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-400">
                              {track.format.toUpperCase()} • {track.bitrate} kbps •{" "}
                              {track.channels}ch • {track.sample_rate} Hz
                            </div>
                            <div className="text-xs text-slate-500">
                              {(track.file_size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={track.cdn_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "audio",
                                id: track.id,
                              })
                            }
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!audioTracksData || audioTracksData.length === 0) && (
                    <div className="text-center py-12">
                      <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No audio tracks uploaded yet</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowUploader(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-2xl w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Upload {activeTab === "artwork" ? "Artwork" : activeTab === "subtitles" ? "Subtitle" : activeTab === "trailers" ? "Trailer" : "Audio Track"}
                </h2>
                <AdvancedFileUploader
                  accept={
                    activeTab === "artwork"
                      ? "image/*"
                      : activeTab === "subtitles"
                        ? ".srt,.vtt,.ass,.ssa"
                        : activeTab === "trailers"
                          ? "video/*"
                          : "audio/*"
                  }
                  maxSize={
                    activeTab === "artwork"
                      ? 10 * 1024 * 1024
                      : activeTab === "trailers"
                        ? 500 * 1024 * 1024
                        : 100 * 1024 * 1024
                  }
                  maxFiles={5}
                  multiple
                  onUpload={async (files) => {
                    // Handle upload logic here
                    console.log("Uploading files:", files);
                  }}
                  onFileRemove={(fileId) => console.log("Removed:", fileId)}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowUploader(false)}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() =>
            setDeleteConfirm({ isOpen: false, type: "artwork", id: "" })
          }
          onConfirm={async () => {
            await deleteMutation.mutateAsync({
              type: deleteConfirm.type,
              id: deleteConfirm.id,
            });
          }}
          title="Delete Asset"
          message="Are you sure you want to delete this asset? This action cannot be undone."
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
