// app/(protected)/admin/titles/page.tsx
/**
 * =============================================================================
 * Admin - Content Management
 * =============================================================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, Film, Tv } from "lucide-react";
import type { Title } from "@/lib/api/types";

export default function AdminTitlesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | "MOVIE" | "SERIES">("ALL");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "titles", searchQuery, typeFilter, page],
    queryFn: () =>
      api.discovery.browse({
        q: searchQuery || undefined,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        page,
        page_size: 20,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteTitle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "titles"] });
    },
  });

  const handleDelete = async (title: Title) => {
    if (confirm(`Are you sure you want to delete "${title.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(title.id);
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Content Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage movies and series
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/titles/new">
                <Plus className="h-4 w-4" />
                Add Title
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={typeFilter === "MOVIE" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("MOVIE")}
              >
                <Film className="h-4 w-4" />
                Movies
              </Button>
              <Button
                variant={typeFilter === "SERIES" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("SERIES")}
              >
                <Tv className="h-4 w-4" />
                Series
              </Button>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Year</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Rating</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((title) => (
                    <tr key={title.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {title.poster_url ? (
                            <img
                              src={title.poster_url}
                              alt={title.name}
                              className="h-12 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-8 items-center justify-center rounded bg-muted">
                              <Film className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{title.name}</p>
                            {title.original_name && title.original_name !== title.name && (
                              <p className="text-xs text-muted-foreground">
                                {title.original_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">
                        {title.type.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">{title.release_year || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                          {title.status.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {title.vote_average ? `⭐ ${title.vote_average.toFixed(1)}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/title/${title.slug || title.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/titles/${title.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(title)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">No titles found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search" : "Add your first title"}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of{" "}
                {data.total} titles
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
