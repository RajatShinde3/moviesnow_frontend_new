"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Target,
  Film,
  Tv,
  FileVideo,
  BookOpen,
  X,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { AdConfig } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data/DataTable";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

const AD_TYPES = [
  { value: "pre-roll", label: "Pre-Roll", description: "Plays before content starts", color: "blue" },
  { value: "mid-roll", label: "Mid-Roll", description: "Plays during content", color: "purple" },
  { value: "pause", label: "Pause Ad", description: "Displays when paused", color: "amber" },
  { value: "post-roll", label: "Post-Roll", description: "Plays after content ends", color: "green" },
] as const;

const CONTENT_TYPES = [
  { value: "movie", label: "Movies", icon: Film, color: "blue" },
  { value: "series", label: "Series", icon: Tv, color: "purple" },
  { value: "anime", label: "Anime", icon: FileVideo, color: "pink" },
  { value: "documentary", label: "Documentaries", icon: BookOpen, color: "green" },
] as const;

const USER_TYPES = [
  { value: "free", label: "Free Users", description: "Users without subscription" },
  { value: "trial", label: "Trial Users", description: "Users in trial period" },
] as const;

export default function AdConfigurationPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);

  // Form state
  const [adType, setAdType] = useState<"pre-roll" | "mid-roll" | "pause" | "post-roll">("pre-roll");
  const [adUrl, setAdUrl] = useState("");
  const [frequency, setFrequency] = useState("1");
  const [duration, setDuration] = useState("");
  const [skipAfter, setSkipAfter] = useState("");
  const [targetContentTypes, setTargetContentTypes] = useState<string[]>([]);
  const [targetUserTypes, setTargetUserTypes] = useState<string[]>(["free"]);
  const [enabled, setEnabled] = useState(true);

  // Fetch ad configs
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin", "monetization", "ads"],
    queryFn: () => api.monetization.listAdConfigs(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      ad_type: "pre-roll" | "mid-roll" | "pause" | "post-roll";
      ad_url: string;
      frequency?: number;
      duration?: number;
      enabled?: boolean;
      skip_after?: number;
      target_content_types?: ("movie" | "series" | "anime" | "documentary")[];
      target_user_types?: ("free" | "trial")[];
    }) => api.monetization.createAdConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "ads"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      adId: string;
      updates: {
        ad_url?: string;
        frequency?: number;
        duration?: number;
        enabled?: boolean;
        skip_after?: number;
        target_content_types?: ("movie" | "series" | "anime" | "documentary")[];
        target_user_types?: ("free" | "trial")[];
      };
    }) => api.monetization.updateAdConfig(data.adId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "ads"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (adId: string) => api.monetization.deleteAdConfig(adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "ads"] });
      setDeleteAdId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingAd(null);
    setAdType("pre-roll");
    setAdUrl("");
    setFrequency("1");
    setDuration("");
    setSkipAfter("");
    setTargetContentTypes([]);
    setTargetUserTypes(["free"]);
    setEnabled(true);
  };

  const openEditModal = (ad: AdConfig) => {
    setEditingAd(ad);
    setAdType(ad.ad_type);
    setAdUrl(ad.ad_url);
    setFrequency(ad.frequency.toString());
    setDuration(ad.duration?.toString() || "");
    setSkipAfter(ad.skip_after?.toString() || "");
    setTargetContentTypes(ad.target_content_types || []);
    setTargetUserTypes(ad.target_user_types || ["free"]);
    setEnabled(ad.enabled);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const adData = {
      ad_type: adType,
      ad_url: adUrl,
      frequency: parseInt(frequency),
      duration: duration ? parseInt(duration) : undefined,
      skip_after: skipAfter ? parseInt(skipAfter) : undefined,
      target_content_types:
        targetContentTypes.length > 0
          ? (targetContentTypes as ("movie" | "series" | "anime" | "documentary")[])
          : undefined,
      target_user_types:
        targetUserTypes.length > 0 ? (targetUserTypes as ("free" | "trial")[]) : undefined,
      enabled,
    };

    if (editingAd) {
      const { ad_type, ...updates } = adData;
      updateMutation.mutate({ adId: editingAd.id, updates });
    } else {
      createMutation.mutate(adData);
    }
  };

  const toggleContentType = (type: string) => {
    setTargetContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleUserType = (type: string) => {
    setTargetUserTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Calculate stats
  const enabledAds = ads.filter((a) => a.enabled);
  const totalFrequency = ads.reduce((sum, a) => sum + a.frequency, 0);

  // DataTable columns
  const columns = [
    {
      header: "Type",
      accessor: "ad_type" as keyof AdConfig,
      cell: (value: any) => {
        const type = AD_TYPES.find((t) => t.value === value);
        return (
          <div>
            <div className="text-white font-medium">{type?.label}</div>
            <div className="text-xs text-slate-400">{type?.description}</div>
          </div>
        );
      },
    },
    {
      header: "Frequency",
      accessor: "frequency" as keyof AdConfig,
      cell: (value: any, row: AdConfig) => (
        <div>
          <div className="text-white font-bold">Every {value} {row.ad_type === "mid-roll" ? "minutes" : "play"}</div>
        </div>
      ),
    },
    {
      header: "Duration",
      accessor: "duration" as keyof AdConfig,
      cell: (value: any) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-white">{value ? `${value}s` : "Variable"}</span>
        </div>
      ),
    },
    {
      header: "Skip After",
      accessor: "skip_after" as keyof AdConfig,
      cell: (value: any) => (
        <span className="text-white">{value ? `${value}s` : "Non-skippable"}</span>
      ),
    },
    {
      header: "Targeting",
      accessor: "target_content_types" as keyof AdConfig,
      cell: (value: any, row: AdConfig) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">
            {value && value.length > 0 ? `${value.length} content types` : "All content"}
          </div>
          <div className="text-xs text-slate-400">
            {row.target_user_types && row.target_user_types.length > 0
              ? row.target_user_types.join(", ")
              : "All users"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "enabled" as keyof AdConfig,
      cell: (value: any) =>
        value ? (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Disabled</span>
          </div>
        ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof AdConfig,
      cell: (value: any, row: AdConfig) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteAdId(value.toString())}
            className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <PlayCircle className="w-8 h-8 text-blue-400" />
              Ad Configuration Manager
            </h1>
            <p className="text-slate-400">
              Configure ad placements, frequency, and targeting for free users
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Ad Configuration
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <PlayCircle className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{ads.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Ad Configs</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{enabledAds.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Enabled</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{totalFrequency}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Frequency</p>
          </div>
        </motion.div>

        {/* Ad Configs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
        >
          <DataTable
            data={ads}
            columns={columns}
            searchable
            searchPlaceholder="Search ad configurations..."
            emptyMessage="No ad configurations found"
          />
        </motion.div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeModal}
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
                    <h2 className="text-2xl font-bold text-white">
                      {editingAd ? "Edit" : "Add"} Ad Configuration
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Ad Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Ad Type *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AD_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setAdType(type.value)}
                          disabled={!!editingAd}
                          className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                            adType === type.value
                              ? `border-${type.color}-500 bg-${type.color}-500/10`
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium text-white mb-1">
                              {type.label}
                            </div>
                            <div className="text-xs text-slate-400">{type.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ad URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ad URL * (VAST/VPAID URL or Video URL)
                    </label>
                    <input
                      type="url"
                      value={adUrl}
                      onChange={(e) => setAdUrl(e.target.value)}
                      required
                      placeholder="https://example.com/ad-vast.xml"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Frequency, Duration, Skip After */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Frequency *
                      </label>
                      <input
                        type="number"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        required
                        min="1"
                        placeholder="1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {adType === "mid-roll" ? "Minutes between ads" : "Plays per session"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        placeholder="30"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Skip After (seconds)
                      </label>
                      <input
                        type="number"
                        value={skipAfter}
                        onChange={(e) => setSkipAfter(e.target.value)}
                        min="0"
                        placeholder="5"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Leave empty for non-skippable
                      </p>
                    </div>
                  </div>

                  {/* Target Content Types */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Target Content Types (Optional - Leave empty for all)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CONTENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => toggleContentType(type.value)}
                            className={`p-4 rounded-lg border transition-all ${
                              targetContentTypes.includes(type.value)
                                ? `border-${type.color}-500 bg-${type.color}-500/10`
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Icon className="w-6 h-6 text-white" />
                              <span className="text-sm text-white">{type.label}</span>
                              {targetContentTypes.includes(type.value) && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target User Types */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Target User Types *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {USER_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => toggleUserType(type.value)}
                          className={`p-4 rounded-lg border transition-all ${
                            targetUserTypes.includes(type.value)
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-left">
                            <div className="text-white font-medium mb-1">{type.label}</div>
                            <div className="text-xs text-slate-400">{type.description}</div>
                            {targetUserTypes.includes(type.value) && (
                              <CheckCircle className="w-4 h-4 text-blue-400 mt-2" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enabled Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white">Enable this ad configuration</span>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !adUrl ||
                        !frequency ||
                        targetUserTypes.length === 0 ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingAd
                          ? "Update Configuration"
                          : "Create Configuration"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteAdId !== null}
          onClose={() => setDeleteAdId(null)}
          onConfirm={() => deleteAdId && deleteMutation.mutate(deleteAdId)}
          title="Delete Ad Configuration"
          description="Are you sure you want to delete this ad configuration? This will stop showing ads for this placement. This action cannot be undone."
          confirmText="Delete Configuration"
          isDestructive
        />
      </div>
    </div>
  );
}
