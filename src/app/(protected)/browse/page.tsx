// app/(protected)/browse/page.tsx
/**
 * =============================================================================
 * Browse Page - Advanced filtering and catalog
 * =============================================================================
 */

"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { TitleGrid } from "@/components/ui/TitleGrid";
import { TitleGridSkeleton } from "@/components/ui/Skeletons";
import { Button } from "@/components/ui/Button";
import { Filter, X, ChevronDown } from "lucide-react";
import type { Title, Genre, TitleType, DiscoveryParams } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";

const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "release_date", label: "Release Date" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "A-Z" },
] as const;

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = React.useState(false);

  // Parse URL params
  const type = (searchParams.get("type") as TitleType) || undefined;
  const selectedGenres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const minRating = searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : undefined;
  const sortBy = searchParams.get("sort_by") || "popularity";
  const sortOrder = searchParams.get("sort_order") || "desc";
  const page = Number(searchParams.get("page")) || 1;

  // Fetch genres
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => api.discovery.getGenres(),
  });

  // Fetch titles
  const { data, isLoading } = useQuery({
    queryKey: ["browse", type, selectedGenres, year, minRating, sortBy, sortOrder, page],
    queryFn: () =>
      api.discovery.browse({
        type,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        year,
        min_rating: minRating,
        sort_by: sortBy as any,
        sort_order: sortOrder as any,
        page,
        page_size: 24,
      }),
  });

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    Object.entries({
      type: newParams.type || type,
      genres: newParams.genres || selectedGenres.join(","),
      year: newParams.year || year?.toString(),
      min_rating: newParams.min_rating || minRating?.toString(),
      sort_by: newParams.sort_by || sortBy,
      sort_order: newParams.sort_order || sortOrder,
      page: newParams.page || "1",
    }).forEach(([key, value]) => {
      if (value && value !== "undefined") {
        params.set(key, value);
      }
    });

    router.push(`/browse?${params.toString()}`);
  };

  const toggleGenre = (genreSlug: string) => {
    const newGenres = selectedGenres.includes(genreSlug)
      ? selectedGenres.filter((g) => g !== genreSlug)
      : [...selectedGenres, genreSlug];
    updateFilters({ genres: newGenres.join(","), page: "1" });
  };

  const clearFilters = () => {
    router.push("/browse");
  };

  const hasActiveFilters = type || selectedGenres.length > 0 || year || minRating;

  return (
    <div className="min-h-screen">
      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Browse</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.total ? `${data.total.toLocaleString()} titles found` : "Explore our catalog"}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="rounded-lg border bg-card p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Type Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2">
                    <Button
                      variant={!type ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ type: undefined })}
                    >
                      All
                    </Button>
                    <Button
                      variant={type === "MOVIE" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ type: "MOVIE" })}
                    >
                      Movies
                    </Button>
                    <Button
                      variant={type === "SERIES" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ type: "SERIES" })}
                    >
                      Series
                    </Button>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilters({ sort_by: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Year</label>
                  <select
                    value={year || ""}
                    onChange={(e) => updateFilters({ year: e.target.value || undefined })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <select
                    value={minRating || ""}
                    onChange={(e) => updateFilters({ min_rating: e.target.value || undefined })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="7">7+ ⭐</option>
                    <option value="8">8+ ⭐⭐</option>
                    <option value="9">9+ ⭐⭐⭐</option>
                  </select>
                </div>

                {/* Genres */}
                <div className="space-y-3 lg:col-span-2">
                  <label className="text-sm font-medium">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {genres?.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => toggleGenre(genre.slug)}
                        className={`rounded-full px-4 py-2 text-sm transition-colors ${
                          selectedGenres.includes(genre.slug)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap gap-2">
              {type && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  {type === "MOVIE" ? "Movies" : "Series"}
                  <button
                    onClick={() => updateFilters({ type: undefined })}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedGenres.map((genreSlug) => {
                const genre = genres?.find((g) => g.slug === genreSlug);
                return (
                  <span
                    key={genreSlug}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm"
                  >
                    {genre?.name || genreSlug}
                    <button
                      onClick={() => toggleGenre(genreSlug)}
                      className="hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {year && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  {year}
                  <button
                    onClick={() => updateFilters({ year: undefined })}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  {minRating}+ ⭐
                  <button
                    onClick={() => updateFilters({ min_rating: undefined })}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Grid */}
          {isLoading ? (
            <TitleGridSkeleton count={24} />
          ) : (
            <TitleGrid
              titles={data?.items || []}
              showMetadata
              emptyMessage="No titles found. Try adjusting your filters."
            />
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => updateFilters({ page: (page - 1).toString() })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.total_pages}
                onClick={() => updateFilters({ page: (page + 1).toString() })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
