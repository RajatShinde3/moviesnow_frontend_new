// components/SearchPage.tsx
/**
 * =============================================================================
 * Search Page Component - Enhanced with Best Practices
 * =============================================================================
 * Features:
 * - Debounced search with proper cleanup
 * - Advanced filters (genre, year, rating, type)
 * - URL state management with SSR support
 * - Infinite scroll with intersection observer
 * - Search suggestions and autocomplete
 * - Recent searches with local storage
 * - Voice search support (Web Speech API)
 * - Keyboard shortcuts (/ to focus)
 * - Accessibility (ARIA labels, focus management)
 * - Error handling and loading states
 * - Toast notifications for feedback
 */

"use client";

import * as React from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Search,
  Filter,
  X,
  Star,
  Calendar,
  Film,
  Tv,
  Play,
  ChevronDown,
  Clock,
  TrendingUp,
  Mic,
  MicOff,
  Loader2,
  Plus,
  Heart,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  poster_url?: string;
  backdrop_url?: string;
  release_year?: number;
  rating?: number;
  vote_count?: number;
  genres: string[];
  overview?: string;
  runtime?: number;
  seasons_count?: number;
  match_score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  query: string;
  filters_applied: string[];
}

interface Filters {
  type: "all" | "movie" | "series";
  genres: string[];
  yearRange: [number, number];
  minRating: number;
  sortBy: "relevance" | "title" | "year" | "rating" | "popularity";
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ============================================================================
// Constants
// ============================================================================

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western", "Musical", "Sports",
  "Biography", "History", "Anime"
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant", icon: Sparkles },
  { value: "popularity", label: "Most Popular", icon: TrendingUp },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "year", label: "Newest First", icon: Calendar },
  { value: "title", label: "A-Z", icon: null },
];

const currentYear = new Date().getFullYear();
const DEBOUNCE_DELAY = 350;
const RECENT_SEARCHES_KEY = "moviesnow_recent_searches";
const MAX_RECENT_SEARCHES = 10;
const PAGE_SIZE = 24;

// ============================================================================
// Custom Hooks
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue];
}

