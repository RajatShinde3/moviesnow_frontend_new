/**
 * =============================================================================
 * AdvancedBrowse Component
 * =============================================================================
 * Complete browse experience with filters, sorting, and grid/list views
 */

'use client';

import { useState } from 'react';
import { Grid, List, SlidersHorizontal, Star, Calendar, TrendingUp } from 'lucide-react';
import { useSearch } from '@/lib/api/hooks/useSearch';
import { SearchFilters as SearchFiltersType } from '@/lib/api/services/search';

interface AdvancedBrowseProps {
  initialType?: 'movie' | 'series' | 'anime' | 'documentary';
  initialGenre?: string;
}

type ViewMode = 'grid' | 'list';
type GridSize = 'small' | 'medium' | 'large';

export default function AdvancedBrowse({ initialType, initialGenre }: AdvancedBrowseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<SearchFiltersType>({
    types: initialType ? [initialType] : undefined,
    genres: initialGenre ? [initialGenre] : undefined,
    sort_by: 'popularity',
    sort_order: 'desc',
  });

  const { data, isLoading } = useSearch('', {
    ...filters,
    page,
    per_page: viewMode === 'grid' ? 24 : 12,
  });

  const results = data?.results || [];
  const totalPages = data?.total_pages || 1;

  const gridColumns = {
    small: 'grid-cols-3 md:grid-cols-6',
    medium: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
    large: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {initialType
              ? `Browse ${initialType.charAt(0).toUpperCase() + initialType.slice(1)}s`
              : 'Browse All'}
          </h1>
          <p className="text-gray-400">
            {data?.total_count || 0} {data?.total_count === 1 ? 'title' : 'titles'} found
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4">
          {/* Grid Size */}
          {viewMode === 'grid' && (
            <select
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value as GridSize)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showFilters
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <BrowseSkeleton viewMode={viewMode} gridSize={gridSize} />
      ) : results.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-lg">No results found</p>
          <button
            onClick={() => setFilters({ sort_by: 'popularity', sort_order: 'desc' })}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className={`grid ${gridColumns[gridSize]} gap-4`}>
          {results.map((item) => (
            <ContentGridCard key={item.id} item={item} size={gridSize} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item) => (
            <ContentListCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-10 w-10 rounded-lg font-medium transition-all ${
                    page === pageNum
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface ContentGridCardProps {
  item: any;
  size: GridSize;
}

function ContentGridCard({ item, size }: ContentGridCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`aspect-[2/3] rounded-lg overflow-hidden mb-3 transition-transform ${
          isHovered ? 'scale-105' : ''
        }`}
      >
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Rating Badge */}
        {item.rating_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
            <Star className="h-3 w-3 fill-white text-white" />
            <span className="text-xs font-bold text-white">{item.rating_average.toFixed(1)}</span>
          </div>
        )}
      </div>

      <h3 className={`font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors ${
        size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
      }`}>
        {item.name}
      </h3>

      {size !== 'small' && (
        <p className="text-sm text-gray-400 mt-1">
          {item.release_year} • {item.type}
        </p>
      )}
    </div>
  );
}

function ContentListCard({ item }: { item: any }) {
  return (
    <div className="flex gap-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
      {/* Poster */}
      <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
        {item.poster_url ? (
          <img src={item.poster_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
            <span className="text-2xl">🎬</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
          {item.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          {item.release_year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {item.release_year}
            </div>
          )}
          {item.rating_average > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {item.rating_average.toFixed(1)}
            </div>
          )}
          <span className="capitalize">{item.type}</span>
        </div>

        {item.description && (
          <p className="text-gray-400 line-clamp-2 mb-3">{item.description}</p>
        )}

        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.genres.slice(0, 4).map((genre: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdvancedFilters({
  filters,
  onFiltersChange,
}: {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}) {
  // Simplified filters - full implementation in SearchFilters component
  const SORT_OPTIONS = [
    { value: 'popularity', label: 'Popularity', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'rating', label: 'Rating', icon: <Star className="h-4 w-4" /> },
    { value: 'year', label: 'Year', icon: <Calendar className="h-4 w-4" /> },
    { value: 'title', label: 'Title', icon: null },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-3">Sort By</label>
      <div className="grid grid-cols-4 gap-3">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              onFiltersChange({
                ...filters,
                sort_by: option.value as any,
              })
            }
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              filters.sort_by === option.value
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BrowseSkeleton({ viewMode, gridSize }: { viewMode: ViewMode; gridSize: GridSize }) {
  const gridColumns = {
    small: 'grid-cols-3 md:grid-cols-6',
    medium: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
    large: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  if (viewMode === 'grid') {
    return (
      <div className={`grid ${gridColumns[gridSize]} gap-4 animate-pulse`}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[2/3] bg-gray-800 rounded-lg" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-gray-800 rounded-xl">
          <div className="w-24 aspect-[2/3] bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
