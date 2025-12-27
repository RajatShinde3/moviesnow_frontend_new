/**
 * =============================================================================
 * SearchFilters Component
 * =============================================================================
 * Advanced search filters with multi-select and range options
 */

'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/lib/api/services/search';
import { useAvailableFilters } from '@/lib/api/hooks/useSearch';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
}

const CONTENT_TYPES = [
  { value: 'movie', label: 'Movies', icon: '🎬' },
  { value: 'series', label: 'Series', icon: '📺' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'documentary', label: 'Documentaries', icon: '🎥' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'year', label: 'Release Year' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function SearchFilters({
  filters,
  onFiltersChange,
  className = '',
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: availableFilters } = useAvailableFilters();

  const genres = availableFilters?.genres || [];
  const yearRange = availableFilters?.years || { min: 1900, max: new Date().getFullYear() };

  const hasActiveFilters =
    (filters.types?.length || 0) > 0 ||
    (filters.genres?.length || 0) > 0 ||
    filters.year_min !== undefined ||
    filters.year_max !== undefined ||
    filters.rating_min !== undefined ||
    filters.rating_max !== undefined;

  const activeFilterCount = [
    filters.types?.length || 0,
    filters.genres?.length || 0,
    filters.year_min ? 1 : 0,
    filters.year_max ? 1 : 0,
    filters.rating_min ? 1 : 0,
    filters.rating_max ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleType = (type: 'movie' | 'series' | 'anime' | 'documentary') => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = filters.genres || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];

    onFiltersChange({
      ...filters,
      genres: newGenres.length > 0 ? newGenres : undefined,
    });
  };

  const handleYearChange = (type: 'min' | 'max', value: string) => {
    const year = value ? parseInt(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'year_min' : 'year_max']: year,
    });
  };

  const handleRatingChange = (type: 'min' | 'max', value: string) => {
    const rating = value ? parseFloat(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'rating_min' : 'rating_max']: rating,
    });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sort_by: sortBy as any,
      sort_order: sortOrder,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sort_by: 'relevance',
      sort_order: 'desc',
    });
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-purple-400" />
          <span className="font-semibold text-white">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="px-3 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
          <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
        </div>
      </button>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-6 border-t border-gray-800">
          {/* Content Types */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    filters.types?.includes(type.value as any)
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                  {filters.types?.includes(type.value as any) && (
                    <Check className="h-4 w-4 ml-auto text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 12).map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.genres?.includes(genre)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Release Year
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">From</label>
                <input
                  type="number"
                  min={yearRange.min}
                  max={yearRange.max}
                  value={filters.year_min || ''}
                  onChange={(e) => handleYearChange('min', e.target.value)}
                  placeholder={yearRange.min.toString()}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">To</label>
                <input
                  type="number"
                  min={yearRange.min}
                  max={yearRange.max}
                  value={filters.year_max || ''}
                  onChange={(e) => handleYearChange('max', e.target.value)}
                  placeholder={yearRange.max.toString()}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Minimum Rating
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 4, 6, 8, 9].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    handleRatingChange('min', filters.rating_min === rating ? '' : rating.toString())
                  }
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    filters.rating_min === rating
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value, 'desc')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.sort_by === option.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Sort Order */}
            {filters.sort_by && filters.sort_by !== 'relevance' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSortChange(filters.sort_by!, 'desc')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.sort_order === 'desc'
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  High to Low
                </button>
                <button
                  onClick={() => handleSortChange(filters.sort_by!, 'asc')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    filters.sort_order === 'asc'
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Low to High
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
