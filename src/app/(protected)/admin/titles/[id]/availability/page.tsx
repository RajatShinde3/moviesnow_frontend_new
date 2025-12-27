"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Globe,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  MapPin,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { AvailabilityWindow } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

const REGIONS = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
];

const WINDOW_TYPES = [
  { value: "theatrical", label: "Theatrical Release", color: "purple" },
  { value: "streaming", label: "Streaming", color: "blue" },
  { value: "download", label: "Download", color: "green" },
  { value: "all", label: "All Platforms", color: "amber" },
] as const;

export default function TitleAvailabilityPage() {
  const params = useParams();
  const titleId = params.id as string;
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<AvailabilityWindow | null>(null);
  const [deleteWindowId, setDeleteWindowId] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [windowType, setWindowType] = useState<"theatrical" | "streaming" | "download" | "all">("streaming");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch availability windows
  const { data: windows = [], isLoading } = useQuery({
    queryKey: ["admin", "titles", titleId, "availability"],
    queryFn: () => api.titleAvailability.list(titleId),
  });

  // Fetch title info for display
  const { data: titleInfo } = useQuery({
    queryKey: ["admin", "titles", titleId],
    queryFn: () => api.titles.getById(titleId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      window_type: string;
      regions: string[];
      start_date: string;
      end_date?: string;
      notes?: string;
    }) => api.titleAvailability.create(titleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "availability"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      windowId: string;
      updates: {
        window_type?: string;
        regions?: string[];
        start_date?: string;
        end_date?: string;
        notes?: string;
      };
    }) => api.titleAvailability.update(titleId, data.windowId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "availability"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (windowId: string) => api.titleAvailability.delete(titleId, windowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", titleId, "availability"] });
      setDeleteWindowId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingWindow(null);
    setSelectedRegions([]);
    setWindowType("streaming");
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  const openEditModal = (window: AvailabilityWindow) => {
    setEditingWindow(window);
    setWindowType(window.window_type as any);
    setSelectedRegions(window.regions);
    setStartDate(window.start_date);
    setEndDate(window.end_date || "");
    setNotes(window.notes || "");
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      window_type: windowType,
      regions: selectedRegions,
      start_date: startDate,
      end_date: endDate || undefined,
      notes: notes || undefined,
    };

    if (editingWindow) {
      updateMutation.mutate({ windowId: editingWindow.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleRegion = (regionCode: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionCode)
        ? prev.filter((r) => r !== regionCode)
        : [...prev, regionCode]
    );
  };

  // Check for conflicts
  const detectConflicts = (window: AvailabilityWindow) => {
    return windows.filter((w) => {
      if (w.id === window.id) return false;

      const windowStart = new Date(window.start_date);
      const windowEnd = window.end_date ? new Date(window.end_date) : null;
      const otherStart = new Date(w.start_date);
      const otherEnd = w.end_date ? new Date(w.end_date) : null;

      // Check date overlap
      const hasDateOverlap = windowEnd && otherEnd
        ? windowStart <= otherEnd && otherStart <= windowEnd
        : true; // If no end date, assume ongoing

      // Check region overlap
      const hasRegionOverlap = window.regions.some((r) => w.regions.includes(r));

      return hasDateOverlap && hasRegionOverlap && w.window_type === window.window_type;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Availability Management
            </h1>
            <p className="text-slate-400">
              {titleInfo?.title || "Loading..."} - Configure regional availability windows
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Availability Window
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
              <Globe className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{windows.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Active Windows</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">
                {new Set(windows.flatMap((w) => w.regions)).size}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Unique Regions</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">
                {windows.reduce((sum, w) => sum + detectConflicts(w).length, 0) / 2}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Potential Conflicts</p>
          </div>
        </motion.div>

        {/* Availability Windows List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {windows.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Availability Windows
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first availability window to configure regional access
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
              >
                Create Availability Window
              </button>
            </div>
          ) : (
            windows.map((window, index) => {
              const conflicts = detectConflicts(window);
              const typeConfig = WINDOW_TYPES.find((t) => t.value === window.window_type);
              const isActive =
                new Date(window.start_date) <= new Date() &&
                (!window.end_date || new Date(window.end_date) >= new Date());

              return (
                <motion.div
                  key={window.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-6 ${
                    conflicts.length > 0
                      ? "border-amber-700/50"
                      : "border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${typeConfig?.color}-500/20 to-${typeConfig?.color}-600/20 border border-${typeConfig?.color}-500/30 flex items-center justify-center`}
                      >
                        <Calendar className={`w-6 h-6 text-${typeConfig?.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {typeConfig?.label}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium rounded">
                              Active Now
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {new Date(window.start_date).toLocaleDateString()} -{" "}
                          {window.end_date
                            ? new Date(window.end_date).toLocaleDateString()
                            : "Ongoing"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(window)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteWindowId(window.id)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Regions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Available Regions ({window.regions.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {window.regions.map((regionCode) => {
                        const region = REGIONS.find((r) => r.code === regionCode);
                        return (
                          <span
                            key={regionCode}
                            className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-white flex items-center gap-2"
                          >
                            <span>{region?.flag}</span>
                            <span>{region?.name || regionCode}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  {window.notes && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-300">{window.notes}</p>
                    </div>
                  )}

                  {/* Conflicts Warning */}
                  {conflicts.length > 0 && (
                    <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-400 mb-1">
                            {conflicts.length} Potential Conflict{conflicts.length > 1 ? "s" : ""}
                          </h4>
                          <p className="text-sm text-amber-300/80">
                            This window overlaps with {conflicts.length} other window
                            {conflicts.length > 1 ? "s" : ""} in the same regions
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
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
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingWindow ? "Edit" : "Create"} Availability Window
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
                  {/* Window Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Window Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {WINDOW_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setWindowType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            windowType === type.value
                              ? `border-${type.color}-500 bg-${type.color}-500/10`
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-sm font-medium text-white mb-1`}>
                              {type.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Leave empty for ongoing availability
                      </p>
                    </div>
                  </div>

                  {/* Region Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Available Regions * ({selectedRegions.length} selected)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {REGIONS.map((region) => (
                        <button
                          key={region.code}
                          type="button"
                          onClick={() => toggleRegion(region.code)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedRegions.includes(region.code)
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{region.flag}</span>
                            <span className="text-sm text-white">{region.code}</span>
                            {selectedRegions.includes(region.code) && (
                              <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add licensing details, restrictions, or other notes..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

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
                        !startDate ||
                        selectedRegions.length === 0 ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingWindow
                          ? "Update Window"
                          : "Create Window"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteWindowId !== null}
          onClose={() => setDeleteWindowId(null)}
          onConfirm={() => deleteWindowId && deleteMutation.mutate(deleteWindowId)}
          title="Delete Availability Window"
          description="Are you sure you want to delete this availability window? This action cannot be undone."
          confirmText="Delete Window"
          isDestructive
        />
      </div>
    </div>
  );
}
