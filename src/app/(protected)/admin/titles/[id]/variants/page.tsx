"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Upload,
  Edit2,
  Trash2,
  FileVideo,
  HardDrive,
  BarChart3,
  Download,
  Eye,
  TrendingUp,
  Wifi,
  X,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { StreamVariant } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui";
// import { AdvancedFileUploader } from "@/components/ui/data/AdvancedFileUploader";

const QUALITY_OPTIONS = [
  { value: "480p", label: "SD (480p)", bitrate: "1-2 Mbps", color: "green" },
  { value: "720p", label: "HD (720p)", bitrate: "3-5 Mbps", color: "blue" },
  { value: "1080p", label: "Full HD (1080p)", bitrate: "6-8 Mbps", color: "purple" },
  { value: "4K", label: "Ultra HD (4K)", bitrate: "15-25 Mbps", color: "amber" },
] as const;

const FORMAT_OPTIONS = [
  { value: "HLS", label: "HLS (HTTP Live Streaming)" },
  { value: "DASH", label: "DASH (Dynamic Adaptive Streaming)" },
  { value: "MP4", label: "MP4 (Progressive Download)" },
] as const;

export default function QualityVariantsPage() {
  const params = useParams();
  const titleId = params.id as string;
  const queryClient = useQueryClient();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<StreamVariant | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form state
  const [quality, setQuality] = useState<"480p" | "720p" | "1080p" | "4K">("1080p");
  const [format, setFormat] = useState<"HLS" | "DASH" | "MP4">("HLS");
  const [bitrate, setBitrate] = useState("");
  const [resolution, setResolution] = useState("");
  const [codec, setCodec] = useState("H.264");
  const [fileUrl, setFileUrl] = useState("");

  // Fetch variants
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "variants"],
    queryFn: () => api.streamVariants.listVariants(titleId),
  });

  // Fetch variant analytics
  const { data: analytics = {} as any } = useQuery({
    queryKey: ["admin", "titles", titleId, "variants", "analytics"],
    queryFn: () => api.streamVariants.getTitleVariantAnalytics(titleId),
  });

  // Fetch title info
  const { data: titleInfo } = useQuery({
    queryKey: ["admin", "titles", titleId],
    queryFn: () => api.discovery.getTitle(titleId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      quality: string;
      format: string;
      bitrate: number;
      resolution: string;
      codec: string;
      file_url: string;
      //@ts-expect-error
    }) => api.streamVariants.addVariant(titleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "variants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "variants", "analytics"] });
      closeUploadModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      variantId: string;
      updates: {
        quality?: string;
        format?: string;
        bitrate?: number;
        resolution?: string;
        codec?: string;
      };
    }) => api.streamVariants.updateVariant(titleId, data.variantId, data.updates as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "variants"] });
      closeEditModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (variantId: string) => api.streamVariants.updateVariant(titleId, variantId, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "variants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "variants", "analytics"] });
      setDeleteVariantId(null);
    },
  });

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadedFile(null);
    setQuality("1080p");
    setFormat("HLS");
    setBitrate("");
    setResolution("");
    setCodec("H.264");
    setFileUrl("");
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingVariant(null);
  };

  const openEditModal = (variant: StreamVariant) => {
    setEditingVariant(variant);
    setQuality(variant.quality as any);
    setFormat((variant.format || 'HLS') as any);
    setBitrate(variant.bitrate?.toString() || '');
    setResolution(variant.resolution || '');
    setCodec(variant.codec || 'H.264');
    setIsEditModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      quality,
      format,
      bitrate: parseInt(bitrate),
      resolution,
      codec,
      file_url: fileUrl,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVariant) {
      updateMutation.mutate({
        variantId: editingVariant.id,
        updates: {
          quality,
          format,
          bitrate: parseInt(bitrate),
          resolution,
          codec,
        },
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quality Variants Manager
            </h1>
            <p className="text-slate-400">
              {titleInfo?.name || "Loading..."} - Manage streaming quality variants
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload New Variant
          </button>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">
                  {analytics.total_views.toLocaleString()}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Total Views</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Wifi className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-white">
                  {analytics.most_popular_quality}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Most Popular Quality</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">
                  {formatFileSize(analytics.total_storage_used)}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Storage Used</p>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-amber-400" />
                <span className="text-3xl font-bold text-white">
                  {analytics.avg_bitrate.toFixed(1)} Mbps
                </span>
              </div>
              <p className="text-slate-400 text-sm">Avg Bitrate</p>
            </div>
          </motion.div>
        )}

        {/* Variants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {variants.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
              <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Quality Variants
              </h3>
              <p className="text-slate-400 mb-6">
                Upload your first quality variant to enable streaming
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
              >
                Upload Variant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {variants.map((variant, index) => {
                const qualityConfig = QUALITY_OPTIONS.find((q) => q.value === variant.quality);
                const formatConfig = FORMAT_OPTIONS.find((f) => f.value === variant.format);

                return (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-violet-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${qualityConfig?.color}-500/20 to-${qualityConfig?.color}-600/20 border border-${qualityConfig?.color}-500/30 flex items-center justify-center`}
                        >
                          <FileVideo className={`w-6 h-6 text-${qualityConfig?.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {qualityConfig?.label}
                          </h3>
                          <p className="text-sm text-slate-400">{formatConfig?.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(variant)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteVariantId(variant.id)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Variant Details */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Resolution</p>
                          <p className="text-sm font-medium text-white">{variant.resolution}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Bitrate</p>
                          <p className="text-sm font-medium text-white">{variant.bitrate} Mbps</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Codec</p>
                          <p className="text-sm font-medium text-white">{variant.codec}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">File Size</p>
                          <p className="text-sm font-medium text-white">
                            {formatFileSize(variant.file_size || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Analytics */}
                      {analytics && (
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Views</span>
                            <span className="font-medium text-white">
                              {analytics.quality_breakdown?.find((q: any) => q.quality === variant.quality)?.views?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-slate-400">Popularity</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r from-${qualityConfig?.color}-500 to-${qualityConfig?.color}-600`}
                                  style={{
                                    width: `${
                                      analytics.quality_breakdown?.find((q: any) => q.quality === variant.quality)?.percentage || 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="font-medium text-white">
                                {analytics.quality_breakdown?.find((q: any) => q.quality === variant.quality)?.percentage?.toFixed(1) || "0"}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeUploadModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Upload Quality Variant</h2>
                    <button
                      onClick={closeUploadModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Video File *
                    </label>
                    {/* Temporarily disabled: <AdvancedFileUploader
                      accept="video/*,.m3u8,.mpd"
                      maxSize={10737418240}
                      onUploadComplete={(url) => setFileUrl(url)}
                      label="Drop video file or click to upload"
                    /> */}
                    <input
                      type="text"
                      placeholder="Enter video file URL manually"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                  </div>

                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Quality *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {QUALITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setQuality(option.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            quality === option.value
                              ? `border-${option.color}-500 bg-${option.color}-500/10`
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium text-white mb-1">
                              {option.label}
                            </div>
                            <div className="text-xs text-slate-400">{option.bitrate}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Format *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {FORMAT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormat(option.value as any)}
                          className={`p-3 rounded-lg border transition-all ${
                            format === option.value
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-sm font-medium text-white text-center">
                            {option.value}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bitrate (Mbps) *
                      </label>
                      <input
                        type="number"
                        value={bitrate}
                        onChange={(e) => setBitrate(e.target.value)}
                        required
                        min="0.5"
                        step="0.1"
                        placeholder="e.g., 8.5"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resolution *
                      </label>
                      <input
                        type="text"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        required
                        placeholder="e.g., 1920x1080"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Video Codec *
                    </label>
                    <select
                      value={codec}
                      onChange={(e) => setCodec(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="H.264">H.264 (AVC)</option>
                      <option value="H.265">H.265 (HEVC)</option>
                      <option value="VP9">VP9</option>
                      <option value="AV1">AV1</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!fileUrl || !bitrate || !resolution || createMutation.isPending}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending ? "Uploading..." : "Upload Variant"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && editingVariant && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeEditModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Edit Variant Metadata</h2>
                    <button
                      onClick={closeEditModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bitrate (Mbps)
                      </label>
                      <input
                        type="number"
                        value={bitrate}
                        onChange={(e) => setBitrate(e.target.value)}
                        min="0.5"
                        step="0.1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resolution
                      </label>
                      <input
                        type="text"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Video Codec
                    </label>
                    <select
                      value={codec}
                      onChange={(e) => setCodec(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="H.264">H.264 (AVC)</option>
                      <option value="H.265">H.265 (HEVC)</option>
                      <option value="VP9">VP9</option>
                      <option value="AV1">AV1</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteVariantId !== null}
          onClose={() => setDeleteVariantId(null)}
          onConfirm={() => deleteVariantId && deleteMutation.mutate(deleteVariantId)}
          title="Delete Quality Variant"
          message="Are you sure you want to delete this quality variant? Users will no longer be able to stream in this quality. This action cannot be undone."
          confirmText="Delete Variant"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