function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((type: Toast["type"], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}

// ============================================================================
// Toast Container Component
// ============================================================================

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300",
            "animate-in slide-in-from-right-full",
            toast.type === "success" && "bg-green-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "warning" && "bg-yellow-600 text-white",
            toast.type === "info" && "bg-blue-600 text-white"
          )}
          role="alert"
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
          {toast.type === "error" && <XCircle className="h-5 w-5 flex-shrink-0" />}
          {toast.type === "warning" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          {toast.type === "info" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 rounded p-1 hover:bg-white/20"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main SearchPage Component
// ============================================================================

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toasts, showToast, dismissToast } = useToast();

  // Input ref for keyboard shortcut
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // State
  const [query, setQuery] = React.useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isVoiceListening, setIsVoiceListening] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>(() => ({
    type: (searchParams.get("type") as Filters["type"]) || "all",
    genres: searchParams.get("genres")?.split(",").filter(Boolean) || [],
    yearRange: [
      parseInt(searchParams.get("year_from") || "1900"),
      parseInt(searchParams.get("year_to") || String(currentYear)),
    ],
    minRating: parseInt(searchParams.get("rating") || "0"),
    sortBy: (searchParams.get("sort") as Filters["sortBy"]) || "relevance",
  }));

  // Recent searches from local storage
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    RECENT_SEARCHES_KEY,
    []
  );

  // Debounced search query
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  // Keyboard shortcut for search focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.genres.length > 0) params.set("genres", filters.genres.join(","));
    if (filters.minRating > 0) params.set("rating", filters.minRating.toString());
    if (filters.yearRange[0] > 1900) params.set("year_from", filters.yearRange[0].toString());
    if (filters.yearRange[1] < currentYear) params.set("year_to", filters.yearRange[1].toString());
    if (filters.sortBy !== "relevance") params.set("sort", filters.sortBy);

    const newUrl = `/search${params.toString() ? `?${params}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, filters, router]);

  // Infinite scroll search results
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["search", debouncedQuery, filters],
    queryFn: async ({ pageParam = 1 }): Promise<SearchResponse> => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append("q", debouncedQuery);
      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.genres.length > 0) params.append("genres", filters.genres.join(","));
      if (filters.minRating > 0) params.append("min_rating", filters.minRating.toString());
      if (filters.yearRange[0] > 1900) params.append("year_from", filters.yearRange[0].toString());
      if (filters.yearRange[1] < currentYear) params.append("year_to", filters.yearRange[1].toString());
      params.append("sort", filters.sortBy);
      params.append("page", pageParam.toString());
      params.append("per_page", PAGE_SIZE.toString());

      const response = await fetch(`/api/v1/search?${params}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Search failed");
      }

      return response.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: debouncedQuery.length > 0 || filters.genres.length > 0,
    staleTime: 30000,
  });

  // Flatten paginated results
  const allResults = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.results) || [];
  }, [data]);

  const totalResults = data?.pages[0]?.total || 0;

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(
    React.useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    { threshold: 0.1 }
  );

  // Fetch trending titles
  const { data: trending } = useQuery({
    queryKey: ["trending-search"],
    queryFn: async () => {
      const response = await fetch("/api/v1/titles/trending?limit=12", {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const response = await fetch(
        `/api/v1/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=5`,
        { credentials: "include" }
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
  });

  // Save recent search
  const saveRecentSearch = React.useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      setRecentSearches((prev) =>
        [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES)
      );
    },
    [setRecentSearches]
  );

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    showToast("info", "Recent searches cleared");
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Voice search
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      showToast("warning", "Voice search is not supported in your browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onerror = () => {
      setIsVoiceListening(false);
      showToast("error", "Voice recognition failed");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      saveRecentSearch(transcript);
    };

    recognition.start();
  };

  // Toggle genre filter
  const toggleGenre = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: "all",
      genres: [],
      yearRange: [1900, currentYear],
      minRating: 0,
      sortBy: "relevance",
    });
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.genres.length > 0 ||
    filters.minRating > 0 ||
    filters.yearRange[0] > 1900 ||
    filters.yearRange[1] < currentYear;

  const activeFilterCount =
    (filters.type !== "all" ? 1 : 0) +
    filters.genres.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.yearRange[0] > 1900 || filters.yearRange[1] < currentYear ? 1 : 0);

  const showResults = debouncedQuery.length > 0 || filters.genres.length > 0;

  return (
    <div className="min-h-screen bg-black py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search movies, series, actors..."
              autoFocus
              autoComplete="off"
              className="w-full rounded-xl bg-gray-900 py-4 pl-14 pr-24 text-lg text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Search"
              aria-describedby="search-hint"
            />
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={startVoiceSearch}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isVoiceListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                aria-label={isVoiceListening ? "Listening..." : "Voice search"}
              >
                {isVoiceListening ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <p id="search-hint" className="sr-only">
            Press / to focus search, Escape to close
          </p>

          {/* Suggestions Dropdown */}
          {showSuggestions && query.length >= 2 && (suggestions?.length > 0 || recentSearches.length > 0) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-gray-900 shadow-xl">
              {suggestions?.length > 0 && (
                <div className="border-b border-gray-800 p-2">
                  <p className="px-3 py-1 text-xs font-medium uppercase text-gray-500">
                    Suggestions
                  </p>
                  {suggestions.map((suggestion: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white hover:bg-gray-800"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && !query && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-1">
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Recent Searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-white"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.slice(0, 5).map((search, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(search)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white hover:bg-gray-800"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex rounded-lg bg-gray-900 p-1">
            {(["all", "movie", "series"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilters((f) => ({ ...f, type }))}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors",
                  filters.type === type
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
                aria-pressed={filters.type === type}
              >
                {type === "movie" && <Film className="h-4 w-4" />}
                {type === "series" && <Tv className="h-4 w-4" />}
                {type === "all" ? "All" : type === "movie" ? "Movies" : "Series"}
              </button>
            ))}
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors",
              showFilters || hasActiveFilters
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-gray-400 hover:text-white"
            )}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sortBy: e.target.value as Filters["sortBy"] }))
              }
              className="appearance-none rounded-lg bg-gray-900 py-2 pl-4 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}

          {/* Results count */}
          {showResults && !isLoading && (
            <span className="ml-auto text-sm text-gray-500">
              {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl bg-gray-900 p-6 animate-in slide-in-from-top-2">
            {/* Genres */}
            <div className="mb-6">
              <h3 className="mb-3 font-semibold text-white">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      filters.genres.includes(genre)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    )}
                    aria-pressed={filters.genres.includes(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating and Year */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Min Rating */}
              <div>
                <h3 className="mb-3 font-semibold text-white">Minimum Rating</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={filters.minRating}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, minRating: parseInt(e.target.value) }))
                    }
                    className="flex-1 accent-blue-600"
                    aria-label="Minimum rating"
                  />
                  <div className="flex w-20 items-center gap-1 text-white">
                    <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                    <span className="font-medium">
                      {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Year Range */}
              <div>
                <h3 className="mb-3 font-semibold text-white">Release Year</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.yearRange[0]}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        yearRange: [parseInt(e.target.value) || 1900, f.yearRange[1]],
                      }))
                    }
                    className="w-24 rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    aria-label="From year"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.yearRange[1]}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        yearRange: [f.yearRange[0], parseInt(e.target.value) || currentYear],
                      }))
                    }
                    className="w-24 rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    aria-label="To year"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {error ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Search failed"}
            onRetry={() => refetch()}
          />
        ) : !showResults ? (
          <EmptyState
            trending={trending || []}
            recentSearches={recentSearches}
            onSearchClick={handleSuggestionClick}
            onClearRecent={clearRecentSearches}
          />
        ) : isLoading ? (
          <SearchResultsSkeleton />
        ) : allResults.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {allResults.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>

            {/* Load More / Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading more...
                </div>
              ) : hasNextPage ? (
                <button
                  onClick={() => fetchNextPage()}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
                >
                  <Plus className="h-5 w-5" />
                  Load More
                </button>
              ) : allResults.length > PAGE_SIZE && (
                <p className="text-sm text-gray-500">
                  You&apos;ve reached the end of the results
                </p>
              )}
            </div>
          </>
        ) : (
          <NoResultsState
            query={debouncedQuery}
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// ============================================================================
// Result Card Component
// ============================================================================

function ResultCard({ result }: { result: SearchResult }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    router.push(`/title/${result.slug}`);
  };

  // Prefetch on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    queryClient.prefetchQuery({
      queryKey: ["title", result.slug],
      queryFn: async () => {
        const response = await fetch(`/api/v1/titles/${result.slug}`, {
          credentials: "include",
        });
        return response.json();
      },
      staleTime: 60000,
    });
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer overflow-hidden rounded-lg bg-gray-900 transition-all duration-200 hover:scale-[1.02] hover:ring-2 hover:ring-blue-600"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`${result.title} - ${result.type === "movie" ? "Movie" : "Series"}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {result.poster_url ? (
          <img
            src={result.poster_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-gray-600" />
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/70 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Play className="h-14 w-14 text-white" fill="white" />
          {result.overview && (
            <p className="mt-3 px-3 text-center text-xs text-gray-300 line-clamp-3">
              {result.overview}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
          <span className="rounded bg-black/80 px-2 py-0.5 text-xs font-semibold uppercase text-white">
            {result.type}
          </span>
          {result.match_score && result.match_score > 80 && (
            <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
              {result.match_score}% Match
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate font-semibold text-white group-hover:text-blue-400">
          {result.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
          {result.release_year && <span>{result.release_year}</span>}
          {result.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
              <span>{result.rating.toFixed(1)}</span>
            </div>
          )}
          {result.type === "series" && result.seasons_count && (
            <span>{result.seasons_count} Season{result.seasons_count !== 1 ? "s" : ""}</span>
          )}
          {result.type === "movie" && result.runtime && (
            <span>{Math.floor(result.runtime / 60)}h {result.runtime % 60}m</span>
          )}
        </div>
        {result.genres?.length > 0 && (
          <p className="mt-1 truncate text-xs text-gray-500">
            {result.genres.slice(0, 3).join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Empty State (No Search Yet)
// ============================================================================

function EmptyState({
  trending,
  recentSearches,
  onSearchClick,
  onClearRecent,
}: {
  trending: SearchResult[];
  recentSearches: string[];
  onSearchClick: (query: string) => void;
  onClearRecent: () => void;
}) {
  return (
    <div className="space-y-10">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5 text-gray-400" />
              Recent Searches
            </h2>
            <button
              onClick={onClearRecent}
              className="text-sm text-gray-500 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, i) => (
              <button
                key={i}
                onClick={() => onSearchClick(search)}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <Clock className="h-4 w-4 text-gray-500" />
                {search}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            Trending Now
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {trending.slice(0, 12).map((item) => (
              <ResultCard key={item.id} result={item} />
            ))}
          </div>
        </section>
      )}

      {/* Browse Genres */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Browse by Genre</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {GENRES.slice(0, 12).map((genre) => (
            <button
              key={genre}
              onClick={() => onSearchClick(genre)}
              className="rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-6 text-center font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// No Results State
// ============================================================================

function NoResultsState({
  query,
  hasFilters,
  onClearFilters,
}: {
  query: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-16 w-16 text-gray-600" />
      <h3 className="mt-6 text-xl font-semibold text-white">No results found</h3>
      <p className="mt-2 max-w-md text-gray-400">
        {query
          ? `We couldn't find anything matching "${query}"`
          : "No titles match your current filters"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <X className="h-5 w-5" />
          Clear Filters
        </button>
      )}
      <div className="mt-8">
        <p className="mb-3 text-sm text-gray-500">Try searching for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Action", "Comedy", "Drama", "Sci-Fi", "Horror"].map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-gray-800 px-4 py-1 text-sm text-gray-400"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <XCircle className="h-16 w-16 text-red-500" />
      <h3 className="mt-6 text-xl font-semibold text-white">Something went wrong</h3>
      <p className="mt-2 max-w-md text-gray-400">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </button>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function SearchResultsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg bg-gray-900">
          <div className="aspect-[2/3] animate-pulse bg-gray-800" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
