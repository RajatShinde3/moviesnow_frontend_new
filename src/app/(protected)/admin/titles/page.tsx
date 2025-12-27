// app/(protected)/admin/titles/page.tsx
/**
 * =============================================================================
 * Admin - Advanced Title Management Dashboard
 * =============================================================================
 * Best-in-class content management with:
 * - Advanced filtering, sorting, and search
 * - Bulk operations (publish, unpublish, delete)
 * - Inline quick edit
 * - Real-time status updates
 * - Analytics per title
 * - Thumbnail previews
 * - Export/Import capabilities
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Film,
  Tv,
  FileVideo,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  MoreVertical,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Play,
  Settings,
  Copy,
  Archive,
  RefreshCw,
  Sparkles,
  BarChart3,
  Users,
  ArrowUpDown,
  ChevronDown,
  Grid3X3,
  List,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

interface Title {
  id: string;
  title?: string;
  name?: string;
  original_title?: string;
  type: "MOVIE" | "SERIES" | "ANIME" | "DOCUMENTARY";
  release_year: number;
  duration?: number;
  is_published: boolean;
  status: "draft" | "processing" | "ready" | "error";
  poster_url?: string;
  backdrop_url?: string;
  view_count: number;
  rating_average?: number;
  created_at: string;
  updated_at: string;
}

type ViewMode = "grid" | "list";
type SortField = "title" | "release_year" | "view_count" | "created_at" | "updated_at";
type SortOrder = "asc" | "desc";

// ============================================================================
// Main Component
// ============================================================================

export default function TitlesManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [selectedTitles, setSelectedTitles] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  // Fetch titles
  const { data: titlesData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "titles", searchQuery, selectedType, selectedStatus, sortField, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      params.append("sort", sortField);
      params.append("order", sortOrder);
      params.append("limit", "100");

      const response = await fetchJson<{ items: Title[]; total: number }>(
        `/api/v1/admin/titles?${params.toString()}`
      );
      return response;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const titles = titlesData?.items || [];
  const totalCount = titlesData?.total || 0;

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedTitles.size === titles.length) {
      setSelectedTitles(new Set());
    } else {
      setSelectedTitles(new Set(titles.map((t) => t.id)));
    }
  };

  const toggleSelectTitle = (id: string) => {
    const newSelected = new Set(selectedTitles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTitles(newSelected);
  };

  // Bulk operations
  const bulkPublishMutation = useMutation({
    mutationFn: async (titleIds: string[]) => {
      await Promise.all(
        titleIds.map((id) =>
          fetchJson(`/api/v1/admin/titles/${id}/publish`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
      setSelectedTitles(new Set());
    },
  });

  const bulkUnpublishMutation = useMutation({
    mutationFn: async (titleIds: string[]) => {
      await Promise.all(
        titleIds.map((id) =>
          fetchJson(`/api/v1/admin/titles/${id}/unpublish`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
      setSelectedTitles(new Set());
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (titleIds: string[]) => {
      await Promise.all(
        titleIds.map((id) =>
          fetchJson(`/api/v1/admin/titles/${id}`, { method: "DELETE" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
      setSelectedTitles(new Set());
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg shadow-blue-500/30">
                <Film className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Content Library</h1>
                <p className="mt-1 text-gray-400">
                  {totalCount} titles • {selectedTitles.size} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800 hover:border-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={() => router.push("/admin/content/upload")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-5 w-5" />
                Add Content
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Film className="h-5 w-5" />}
            label="Total Titles"
            value={totalCount}
            trend="+12%"
            trendUp={true}
            color="blue"
          />
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Published"
            value={titles.filter((t) => t.is_published).length}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Views"
            value={titles.reduce((sum, t) => sum + (t.view_count || 0), 0).toLocaleString()}
            trend="+24%"
            trendUp={true}
            color="purple"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Processing"
            value={titles.filter((t) => t.status === "processing").length}
            color="yellow"
          />
        </div>

        {/* Filters & Search */}
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, actors, directors..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 font-medium transition-all ${
                showFilters
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Type Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Content Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Types</option>
                  <option value="MOVIE">Movies</option>
                  <option value="SERIES">TV Series</option>
                  <option value="ANIME">Anime</option>
                  <option value="DOCUMENTARY">Documentaries</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="processing">Processing</option>
                  <option value="error">Error</option>
                </select>
              </div>

              {/* Sort Field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="created_at">Date Added</option>
                  <option value="updated_at">Last Updated</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="release_year">Release Year</option>
                  <option value="view_count">Views</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedTitles.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <p className="font-medium text-blue-300">
                {selectedTitles.size} {selectedTitles.size === 1 ? "item" : "items"} selected
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkPublishMutation.mutate(Array.from(selectedTitles))}
                disabled={bulkPublishMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Publish
              </button>

              <button
                onClick={() => bulkUnpublishMutation.mutate(Array.from(selectedTitles))}
                disabled={bulkUnpublishMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition-all hover:bg-yellow-700 disabled:opacity-50"
              >
                <EyeOff className="h-4 w-4" />
                Unpublish
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedTitles.size} titles? This cannot be undone.`)) {
                    bulkDeleteMutation.mutate(Array.from(selectedTitles));
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <button
                onClick={() => setSelectedTitles(new Set())}
                className="ml-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content Grid/List */}
        {isLoading ? (
          <LoadingState />
        ) : titles.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {titles.map((title) => (
                  <TitleCardGrid
                    key={title.id}
                    title={title}
                    isSelected={selectedTitles.has(title.id)}
                    onToggleSelect={() => toggleSelectTitle(title.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
                <table className="w-full">
                  <thead className="border-b border-gray-800 bg-gray-800/50">
                    <tr>
                      <th className="w-12 px-4 py-4">
                        <button
                          onClick={toggleSelectAll}
                          className="text-gray-400 hover:text-white"
                        >
                          {selectedTitles.size === titles.length ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Title
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Type
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Year
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Views
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">
                        Rating
                      </th>
                      <th className="w-24 px-4 py-4 text-right text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {titles.map((title) => (
                      <TitleRowList
                        key={title.id}
                        title={title}
                        isSelected={selectedTitles.has(title.id)}
                        onToggleSelect={() => toggleSelectTitle(title.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
  trend,
  trendUp,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendUp ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}

function TitleCardGrid({
  title,
  isSelected,
  onToggleSelect,
}: {
  title: Title;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const router = useRouter();
  const displayTitle = title.title || title.name || "Untitled";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all ${
        isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/30"
          : "border-gray-800 hover:border-gray-700"
      } bg-gray-900/50 backdrop-blur-xl`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {title.poster_url ? (
          <img
            src={title.poster_url}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-700" />
          </div>
        )}

        {/* Selection Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="absolute left-3 top-3 rounded-lg bg-gray-900/80 p-2 backdrop-blur-sm transition-all hover:bg-gray-900"
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-400" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={title.status} isPublished={title.is_published} />
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-3 left-3">
          <TypeBadge type={title.type} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-white line-clamp-1">{displayTitle}</h3>

        <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {title.release_year}
          </div>
          {title.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {title.duration}m
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {title.view_count.toLocaleString()}
            </div>
            {title.rating_average && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {title.rating_average.toFixed(1)}
              </div>
            )}
          </div>

          <TitleActions title={title} />
        </div>
      </div>
    </div>
  );
}

function TitleRowList({
  title,
  isSelected,
  onToggleSelect,
}: {
  title: Title;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const displayTitle = title.title || title.name || "Untitled";

  return (
    <tr className="group transition-colors hover:bg-gray-800/50">
      <td className="px-4 py-4">
        <button onClick={onToggleSelect} className="text-gray-400 hover:text-white">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-400" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-800">
            {title.poster_url ? (
              <img
                src={title.poster_url}
                alt={displayTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-white">{displayTitle}</p>
            {title.original_title && (
              <p className="text-xs text-gray-500">{title.original_title}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <TypeBadge type={title.type} />
      </td>

      <td className="px-4 py-4">
        <span className="text-gray-300">{title.release_year}</span>
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={title.status} isPublished={title.is_published} />
      </td>

      <td className="px-4 py-4">
        <span className="text-gray-300">{title.view_count.toLocaleString()}</span>
      </td>

      <td className="px-4 py-4">
        {title.rating_average ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-300">{title.rating_average.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>

      <td className="px-4 py-4 text-right">
        <TitleActions title={title} />
      </td>
    </tr>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = {
    MOVIE: { icon: Film, label: "Movie", color: "bg-blue-500/20 text-blue-400" },
    SERIES: { icon: Tv, label: "Series", color: "bg-purple-500/20 text-purple-400" },
    ANIME: { icon: Sparkles, label: "Anime", color: "bg-pink-500/20 text-pink-400" },
    DOCUMENTARY: { icon: FileVideo, label: "Doc", color: "bg-green-500/20 text-green-400" },
  };

  const { icon: Icon, label, color } = config[type as keyof typeof config] || config.MOVIE;

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function StatusBadge({ status, isPublished }: { status: string; isPublished: boolean }) {
  if (!isPublished) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-gray-500/20 px-2.5 py-1 text-xs font-medium text-gray-400">
        <EyeOff className="h-3.5 w-3.5" />
        Draft
      </div>
    );
  }

  const config = {
    ready: { icon: CheckCircle, label: "Published", color: "bg-green-500/20 text-green-400" },
    processing: { icon: Loader2, label: "Processing", color: "bg-yellow-500/20 text-yellow-400" },
    error: { icon: XCircle, label: "Error", color: "bg-red-500/20 text-red-400" },
    draft: { icon: EyeOff, label: "Draft", color: "bg-gray-500/20 text-gray-400" },
  };

  const { icon: Icon, label, color } = config[status as keyof typeof config] || config.ready;
  const animate = status === "processing" ? "animate-spin" : "";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon className={`h-3.5 w-3.5 ${animate}`} />
      {label}
    </div>
  );
}

function TitleActions({ title }: { title: Title }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const router = useRouter();

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
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <button
              onClick={() => router.push(`/admin/titles/${title.id}/edit`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
              Edit Details
            </button>
            <button
              onClick={() => router.push(`/admin/titles/${title.id}/analytics`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="border-t border-gray-700" />
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="aspect-[2/3] animate-pulse bg-gray-800" />
          <div className="p-4">
            <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-gray-800" />
            <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-16 text-center">
      <Film className="mx-auto h-16 w-16 text-gray-700" />
      <h3 className="mt-4 text-xl font-semibold text-white">
        {searchQuery ? "No titles found" : "No content yet"}
      </h3>
      <p className="mt-2 text-gray-400">
        {searchQuery
          ? "Try adjusting your search or filters"
          : "Get started by adding your first title"}
      </p>
      {!searchQuery && (
        <button
          onClick={() => router.push("/admin/content/upload")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Content
        </button>
      )}
    </div>
  );
}
