// app/(protected)/title/[slug]/ReviewsSection.tsx
"use client";

import * as React from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/api/types";

export function ReviewsSection({ reviews, titleId }: { reviews: Review[]; titleId: string }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <button className="text-sm text-primary hover:underline">
          Write a Review
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expanded.has(review.id);
          const needsTruncation = (review.review_text?.length || 0) > 300;

          return (
            <div key={review.id} className="rounded-lg border bg-card p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {review.user?.full_name || review.user?.username || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Rating */}
                {review.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{review.rating}/10</span>
                  </div>
                )}
              </div>

              {/* Review Text */}
              {review.review_text && (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {isExpanded || !needsTruncation
                      ? review.review_text
                      : `${review.review_text.slice(0, 300)}...`}
                  </p>
                  {needsTruncation && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              {/* Spoiler Warning */}
              {review.is_spoiler && (
                <div className="mt-3 inline-block rounded bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  ⚠️ Contains Spoilers
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
