// app/(protected)/watchlist/page.tsx
/**
 * =============================================================================
 * Watchlist Page - User's saved titles
 * =============================================================================
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { TitleGrid } from "@/components/ui/TitleGrid";
import { TitleGridSkeleton } from "@/components/ui/Skeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";

export default function WatchlistPage() {
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => api.watchlist.get(),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.watchlist.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const titles = React.useMemo(() => {
    return watchlist?.map((item) => item.title).filter(Boolean) || [];
  }, [watchlist]);

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Star className="h-8 w-8 text-yellow-400" />
              My Watchlist
            </h1>
            <p className="mt-2 text-muted-foreground">
              {titles.length ? `${titles.length} ${titles.length === 1 ? "title" : "titles"} saved` : "Your watchlist is empty"}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <TitleGridSkeleton count={12} />
          ) : (
            <TitleGrid
              titles={titles as any}
              showMetadata
              emptyMessage="Your watchlist is empty. Start adding titles!"
            />
          )}
        </div>
      </div>
    </div>
  );
}
