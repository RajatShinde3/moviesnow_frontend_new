"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  TrendingUp,
  Target,
  Film,
  Tv,
  FileVideo,
  BookOpen,
  X,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { DownloadRedirect } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data/DataTable";
import { ConfirmDialog } from "@/components/ui";

const QUALITY_OPTIONS = [
  { value: "480p", label: "SD (480p)", color: "green" },
  { value: "720p", label: "HD (720p)", color: "blue" },
  { value: "1080p", label: "Full HD (1080p)", color: "purple" },
] as const;

const CONTENT_TYPES = [
  { value: "movie", label: "Movies", icon: Film, color: "blue" },
  { value: "series", label: "Series", icon: Tv, color: "purple" },
  { value: "anime", label: "Anime", icon: FileVideo, color: "pink" },
  { value: "documentary", label: "Documentaries", icon: BookOpen, color: "green" },
] as const;

export default function DownloadRedirectsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<DownloadRedirect | null>(null);
  const [deleteRedirectId, setDeleteRedirectId] = useState<string | null>(null);

  // Form state
  const [redirectUrl, setRedirectUrl] = useState("");
  const [waitTime, setWaitTime] = useState("30");
  const [quality, setQuality] = useState<"480p" | "720p" | "1080p" | undefined>(undefined);
  const [contentType, setContentType] = useState<"movie" | "series" | "anime" | "documentary" | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);

  // Fetch redirects
  const { data: redirects = [], isLoading } = useQuery({
    queryKey: ["admin", "monetization", "download-redirects"],
    queryFn: () => api.monetization.listDownloadRedirects(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      redirect_url: string;
      wait_time: number;
      quality?: "480p" | "720p" | "1080p";
      content_type?: "movie" | "series" | "anime" | "documentary";
      is_active?: boolean;
    }) => api.monetization.createDownloadRedirect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "download-redirects"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      redirectId: string;
      updates: {
        redirect_url?: string;
        wait_time?: number;
        quality?: "480p" | "720p" | "1080p";
        content_type?: "movie" | "series" | "anime" | "documentary";
        is_active?: boolean;
      };
    }) => api.monetization.updateDownloadRedirect(data.redirectId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "download-redirects"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (redirectId: string) => api.monetization.deleteDownloadRedirect(redirectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "download-redirects"] });
      setDeleteRedirectId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingRedirect(null);
    setRedirectUrl("");
    setWaitTime("30");
    setQuality(undefined);
    setContentType(undefined);
    setIsActive(true);
  };

  const openEditModal = (redirect: DownloadRedirect) => {
    setEditingRedirect(redirect);
    setRedirectUrl(redirect.redirect_url);
    setWaitTime(redirect.wait_time.toString());
    setQuality(redirect.quality);
    setContentType(redirect.content_type);
    setIsActive(redirect.is_active);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const redirectData = {
      redirect_url: redirectUrl,
      wait_time: parseInt(waitTime),
      quality,
      content_type: contentType,
      is_active: isActive,
    };

    if (editingRedirect) {
      updateMutation.mutate({ redirectId: editingRedirect.id, updates: redirectData });
    } else {
      createMutation.mutate(redirectData);
    }
  };

  // Calculate stats
  const activeRedirects = redirects.filter((r) => r.is_active);
  const totalClicks = redirects.reduce((sum, r) => sum + r.click_count, 0);
  const totalConversions = redirects.reduce((sum, r) => sum + r.conversion_count, 0);
  const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // DataTable columns
  const columns = [
    {
      header: "Redirect URL",
      accessor: "redirect_url" as keyof DownloadRedirect,
      cell: (value: any) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="truncate max-w-xs">{value}</span>
        </a>
      ),
    },
    {
      header: "Wait Time",
      accessor: "wait_time" as keyof DownloadRedirect,
      cell: (value: any) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-white font-medium">{value}s</span>
        </div>
      ),
    },
    {
      header: "Targeting",
      accessor: "quality" as keyof DownloadRedirect,
      cell: (value: any, row: DownloadRedirect) => (
        <div className="space-y-1">
          <div className="text-white">
            {value ? (
              <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium rounded">
                {value}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">All qualities</span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            {row.content_type ? row.content_type : "All content"}
          </div>
        </div>
      ),
    },
    {
      header: "Performance",
      accessor: "click_count" as keyof DownloadRedirect,
      cell: (value: any, row: DownloadRedirect) => {
        const conversionRate = value > 0 ? (row.conversion_count / value) * 100 : 0;
        return (
          <div className="space-y-1">
            <div className="text-white">{value.toLocaleString()} clicks</div>
            <div className="text-xs text-slate-400">
              {row.conversion_count.toLocaleString()} conversions ({conversionRate.toFixed(1)}%)
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "is_active" as keyof DownloadRedirect,
      cell: (value: any) =>
        value ? (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Inactive</span>
          </div>
        ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof DownloadRedirect,
      cell: (value: any, row: DownloadRedirect) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteRedirectId(value.toString())}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <ExternalLink className="w-8 h-8 text-orange-400" />
              Download Redirect Manager
            </h1>
            <p className="text-slate-400">
              Configure download redirect URLs for free users with ad monetization
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Redirect
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <ExternalLink className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{redirects.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Redirects</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{activeRedirects.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Active Redirects</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{totalClicks.toLocaleString()}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Clicks</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{avgConversionRate.toFixed(1)}%</span>
            </div>
            <p className="text-slate-400 text-sm">Avg Conversion Rate</p>
          </div>
        </motion.div>

        {/* Redirects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
        >
          <DataTable
            data={redirects}
            columns={columns}
            searchPlaceholder="Search redirect URLs..."
            emptyMessage="No download redirects found"
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
                      {editingRedirect ? "Edit" : "Add"} Download Redirect
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
                  {/* Redirect URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Redirect URL * (External Ad Website)
                    </label>
                    <input
                      type="url"
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      required
                      placeholder="https://ad-network.com/redirect?..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Free users will be redirected here before download
                    </p>
                  </div>

                  {/* Wait Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Wait Time (seconds) *
                    </label>
                    <input
                      type="number"
                      value={waitTime}
                      onChange={(e) => setWaitTime(e.target.value)}
                      required
                      min="5"
                      max="120"
                      placeholder="30"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Time users must wait before download link appears (5-120 seconds)
                    </p>
                  </div>

                  {/* Quality Targeting */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Target Quality (Optional - Leave empty for all)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setQuality(undefined)}
                        className={`p-3 rounded-lg border transition-all ${
                          quality === undefined
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-white">All Qualities</div>
                          {quality === undefined && (
                            <CheckCircle className="w-4 h-4 text-orange-400 mx-auto mt-2" />
                          )}
                        </div>
                      </button>
                      {QUALITY_OPTIONS.map((q) => (
                        <button
                          key={q.value}
                          type="button"
                          onClick={() => setQuality(q.value)}
                          className={`p-3 rounded-lg border transition-all ${
                            quality === q.value
                              ? `border-${q.color}-500 bg-${q.color}-500/10`
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-sm font-medium text-white">{q.label}</div>
                            {quality === q.value && (
                              <CheckCircle className={`w-4 h-4 text-${q.color}-400 mx-auto mt-2`} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Type Targeting */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Target Content Type (Optional - Leave empty for all)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <button
                        type="button"
                        onClick={() => setContentType(undefined)}
                        className={`p-4 rounded-lg border transition-all ${
                          contentType === undefined
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Target className="w-6 h-6 text-white" />
                          <span className="text-sm text-white">All Types</span>
                          {contentType === undefined && (
                            <CheckCircle className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                      </button>
                      {CONTENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setContentType(type.value)}
                            className={`p-4 rounded-lg border transition-all ${
                              contentType === type.value
                                ? `border-${type.color}-500 bg-${type.color}-500/10`
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Icon className="w-6 h-6 text-white" />
                              <span className="text-sm text-white">{type.label}</span>
                              {contentType === type.value && (
                                <CheckCircle className={`w-4 h-4 text-${type.color}-400`} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">Active redirect</span>
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
                        !redirectUrl ||
                        !waitTime ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingRedirect
                          ? "Update Redirect"
                          : "Create Redirect"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteRedirectId !== null}
          onClose={() => setDeleteRedirectId(null)}
          onConfirm={() => deleteRedirectId && deleteMutation.mutate(deleteRedirectId)}
          title="Delete Download Redirect"
          message="Are you sure you want to delete this redirect? Free users will no longer see ads before downloads. This action cannot be undone."
          confirmText="Delete Redirect"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
