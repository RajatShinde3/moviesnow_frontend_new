// app/(protected)/genre/[slug]/page.tsx
/**
 * =============================================================================
 * Genre Page - Browse titles by genre
 * =============================================================================
 */

import * as React from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api/services";
import { TitleGrid } from "@/components/ui/TitleGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  try {
    const [genres, titles] = await Promise.all([
      api.discovery.getGenres(),
      api.discovery.getTitlesByGenre(slug, { page, page_size: 24 }),
    ]);

    const genre = genres?.find((g) => g.slug === slug);

    if (!genre || !titles) {
      notFound();
    }

    return (
      <div className="min-h-screen">
        <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold">{genre.name}</h1>
              {genre.description && (
                <p className="mt-2 text-muted-foreground">{genre.description}</p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                {titles.total} {titles.total === 1 ? "title" : "titles"} found
              </p>
            </div>

            {/* Grid */}
            <TitleGrid
              titles={titles.items || []}
              showMetadata
              emptyMessage={`No ${genre.name.toLowerCase()} titles found`}
            />

            {/* Pagination */}
            {titles.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  asChild={page > 1}
                >
                  {page > 1 ? (
                    <Link href={`/genre/${slug}?page=${page - 1}`}>Previous</Link>
                  ) : (
                    <span>Previous</span>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {titles.total_pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= titles.total_pages}
                  asChild={page < titles.total_pages}
                >
                  {page < titles.total_pages ? (
                    <Link href={`/genre/${slug}?page=${page + 1}`}>Next</Link>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load genre page:", error);
    notFound();
  }
}
