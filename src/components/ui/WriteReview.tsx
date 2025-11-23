// components/ui/WriteReview.tsx
/**
 * =============================================================================
 * Write Review Component
 * =============================================================================
 * Allows users to write and submit reviews with ratings
 */

"use client";

import * as React from "react";
import { Star, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WriteReviewProps {
  titleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WriteReview({ titleId, onClose, onSuccess }: WriteReviewProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [content, setContent] = React.useState("");
  const [containsSpoilers, setContainsSpoilers] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submitReview = useMutation({
    mutationFn: async () => {
      if (rating === 0) {
        throw new Error("Please select a rating");
      }
      if (content.trim().length < 10) {
        throw new Error("Review must be at least 10 characters");
      }

      return api.reviews.create(titleId, {
        rating,
        review_text: content.trim(),
        is_spoiler: containsSpoilers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", titleId] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submitReview.mutate();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Write a Review</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium">Your Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 flex items-center text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">
              Your Review *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this title..."
              className="min-h-[150px] w-full rounded-lg border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none"
              maxLength={5000}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span>{content.length} / 5000</span>
            </div>
          </div>

          {/* Spoiler Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
            <input
              type="checkbox"
              id="spoilers"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-orange-500 text-orange-500 focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="spoilers" className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>This review contains spoilers</span>
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Check this if your review reveals important plot details
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitReview.isPending}>
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>

        {/* Guidelines */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
          <p className="font-medium">Review Guidelines:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Be respectful and constructive</li>
            <li>Focus on the content, not other reviewers</li>
            <li>Mark spoilers appropriately</li>
            <li>Keep it relevant to the title</li>
          </ul>
        </div>
      </div>
    </>
  );
}

// Review Button Component
interface WriteReviewButtonProps {
  titleId: string;
  className?: string;
}

export function WriteReviewButton({ titleId, className }: WriteReviewButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        <Star className="h-4 w-4" />
        Write a Review
      </Button>

      {isOpen && (
        <WriteReview titleId={titleId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
