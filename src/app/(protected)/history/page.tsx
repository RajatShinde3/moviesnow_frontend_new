// app/(protected)/history/page.tsx
/**
 * =============================================================================
 * Watch History Page
 * =============================================================================
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { TitleCard } from "@/components/ui/TitleCard";
import { TitleCardSkeleton } from "@/components/ui/Skeletons";
import { useQuery } from "@tanstack/react-query";
import { History, Clock } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.progress.getHistory(1, 50),
  });

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <History className="h-8 w-8" />
              Watch History
            </h1>
            <p className="mt-2 text-muted-foreground">
              Pick up where you left off
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {Array.from({ length: 14 }).map((_, i) => (
                <TitleCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {data.items.map((progress) => {
                // Note: You'll need to fetch the title data for each progress item
                // For now, showing a simplified version
                return (
                  <div key={progress.id} className="space-y-2">
                    <Link
                      href={`/title/${progress.title_id}`}
                      className="group relative block overflow-hidden rounded-md"
                    >
                      <div className="aspect-[2/3] bg-muted">
                        {/* Title poster would go here */}
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                          <Clock className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {progress.progress_seconds && progress.duration_seconds && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(progress.progress_seconds / progress.duration_seconds) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </Link>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(progress.last_watched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">No watch history yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start watching to see your history here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
