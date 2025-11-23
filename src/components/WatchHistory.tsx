// components/WatchHistory.tsx
/**
 * =============================================================================
 * Watch History Component - Netflix-Quality
 * =============================================================================
 * Features:
 * - Complete streaming history
 * - Continue watching section
 * - Progress tracking
 * - Filter and search
 * - Export functionality
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Play,
  Clock,
  Download,
  Trash2,
  Search,
  Calendar,
  Filter,
  ChevronRight,
} from "lucide-react";

interface HistoryItem {
  id: string;
  title_id: string;
  title_name: string;
  title_poster?: string;
  episode_id?: string;
  episode_name?: string;
  season_number?: number;
  episode_number?: number;
  progress_seconds: number;
  duration_seconds: number;
  watched_at: string;
  completed: boolean;
}

export function WatchHistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterDays, setFilterDays] = React.useState<number | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  // Fetch watch history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["watch-history", filterDays],
    queryFn: async () => {
      // Get user's active profile
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) return { items: [], total: 0 };
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];

      if (!activeProfile) return { items: [], total: 0 };

      // Fetch history from backend
      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/history/streams?${
          filterDays ? `since=${new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000).toISOString()}` : ''
        }`
      );

      if (!response.ok) return { items: [], total: 0 };

      return response.json();
    },
  });

  // Continue watching (items with < 95% progress)
  const continueWatching = React.useMemo(() => {
    if (!historyData?.items) return [];
    return historyData.items
      .filter((item: HistoryItem) => {
        const progress = (item.progress_seconds / item.duration_seconds) * 100;
        return progress > 5 && progress < 95; // Skip if barely started or almost finished
      })
      .slice(0, 10); // Top 10 for continue watching
  }, [historyData]);

  // Filtered history
  const filteredHistory = React.useMemo(() => {
    if (!historyData?.items) return [];

    let items = historyData.items;

    if (searchQuery) {
      items = items.filter((item: HistoryItem) =>
        item.title_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.episode_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [historyData, searchQuery]);

  // Clear history mutation
  const clearHistory = useMutation({
    mutationFn: async (titleIds?: string[]) => {
      // Clear specific titles or all
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) throw new Error("No profiles found");
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];

      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/history/clear`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: titleIds ? JSON.stringify({ title_ids: titleIds }) : undefined,
        }
      );

      if (!response.ok) throw new Error("Failed to clear history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
      setSelectedItems(new Set());
    },
  });

  // Export history
  const exportHistory = async () => {
    const profiles = await api.profiles.list();
    if (!profiles || profiles.length === 0) return;
    const activeProfile = profiles.find(p => p.is_active) || profiles[0];

    const response = await fetch(
      `/api/v1/users/${activeProfile.id}/history/export`
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watch-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handlePlayItem = (item: HistoryItem) => {
    if (item.episode_id) {
      router.push(`/watch/${item.title_id}/episode/${item.episode_id}`);
    } else {
      router.push(`/watch/${item.title_id}`);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const calculateProgress = (item: HistoryItem) => {
    return Math.min(100, (item.progress_seconds / item.duration_seconds) * 100);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Watch History</h1>
          <p className="mt-2 text-gray-400">
            View and manage your viewing history
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterDays || ""}
              onChange={(e) => setFilterDays(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            {/* Export */}
            <button
              onClick={exportHistory}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Clear Selected */}
            {selectedItems.size > 0 && (
              <button
                onClick={() => clearHistory.mutate(Array.from(selectedItems))}
                disabled={clearHistory.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear ({selectedItems.size})
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        ) : (
          <>
            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold text-white">Continue Watching</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {continueWatching.map((item: HistoryItem) => (
                    <button
                      key={item.id}
                      onClick={() => handlePlayItem(item)}
                      className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105"
                    >
                      {/* Poster */}
                      <div className="relative aspect-[2/3] bg-gray-800">
                        {item.title_poster ? (
                          <img
                            src={item.title_poster}
                            alt={item.title_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-600">
                            <Play className="h-12 w-12" />
                          </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-12 w-12 text-white" fill="white" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${calculateProgress(item)}%` }}
                        />
                      </div>

                      {/* Title */}
                      <div className="mt-2 px-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.title_name}
                        </p>
                        {item.episode_name && (
                          <p className="truncate text-xs text-gray-400">
                            S{item.season_number}:E{item.episode_number} - {item.episode_name}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full History */}
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">Full History</h2>

              {filteredHistory.length === 0 ? (
                <div className="rounded-lg bg-gray-900 p-12 text-center">
                  <Clock className="mx-auto h-16 w-16 text-gray-600" />
                  <p className="mt-4 text-lg text-gray-400">
                    {searchQuery ? "No results found" : "No watch history yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((item: HistoryItem) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 rounded-lg bg-gray-900 p-4 transition-colors hover:bg-gray-800",
                        selectedItems.has(item.id) && "ring-2 ring-red-500"
                      )}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-2 focus:ring-red-500"
                      />

                      {/* Thumbnail */}
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded bg-gray-800">
                        {item.title_poster ? (
                          <img
                            src={item.title_poster}
                            alt={item.title_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Play className="h-8 w-8 text-gray-600" />
                          </div>
                        )}

                        {/* Progress overlay */}
                        {!item.completed && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            <div
                              className="h-full bg-red-600"
                              style={{ width: `${calculateProgress(item)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white">{item.title_name}</h3>
                        {item.episode_name && (
                          <p className="text-sm text-gray-400">
                            S{item.season_number}:E{item.episode_number} - {item.episode_name}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(item.watched_at)}</span>
                          <span>•</span>
                          <span>{formatDuration(item.progress_seconds)} watched</span>
                          {item.completed && (
                            <>
                              <span>•</span>
                              <span className="text-green-500">Completed</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Play button */}
                      <button
                        onClick={() => handlePlayItem(item)}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110"
                      >
                        <Play className="h-5 w-5" fill="black" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
