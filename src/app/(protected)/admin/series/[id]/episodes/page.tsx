// app/(protected)/admin/series/[id]/episodes/page.tsx
/**
 * =============================================================================
 * Admin - Season & Episode Manager
 * =============================================================================
 * Comprehensive season and episode management with:
 * - Tree structure view
 * - Drag-and-drop reordering
 * - Bulk operations
 * - Quick metadata editing
 * - Episode status tracking
 * - Season management
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Film,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Play,
  Upload,
  Download,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MoreVertical,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Settings,
  RefreshCw,
  Save,
  X,
  Tv,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description?: string;
  duration?: number;
  release_date?: string;
  is_published: boolean;
  status: "draft" | "processing" | "ready" | "error";
  view_count: number;
  thumbnail_url?: string;
  season_id: string;
  season_number: number;
}

interface Season {
  id: string;
  season_number: number;
  title: string;
  description?: string;
  release_year?: number;
  episode_count: number;
  is_published: boolean;
  episodes?: Episode[];
}

interface Series {
  id: string;
  title: string;
  name?: string;
  type: string;
  poster_url?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function SeriesEpisodesManager() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const seriesId = params.id as string;

  const [expandedSeasons, setExpandedSeasons] = React.useState<Set<string>>(new Set());
  const [selectedEpisodes, setSelectedEpisodes] = React.useState<Set<string>>(new Set());
  const [editingEpisode, setEditingEpisode] = React.useState<string | null>(null);
  const [showAddSeason, setShowAddSeason] = React.useState(false);
  const [showAddEpisode, setShowAddEpisode] = React.useState<string | null>(null);

  // Fetch series details
  const { data: series } = useQuery({
    queryKey: ["admin", "titles", seriesId],
    queryFn: () => fetchJson<Series>(`/api/v1/admin/titles/${seriesId}`),
  });

  // Fetch seasons with episodes
  const { data: seasons, isLoading, refetch } = useQuery({
    queryKey: ["admin", "titles", seriesId, "seasons"],
    queryFn: async () => {
      const response = await fetchJson<{ items: Season[] }>(
        `/api/v1/admin/titles/${seriesId}/seasons?include_episodes=true`
      );
      return response?.items || [];
    },
  });

  // Toggle season expansion
  const toggleSeason = (seasonId: string) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonId)) {
      newExpanded.delete(seasonId);
    } else {
      newExpanded.add(seasonId);
    }
    setExpandedSeasons(newExpanded);
  };

  // Select/deselect episode
  const toggleSelectEpisode = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodes);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodes(newSelected);
  };

  // Bulk publish mutation
  const bulkPublishMutation = useMutation({
    mutationFn: async (episodeIds: string[]) => {
      await Promise.all(
        episodeIds.map((id) =>
          fetchJson(`/api/v1/admin/episodes/${id}/publish`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", seriesId, "seasons"] });
      setSelectedEpisodes(new Set());
    },
  });

  // Bulk unpublish mutation
  const bulkUnpublishMutation = useMutation({
    mutationFn: async (episodeIds: string[]) => {
      await Promise.all(
        episodeIds.map((id) =>
          fetchJson(`/api/v1/admin/episodes/${id}/unpublish`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", seriesId, "seasons"] });
      setSelectedEpisodes(new Set());
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (episodeIds: string[]) => {
      await Promise.all(
        episodeIds.map((id) =>
          fetchJson(`/api/v1/admin/episodes/${id}`, { method: "DELETE" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", seriesId, "seasons"] });
      setSelectedEpisodes(new Set());
    },
  });

  const totalEpisodes = seasons?.reduce((sum, s) => sum + (s.episode_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-gray-400 hover:text-white"
          >
            ← Back to Titles
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg shadow-purple-500/30">
                <Tv className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {series?.title || series?.name || "Series Manager"}
                </h1>
                <p className="mt-1 text-gray-400">
                  {seasons?.length || 0} seasons • {totalEpisodes} episodes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={() => setShowAddSeason(true)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-5 w-5" />
                Add Season
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Film className="h-5 w-5" />}
            label="Seasons"
            value={seasons?.length || 0}
            color="blue"
          />
          <StatCard
            icon={<Play className="h-5 w-5" />}
            label="Episodes"
            value={totalEpisodes}
            color="purple"
          />
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Published"
            value={
              seasons?.reduce(
                (sum, s) =>
                  sum + (s.episodes?.filter((e) => e.is_published).length || 0),
                0
              ) || 0
            }
            color="green"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Processing"
            value={
              seasons?.reduce(
                (sum, s) =>
                  sum + (s.episodes?.filter((e) => e.status === "processing").length || 0),
                0
              ) || 0
            }
            color="yellow"
          />
        </div>

        {/* Bulk Actions Bar */}
        {selectedEpisodes.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <p className="font-medium text-blue-300">
                {selectedEpisodes.size} episode{selectedEpisodes.size === 1 ? "" : "s"} selected
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkPublishMutation.mutate(Array.from(selectedEpisodes))}
                disabled={bulkPublishMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Publish
              </button>

              <button
                onClick={() => bulkUnpublishMutation.mutate(Array.from(selectedEpisodes))}
                disabled={bulkUnpublishMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition-all hover:bg-yellow-700 disabled:opacity-50"
              >
                <EyeOff className="h-4 w-4" />
                Unpublish
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedEpisodes.size} episodes? This cannot be undone.`)) {
                    bulkDeleteMutation.mutate(Array.from(selectedEpisodes));
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <button
                onClick={() => setSelectedEpisodes(new Set())}
                className="ml-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Seasons List */}
        {isLoading ? (
          <LoadingState />
        ) : seasons && seasons.length > 0 ? (
          <div className="space-y-4">
            {seasons
              .sort((a, b) => a.season_number - b.season_number)
              .map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  seriesId={seriesId}
                  isExpanded={expandedSeasons.has(season.id)}
                  onToggle={() => toggleSeason(season.id)}
                  selectedEpisodes={selectedEpisodes}
                  onToggleSelectEpisode={toggleSelectEpisode}
                  editingEpisode={editingEpisode}
                  setEditingEpisode={setEditingEpisode}
                  showAddEpisode={showAddEpisode}
                  setShowAddEpisode={setShowAddEpisode}
                />
              ))}
          </div>
        ) : (
          <EmptyState onAddSeason={() => setShowAddSeason(true)} />
        )}

        {/* Add Season Modal */}
        {showAddSeason && (
          <AddSeasonModal
            seriesId={seriesId}
            onClose={() => setShowAddSeason(false)}
            onSuccess={() => {
              setShowAddSeason(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    yellow: "from-yellow-500 to-orange-600",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className={`absolute right-0 top-0 h-24 w-24 opacity-10 blur-3xl bg-gradient-to-br ${colorClasses[color]}`} />
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-full bg-gradient-to-br ${colorClasses[color]} p-3 text-white`}>
          {icon}
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function SeasonCard({
  season,
  seriesId,
  isExpanded,
  onToggle,
  selectedEpisodes,
  onToggleSelectEpisode,
  editingEpisode,
  setEditingEpisode,
  showAddEpisode,
  setShowAddEpisode,
}: {
  season: Season;
  seriesId: string;
  isExpanded: boolean;
  onToggle: () => void;
  selectedEpisodes: Set<string>;
  onToggleSelectEpisode: (id: string) => void;
  editingEpisode: string | null;
  setEditingEpisode: (id: string | null) => void;
  showAddEpisode: string | null;
  setShowAddEpisode: (id: string | null) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      {/* Season Header */}
      <div className="flex items-center gap-4 p-6">
        <button
          onClick={onToggle}
          className="text-gray-400 transition-transform hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">
              Season {season.season_number}
            </h3>
            {season.title && (
              <span className="text-gray-400">• {season.title}</span>
            )}
            <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400">
              {season.episode_count} episodes
            </span>
            {season.is_published ? (
              <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
                Published
              </span>
            ) : (
              <span className="rounded-full bg-gray-500/20 px-2.5 py-1 text-xs font-medium text-gray-400">
                Draft
              </span>
            )}
          </div>
          {season.description && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">{season.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddEpisode(season.id)}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-medium text-white transition-all hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Add Episode
          </button>

          <SeasonActions season={season} />
        </div>
      </div>

      {/* Episodes List */}
      {isExpanded && season.episodes && (
        <div className="border-t border-gray-800 bg-gray-800/30">
          {season.episodes.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {season.episodes
                .sort((a, b) => a.episode_number - b.episode_number)
                .map((episode) => (
                  <EpisodeRow
                    key={episode.id}
                    episode={episode}
                    isSelected={selectedEpisodes.has(episode.id)}
                    onToggleSelect={() => onToggleSelectEpisode(episode.id)}
                    isEditing={editingEpisode === episode.id}
                    onEdit={() => setEditingEpisode(episode.id)}
                    onCancelEdit={() => setEditingEpisode(null)}
                  />
                ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Play className="mx-auto h-12 w-12 text-gray-700" />
              <p className="mt-3 text-gray-500">No episodes yet</p>
              <button
                onClick={() => setShowAddEpisode(season.id)}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300"
              >
                Add your first episode
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Episode Form */}
      {showAddEpisode === season.id && (
        <AddEpisodeForm
          seasonId={season.id}
          seriesId={seriesId}
          onClose={() => setShowAddEpisode(null)}
        />
      )}
    </div>
  );
}

function EpisodeRow({
  episode,
  isSelected,
  onToggleSelect,
  isEditing,
  onEdit,
  onCancelEdit,
}: {
  episode: Episode;
  isSelected: boolean;
  onToggleSelect: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 transition-colors ${isSelected ? "bg-blue-500/10" : "hover:bg-gray-800/50"}`}>
      <button
        onClick={onToggleSelect}
        className="text-gray-400 hover:text-white"
      >
        {isSelected ? (
          <CheckCircle className="h-5 w-5 text-blue-400" />
        ) : (
          <div className="h-5 w-5 rounded border-2 border-gray-600" />
        )}
      </button>

      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-700 text-sm font-medium text-white">
        {episode.episode_number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{episode.title}</p>
          <StatusBadge status={episode.status} isPublished={episode.is_published} />
        </div>
        {episode.description && (
          <p className="text-sm text-gray-400 truncate">{episode.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        {episode.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {episode.duration} min
          </div>
        )}
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {episode.view_count.toLocaleString()}
        </div>
      </div>

      <EpisodeActions episode={episode} onEdit={onEdit} />
    </div>
  );
}

function StatusBadge({ status, isPublished }: { status: string; isPublished: boolean }) {
  if (!isPublished) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-400">
        <EyeOff className="h-3 w-3" />
        Draft
      </span>
    );
  }

  const config = {
    ready: { icon: CheckCircle, label: "Published", color: "bg-green-500/20 text-green-400" },
    processing: { icon: Loader2, label: "Processing", color: "bg-yellow-500/20 text-yellow-400" },
    error: { icon: XCircle, label: "Error", color: "bg-red-500/20 text-red-400" },
    draft: { icon: EyeOff, label: "Draft", color: "bg-gray-500/20 text-gray-400" },
  };

  const { icon: Icon, label, color } = config[status as keyof typeof config] || config.ready;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

function SeasonActions({ season }: { season: Season }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Edit className="h-4 w-4" />
              Edit Season
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="border-t border-gray-700" />
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
              Delete Season
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EpisodeActions({ episode, onEdit }: { episode: Episode; onEdit: () => void }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <button
              onClick={onEdit}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
              Edit Episode
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Upload className="h-4 w-4" />
              Upload Video
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-gray-700">
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            <div className="border-t border-gray-700" />
            <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
              Delete Episode
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AddSeasonModal({
  seriesId,
  onClose,
  onSuccess,
}: {
  seriesId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [seasonNumber, setSeasonNumber] = React.useState(1);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchJson(`/api/v1/admin/titles/${seriesId}/seasons`, {
        method: "POST",
        json: data,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      season_number: seasonNumber,
      title: title || undefined,
      description: description || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Add Season</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Season Number *
            </label>
            <input
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
              min="1"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Beginning"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Season"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEpisodeForm({
  seasonId,
  seriesId,
  onClose,
}: {
  seasonId: string;
  seriesId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [episodeNumber, setEpisodeNumber] = React.useState(1);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchJson(`/api/v1/admin/seasons/${seasonId}/episodes`, {
        method: "POST",
        json: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles", seriesId, "seasons"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      episode_number: episodeNumber,
      title,
      description: description || undefined,
    });
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Add Episode</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Episode Number *
            </label>
            <input
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
              min="1"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Episode title"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Adding..." : "Add Episode"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-800" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAddSeason }: { onAddSeason: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-16 text-center">
      <Tv className="mx-auto h-16 w-16 text-gray-700" />
      <h3 className="mt-4 text-xl font-semibold text-white">No seasons yet</h3>
      <p className="mt-2 text-gray-400">Start by creating your first season</p>
      <button
        onClick={onAddSeason}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />
        Add First Season
      </button>
    </div>
  );
}
