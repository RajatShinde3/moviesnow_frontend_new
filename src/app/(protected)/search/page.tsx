// app/(protected)/search/page.tsx
/**
 * =============================================================================
 * Search Results Page
 * =============================================================================
 */

"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/services";
import { TitleGrid } from "@/components/ui/TitleGrid";
import { TitleGridSkeleton } from "@/components/ui/Skeletons";
import { SearchBar } from "@/components/ui/SearchBar";
import { useQuery } from "@tanstack/react-query";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, page],
    queryFn: () => api.discovery.search(query, { page, page_size: 24 }),
    enabled: query.length >= 2,
  });

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Search Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <SearchBar autoFocus />
            </div>
            {query && (
              <div className="text-center">
                <h1 className="text-2xl font-bold">
                  {data?.total ? `${data.total.toLocaleString()} results` : "No results"} for "{query}"
                </h1>
              </div>
            )}
          </div>

          {/* Results */}
          {!query || query.length < 2 ? (
            <div className="flex min-h-[400px] items-center justify-center text-center">
              <div>
                <p className="text-lg font-medium">Start typing to search</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Search for movies, series, actors, and more
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <TitleGridSkeleton count={24} />
          ) : (
            <TitleGrid
              titles={data?.items || []}
              showMetadata
              emptyMessage={`No results found for "${query}"`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
