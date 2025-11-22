// components/admin/TitleManager.tsx
/**
 * =============================================================================
 * Title Management Component - Admin Content Library
 * =============================================================================
 * Best Practices:
 * - Comprehensive CRUD operations
 * - Advanced search and filtering
 * - Bulk actions support
 * - Real-time data with React Query
 * - Optimistic updates
 * - Error handling
 * - Responsive data table
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Film,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";

interface Title {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  status: "published" | "draft" | "archived";
  poster_url?: string;
  backdrop_url?: string;
  release_year?: number;
  rating?: number;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Main Title Manager Component
 */
export function TitleManager() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "movie" | "series">("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft" | "archived">("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  // Fetch titles
  const { data: titlesData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "titles", searchQuery, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", "100");

      const response = await fetch(`/api/v1/admin/titles?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch titles");
      return response.json();
    },
  });

  const titles = titlesData?.items || [];

  // Delete title mutation
  const deleteMutation = useMutation({
    mutationFn: async (titleId: string) => {
      const response = await fetch(`/api/v1/admin/titles/${titleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete title");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (titleIds: string[]) => {
      const response = await fetch(`/api/v1/admin/titles/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title_ids: titleIds }),
      });
      if (!response.ok) throw new Error("Failed to delete titles");
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ titleId, status }: { titleId: string; status: string }) => {
      const response = await fetch(`/api/v1/admin/titles/${titleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
    },
  });

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === titles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(titles.map((t: Title) => t.id)));
    }
  };

  const handleDelete = (titleId: string) => {
    if (confirm("Are you sure you want to delete this title?")) {
      deleteMutation.mutate(titleId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} titles?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Content Library</h1>
            <p className="mt-2 text-gray-400">
              {titlesData?.total || 0} titles • {selectedIds.size} selected
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin/titles/new")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Title
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Film className="h-5 w-5" />}
            label="Total Titles"
            value={titlesData?.total || 0}
            color="blue"
          />
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Published"
            value={titles.filter((t: Title) => t.status === "published").length}
            color="green"
          />
          <StatCard
            icon={<Edit className="h-5 w-5" />}
            label="Drafts"
            value={titles.filter((t: Title) => t.status === "draft").length}
            color="yellow"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Views"
            value={(titles.reduce((sum: number, t: Title) => sum + (t.view_count || 0), 0)).toLocaleString()}
            color="purple"
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors",
                showFilters ? "bg-blue-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg bg-gray-900 p-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All</option>
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-900/20 p-4">
            <p className="text-sm font-medium text-white">
              {selectedIds.size} title{selectedIds.size > 1 ? "s" : ""} selected
            </p>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="ml-auto flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        )}

        {/* Titles Table */}
        <div className="overflow-hidden rounded-lg bg-gray-900">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-gray-400">Loading titles...</p>
            </div>
          ) : titles.length === 0 ? (
            <div className="p-8 text-center">
              <Film className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-gray-400">No titles found</p>
              <button
                onClick={() => router.push("/admin/titles/new")}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                Add your first title
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-800 bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-left">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                        {selectedIds.size === titles.length ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Title</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Type</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Views</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Rating</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">Updated</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {titles.map((title: Title) => (
                    <TitleRow
                      key={title.id}
                      title={title}
                      isSelected={selectedIds.has(title.id)}
                      onToggleSelect={() => toggleSelect(title.id)}
                      onDelete={() => handleDelete(title.id)}
                      onUpdateStatus={(status) =>
                        updateStatusMutation.mutate({ titleId: title.id, status })
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn("rounded-full p-2", colorClasses[color])}>{icon}</div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

/**
 * Title Row Component
 */
function TitleRow({
  title,
  isSelected,
  onToggleSelect,
  onDelete,
  onUpdateStatus,
}: {
  title: Title;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: string) => void;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);

  const statusColors = {
    published: "bg-green-500/20 text-green-400",
    draft: "bg-yellow-500/20 text-yellow-400",
    archived: "bg-gray-500/20 text-gray-400",
  };

  return (
    <tr className="group transition-colors hover:bg-gray-800/50">
      <td className="p-4">
        <button onClick={onToggleSelect} className="text-gray-400 hover:text-white">
          {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {title.poster_url ? (
            <img
              src={title.poster_url}
              alt={title.title}
              className="h-12 w-8 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-8 items-center justify-center rounded bg-gray-800">
              <Film className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-white">{title.title}</p>
            <p className="text-sm text-gray-400">{title.release_year}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="capitalize text-gray-300">{title.type}</span>
      </td>
      <td className="p-4">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            statusColors[title.status]
          )}
        >
          {title.status}
        </span>
      </td>
      <td className="p-4 text-gray-300">{(title.view_count || 0).toLocaleString()}</td>
      <td className="p-4">
        {title.rating ? (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="h-4 w-4" fill="currentColor" />
            <span>{title.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
      <td className="p-4 text-gray-400">
        {new Date(title.updated_at).toLocaleDateString()}
      </td>
      <td className="p-4 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 rounded-lg bg-gray-800 py-1 shadow-xl">
                <button
                  onClick={() => {
                    router.push(`/admin/titles/${title.id}/edit`);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    router.push(`/title/${title.slug}`);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <hr className="my-1 border-gray-700" />
                {title.status !== "published" && (
                  <button
                    onClick={() => {
                      onUpdateStatus("published");
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                    Publish
                  </button>
                )}
                {title.status === "published" && (
                  <button
                    onClick={() => {
                      onUpdateStatus("draft");
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    Unpublish
                  </button>
                )}
                <hr className="my-1 border-gray-700" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
