/**
 * =============================================================================
 * Advanced Filters Component
 * =============================================================================
 * Sophisticated filtering UI for browse pages with animations and presets
 */

'use client';

import { useState } from 'react';
import { X, Filter, ChevronDown, Star, Calendar, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterState) => void;
  onReset: () => void;
}

export interface FilterState {
  genres: string[];
  releaseYear: { min?: number; max?: number };
  rating: { min?: number; max?: number };
  runtime: { min?: number; max?: number };
  sortBy: string;
  contentType: string[];
}

const GENRES: FilterOption[] = [
  { id: 'action', label: 'Action', value: 'action' },
  { id: 'adventure', label: 'Adventure', value: 'adventure' },
  { id: 'comedy', label: 'Comedy', value: 'comedy' },
  { id: 'drama', label: 'Drama', value: 'drama' },
  { id: 'horror', label: 'Horror', value: 'horror' },
  { id: 'sci-fi', label: 'Sci-Fi', value: 'sci-fi' },
  { id: 'thriller', label: 'Thriller', value: 'thriller' },
  { id: 'romance', label: 'Romance', value: 'romance' },
  { id: 'fantasy', label: 'Fantasy', value: 'fantasy' },
  { id: 'mystery', label: 'Mystery', value: 'mystery' },
  { id: 'crime', label: 'Crime', value: 'crime' },
  { id: 'documentary', label: 'Documentary', value: 'documentary' },
];

const SORT_OPTIONS: FilterOption[] = [
  { id: 'trending', label: 'Trending Now', value: 'trending' },
  { id: 'popular', label: 'Most Popular', value: 'popular' },
  { id: 'rating', label: 'Highest Rated', value: 'rating' },
  { id: 'recent', label: 'Recently Added', value: 'recent' },
  { id: 'release', label: 'Release Date', value: 'release' },
  { id: 'alphabetical', label: 'A-Z', value: 'alphabetical' },
];

const CONTENT_TYPES: FilterOption[] = [
  { id: 'movies', label: 'Movies', value: 'movie' },
  { id: 'series', label: 'TV Series', value: 'series' },
  { id: 'anime', label: 'Anime', value: 'anime' },
  { id: 'documentaries', label: 'Documentaries', value: 'documentary' },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function AdvancedFilters({ onApplyFilters, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    releaseYear: {},
    rating: {},
    runtime: {},
    sortBy: 'trending',
    contentType: [],
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleGenreToggle = (genreValue: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreValue)
        ? prev.genres.filter((g) => g !== genreValue)
        : [...prev.genres, genreValue],
    }));
  };

  const handleContentTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      contentType: prev.contentType.includes(type)
        ? prev.contentType.filter((t) => t !== type)
        : [...prev.contentType, type],
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);

    // Count active filters
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.releaseYear.min || filters.releaseYear.max) count++;
    if (filters.rating.min || filters.rating.max) count++;
    if (filters.runtime.min || filters.runtime.max) count++;
    if (filters.contentType.length > 0) count++;
    setActiveFiltersCount(count);

    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      genres: [],
      releaseYear: {},
      rating: {},
      runtime: {},
      sortBy: 'trending',
      contentType: [],
    });
    setActiveFiltersCount(0);
    onReset();
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-all"
      >
        <Filter className="h-5 w-5" />
        <span className="font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-[600px] max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-400" />
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleContentTypeToggle(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.contentType.includes(type.value)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreToggle(genre.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.genres.includes(genre.value)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Release Year
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="From"
                      min="1900"
                      max={CURRENT_YEAR}
                      value={filters.releaseYear.min || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          releaseYear: { ...prev.releaseYear, min: parseInt(e.target.value) || undefined },
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="To"
                      min="1900"
                      max={CURRENT_YEAR}
                      value={filters.releaseYear.max || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          releaseYear: { ...prev.releaseYear, max: parseInt(e.target.value) || undefined },
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Minimum Rating
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.rating.min || 0}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: { min: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>0.0</span>
                  <span className="text-purple-400 font-bold">
                    {(filters.rating.min || 0).toFixed(1)}+
                  </span>
                  <span>10.0</span>
                </div>
              </div>

              {/* Runtime */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Runtime (minutes)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      value={filters.runtime.min || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          runtime: { ...prev.runtime, min: parseInt(e.target.value) || undefined },
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      value={filters.runtime.max || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          runtime: { ...prev.runtime, max: parseInt(e.target.value) || undefined },
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-750 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
