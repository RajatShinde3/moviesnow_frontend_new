"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Film,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { AnimeArc } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui";

const ARC_TYPES = [
  { value: "canon", label: "Canon", color: "blue", description: "Main storyline" },
  { value: "filler", label: "Filler", color: "slate", description: "Non-canon episodes" },
  { value: "mixed", label: "Mixed", color: "purple", description: "Canon with filler elements" },
] as const;

export default function AnimeArcManagerPage() {
  const params = useParams();
  const animeId = params.id as string;
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArc, setEditingArc] = useState<AnimeArc | null>(null);
  const [deleteArcId, setDeleteArcId] = useState<string | null>(null);

  // Form state
  const [arcName, setArcName] = useState("");
  const [arcType, setArcType] = useState<"canon" | "filler" | "mixed">("canon");
  const [startEpisode, setStartEpisode] = useState("");
  const [endEpisode, setEndEpisode] = useState("");
  const [description, setDescription] = useState("");
  const [mangaChapterStart, setMangaChapterStart] = useState("");
  const [mangaChapterEnd, setMangaChapterEnd] = useState("");
  const [fillerEpisodes, setFillerEpisodes] = useState<number[]>([]);
  const [newFillerEpisode, setNewFillerEpisode] = useState("");

  // Fetch arcs
  const { data: arcs = [], isLoading } = useQuery({
    queryKey: ["admin", "anime", animeId, "arcs"],
    queryFn: () => api.animeArcs.listArcs({ anime_id: animeId }),
  });

  // Fetch anime info
  const { data: animeInfo } = useQuery({
    queryKey: ["admin", "titles", animeId],
    queryFn: () => api.discovery.getTitle(animeId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      anime_id: string;
      name: string;
      arc_type: "canon" | "filler" | "mixed";
      start_episode: number;
      end_episode: number;
      description?: string;
      manga_chapters?: string;
      is_filler?: boolean;
    }) => api.animeArcs.createArc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "anime", animeId, "arcs"] });
      closeModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      arcId: string;
      updates: Partial<AnimeArc>;
    }) => api.animeArcs.updateArc(data.arcId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "anime", animeId, "arcs"] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (arcId: string) => api.animeArcs.deleteArc(arcId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "anime", animeId, "arcs"] });
      setDeleteArcId(null);
    },
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingArc(null);
    setArcName("");
    setArcType("canon");
    setStartEpisode("");
    setEndEpisode("");
    setDescription("");
    setMangaChapterStart("");
    setMangaChapterEnd("");
    setFillerEpisodes([]);
  };

  const openEditModal = (arc: AnimeArc) => {
    setEditingArc(arc);
    setArcName(arc.name);
    setArcType(arc.arc_type);
    setStartEpisode(arc.start_episode.toString());
    setEndEpisode(arc.end_episode.toString());
    setDescription(arc.description || "");
    // Parse manga_chapters string (e.g., "1-50" or "1")
    const chapters = arc.manga_chapters?.split("-") || [];
    setMangaChapterStart(chapters[0] || "");
    setMangaChapterEnd(chapters[1] || chapters[0] || "");
    setFillerEpisodes([]);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build manga_chapters string (e.g., "1-50" or "1")
    let mangaChapters: string | undefined;
    if (mangaChapterStart) {
      if (mangaChapterEnd && mangaChapterEnd !== mangaChapterStart) {
        mangaChapters = `${mangaChapterStart}-${mangaChapterEnd}`;
      } else {
        mangaChapters = mangaChapterStart;
      }
    }

    if (editingArc) {
      updateMutation.mutate({
        arcId: editingArc.id,
        updates: {
          name: arcName,
          arc_type: arcType,
          start_episode: parseInt(startEpisode),
          end_episode: parseInt(endEpisode),
          description: description || undefined,
          manga_chapters: mangaChapters,
          is_filler: arcType === "filler",
        },
      });
    } else {
      createMutation.mutate({
        anime_id: animeId,
        name: arcName,
        arc_type: arcType,
        start_episode: parseInt(startEpisode),
        end_episode: parseInt(endEpisode),
        description: description || undefined,
        manga_chapters: mangaChapters,
        is_filler: arcType === "filler",
      });
    }
  };

  const addFillerEpisode = () => {
    const episodeNum = parseInt(newFillerEpisode);
    if (episodeNum && !fillerEpisodes.includes(episodeNum)) {
      setFillerEpisodes([...fillerEpisodes, episodeNum].sort((a, b) => a - b));
      setNewFillerEpisode("");
    }
  };

  const removeFillerEpisode = (episodeNum: number) => {
    setFillerEpisodes(fillerEpisodes.filter((e) => e !== episodeNum));
  };

  // Check for overlaps
  const detectOverlaps = (arc: AnimeArc) => {
    return arcs.filter((a: AnimeArc) => {
      if (a.id === arc.id) return false;
      return (
        (arc.start_episode >= a.start_episode && arc.start_episode <= a.end_episode) ||
        (arc.end_episode >= a.start_episode && arc.end_episode <= a.end_episode) ||
        (arc.start_episode <= a.start_episode && arc.end_episode >= a.end_episode)
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="h-96 bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate timeline data
  const totalEpisodes = arcs.length > 0 ? Math.max(...arcs.map((a: AnimeArc) => a.end_episode)) : 0;
  const canonEpisodes = arcs
    .filter((a: AnimeArc) => a.arc_type === "canon")
    .reduce((sum: number, a: AnimeArc) => sum + (a.end_episode - a.start_episode + 1), 0);
  const fillerEpisodeCount = arcs
    .filter((a: AnimeArc) => a.arc_type === "filler")
    .reduce((sum: number, a: AnimeArc) => sum + (a.end_episode - a.start_episode + 1), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Anime Arc Manager
            </h1>
            <p className="text-slate-400">
              {animeInfo?.name || "Loading..."} - Manage story arcs and filler episodes
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Arc
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{arcs.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Arcs</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Film className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{totalEpisodes}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Episodes</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{canonEpisodes}</span>
            </div>
            <p className="text-slate-400 text-sm">Canon Episodes</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/20 to-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-slate-400" />
              <span className="text-3xl font-bold text-white">{fillerEpisodeCount}</span>
            </div>
            <p className="text-slate-400 text-sm">Filler Episodes</p>
          </div>
        </motion.div>

        {/* Visual Timeline */}
        {arcs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Arc Timeline</h2>
            <div className="space-y-2">
              {arcs
                .sort((a: AnimeArc, b: AnimeArc) => a.start_episode - b.start_episode)
                .map((arc: AnimeArc, index: number) => {
                  const typeConfig = ARC_TYPES.find((t) => t.value === arc.arc_type);
                  const width = ((arc.end_episode - arc.start_episode + 1) / totalEpisodes) * 100;
                  const overlaps = detectOverlaps(arc);

                  return (
                    <div key={arc.id} className="relative">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm text-slate-400 w-24">
                          Ep {arc.start_episode}-{arc.end_episode}
                        </span>
                        <div className="flex-1 h-12 bg-slate-800/50 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r from-${typeConfig?.color}-500/80 to-${typeConfig?.color}-600/80 border border-${typeConfig?.color}-500/50 flex items-center justify-between px-4`}
                          >
                            <span className="text-white font-medium text-sm truncate">
                              {arc.name}
                            </span>
                            <span
                              className={`px-2 py-1 bg-${typeConfig?.color}-900/50 rounded text-xs text-white`}
                            >
                              {typeConfig?.label}
                            </span>
                          </motion.div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(arc)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteArcId(arc.id)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {overlaps.length > 0 && (
                        <div className="ml-28 mb-2">
                          <span className="text-xs text-amber-400">
                            ⚠️ Overlaps with {overlaps.length} other arc{overlaps.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Arcs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {arcs.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Arcs Defined
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first arc to organize episodes and track filler content
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all"
              >
                Create Arc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {arcs
                .sort((a: AnimeArc, b: AnimeArc) => a.start_episode - b.start_episode)
                .map((arc: AnimeArc, index: number) => {
                  const typeConfig = ARC_TYPES.find((t) => t.value === arc.arc_type);
                  const episodeCount = arc.end_episode - arc.start_episode + 1;

                  return (
                    <motion.div
                      key={arc.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`bg-slate-900/50 backdrop-blur-sm border border-${typeConfig?.color}-700/50 rounded-xl p-6 hover:border-${typeConfig?.color}-500/50 transition-all`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${typeConfig?.color}-500/20 to-${typeConfig?.color}-600/20 border border-${typeConfig?.color}-500/30 flex items-center justify-center`}
                          >
                            <Sparkles className={`w-6 h-6 text-${typeConfig?.color}-400`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {arc.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 bg-${typeConfig?.color}-500/20 border border-${typeConfig?.color}-500/30 text-${typeConfig?.color}-400 text-xs font-medium rounded`}
                              >
                                {typeConfig?.label}
                              </span>
                              <span className="text-sm text-slate-400">
                                {episodeCount} episode{episodeCount > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Episode Range */}
                      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Episode Range</span>
                          <span className="text-white font-medium">
                            {arc.start_episode} - {arc.end_episode}
                          </span>
                        </div>
                        {arc.manga_chapters && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Manga Chapters</span>
                            <span className="text-white font-medium">
                              Ch. {arc.manga_chapters}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {arc.description && (
                        <p className="text-sm text-slate-300 mb-4">{arc.description}</p>
                      )}
                    </motion.div>
                  );
                })}
            </div>
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
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {editingArc ? "Edit" : "Create"} Arc
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
                  {/* Arc Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Arc Name *
                    </label>
                    <input
                      type="text"
                      value={arcName}
                      onChange={(e) => setArcName(e.target.value)}
                      required
                      placeholder="e.g., Soul Society Arc"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  {/* Arc Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Arc Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {ARC_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setArcType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            arcType === type.value
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

                  {/* Episode Range */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Episode *
                      </label>
                      <input
                        type="number"
                        value={startEpisode}
                        onChange={(e) => setStartEpisode(e.target.value)}
                        required
                        min="1"
                        placeholder="1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Episode *
                      </label>
                      <input
                        type="number"
                        value={endEpisode}
                        onChange={(e) => setEndEpisode(e.target.value)}
                        required
                        min={startEpisode || "1"}
                        placeholder="12"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* Manga Chapter Range */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Manga Chapter Start (Optional)
                      </label>
                      <input
                        type="number"
                        value={mangaChapterStart}
                        onChange={(e) => setMangaChapterStart(e.target.value)}
                        min="1"
                        placeholder="Chapter 1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Manga Chapter End (Optional)
                      </label>
                      <input
                        type="number"
                        value={mangaChapterEnd}
                        onChange={(e) => setMangaChapterEnd(e.target.value)}
                        min={mangaChapterStart || "1"}
                        placeholder="Chapter 50"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* Filler Episodes */}
                  {arcType === "mixed" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Filler Episodes (for Mixed Arcs)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="number"
                          value={newFillerEpisode}
                          onChange={(e) => setNewFillerEpisode(e.target.value)}
                          placeholder="Episode number"
                          min={startEpisode || "1"}
                          max={endEpisode || undefined}
                          className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          onClick={addFillerEpisode}
                          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {fillerEpisodes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {fillerEpisodes.map((ep) => (
                            <span
                              key={ep}
                              className="px-3 py-1 bg-slate-700 text-white rounded-full flex items-center gap-2"
                            >
                              Episode {ep}
                              <button
                                type="button"
                                onClick={() => removeFillerEpisode(ep)}
                                className="hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Brief description of this arc..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                        !arcName ||
                        !startEpisode ||
                        !endEpisode ||
                        createMutation.isPending ||
                        updateMutation.isPending
                      }
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingArc
                          ? "Update Arc"
                          : "Create Arc"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteArcId !== null}
          onClose={() => setDeleteArcId(null)}
          onConfirm={() => deleteArcId && deleteMutation.mutate(deleteArcId)}
          title="Delete Arc"
          message="Are you sure you want to delete this arc? This action cannot be undone."
          confirmText="Delete Arc"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
