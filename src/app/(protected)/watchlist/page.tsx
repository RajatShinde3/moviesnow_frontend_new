// app/(protected)/watchlist/page.tsx
/**
 * =============================================================================
 * Watchlist Page - User's saved titles with advanced sorting and filtering
 * =============================================================================
 * Features:
 * - Sort by: Date Added, Title, Release Date, Rating
 * - Filter by: Type (Movie/Series), Genre, Year
 * - Search titles
 * - View modes: Grid/List
 * - Bulk actions: Remove multiple items
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { TitleGrid } from "@/components/ui/TitleGrid";
import { TitleGridSkeleton } from "@/components/ui/Skeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, SlidersHorizontal, Search, X, Grid3x3, List, Trash2 } from "lucide-react";

type SortOption = 'date_added' | 'title' | 'release_date' | 'rating';
type ViewMode = 'grid' | 'list';

export default function WatchlistPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortOption>('date_added');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterGenre, setFilterGenre] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => api.watchlist.get(),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.watchlist.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setSelectedItems(new Set());
    },
  });

  // Extract unique genres from watchlist
  const availableGenres = React.useMemo(() => {
    const genres = new Set<string>();
    watchlist?.forEach(item => {
      item.title?.genres?.forEach((genre: any) => {
        if (typeof genre === 'string') {
          genres.add(genre);
        } else if (genre?.name) {
          genres.add(genre.name);
        }
      });
    });
    return Array.from(genres).sort();
  }, [watchlist]);

  // Filter and sort titles
  const titles = React.useMemo(() => {
    let filtered = watchlist?.map((item) => ({
      ...item.title,
      added_at: item.added_at,
    })).filter(Boolean) || [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((title: any) =>
        title.title?.toLowerCase().includes(query) ||
        title.original_title?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((title: any) => title.type === filterType);
    }

    // Apply genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter((title: any) => {
        const genres = title.genres || [];
        return genres.some((g: any) =>
          (typeof g === 'string' ? g : g?.name) === filterGenre
        );
      });
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'release_date':
          return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'date_added':
        default:
          return new Date(b.added_at || 0).getTime() - new Date(a.added_at || 0).getTime();
      }
    });

    return filtered;
  }, [watchlist, searchQuery, sortBy, filterType, filterGenre]);

  const handleBulkRemove = async () => {
    if (selectedItems.size === 0) return;

    const promises = Array.from(selectedItems).map(id =>
      removeMutation.mutateAsync(id)
    );

    await Promise.all(promises);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
                <Star className="h-8 w-8 text-yellow-400" />
                My Watchlist
              </h1>
              <p className="mt-2 text-gray-400">
                {titles.length ? `${titles.length} ${titles.length === 1 ? "title" : "titles"}` : "Your watchlist is empty"}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search watchlist..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="date_added" className="bg-gray-900">Date Added</option>
              <option value="title" className="bg-gray-900">Title (A-Z)</option>
              <option value="release_date" className="bg-gray-900">Release Date</option>
              <option value="rating" className="bg-gray-900">Rating</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
                showFilters || filterType !== 'all' || filterGenre !== 'all'
                  ? 'bg-red-600 text-white'
                  : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {(filterType !== 'all' || filterGenre !== 'all') && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-red-600">
                  {(filterType !== 'all' ? 1 : 0) + (filterGenre !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Bulk Remove */}
            {selectedItems.size > 0 && (
              <button
                onClick={handleBulkRemove}
                disabled={removeMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
                <span>Remove ({selectedItems.size})</span>
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
              {/* Type Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all" className="bg-gray-900">All Types</option>
                  <option value="MOVIE" className="bg-gray-900">Movies</option>
                  <option value="SERIES" className="bg-gray-900">Series</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Genre</label>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all" className="bg-gray-900">All Genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre} className="bg-gray-900">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <TitleGridSkeleton count={12} />
          ) : (
            <TitleGrid
              titles={titles as any}
              showMetadata
              emptyMessage={
                searchQuery || filterType !== 'all' || filterGenre !== 'all'
                  ? "No titles match your filters"
                  : "Your watchlist is empty. Start adding titles!"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
