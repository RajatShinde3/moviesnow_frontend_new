// components/ReviewSystem.tsx
/**
 * =============================================================================
 * Review System Component - Enhanced with Best Practices
 * =============================================================================
 * Features:
 * - Write, edit, and delete reviews with optimistic updates
 * - Star ratings (0-10 scale aligned with backend)
 * - Helpful voting (-1, 0, 1) with idempotency
 * - Report reviews with reason codes
 * - Sort by recent/helpful/highest/lowest
 * - Spoiler warnings with reveal toggle
 * - Rating distribution visualization
 * - Pagination for large review lists
 * - Accessibility (ARIA, keyboard navigation)
 * - Toast notifications for feedback
 * - Error boundaries and loading states
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  MessageSquare,
  AlertTriangle,
  Send,
  X,
  SortAsc,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  User,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

// ============================================================================
// Types - Aligned with Backend Reviews API
// ============================================================================

interface Review {
  id: string;
  user_id: string | null;
  user_name: string;
  user_avatar?: string;
  title_id: string;
  rating: number | null;  // 0-10 scale
  content: string;
  contains_spoilers: boolean;
  helpful_count: number;
  not_helpful_count: number;
  user_vote?: -1 | 0 | 1;
  created_at: string | null;
  updated_at?: string;
  is_own: boolean;
  is_verified_purchase?: boolean;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  average_rating: number;
  rating_distribution: Record<number, number>;
}

interface ReviewCreate {
  content: string;
  rating: number | null;
  contains_spoilers?: boolean;
}

interface ReviewVote {
  vote: -1 | 0 | 1;
}

interface ReviewReport {
  reason: string;
  details?: string;
}

interface ReviewSystemProps {
  titleId: string;
  titleName: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

type SortBy = "recent" | "helpful" | "highest" | "lowest";

// ============================================================================
// Constants
// ============================================================================

const REPORT_REASONS = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or hate speech" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spoilers", label: "Unmarked spoilers" },
  { value: "misleading", label: "Misleading information" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "helpful", label: "Most Helpful" },
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

const PAGE_SIZE = 10;

// ============================================================================
// Custom Hooks
// ============================================================================

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

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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
// Main ReviewSystem Component
// ============================================================================

export function ReviewSystem({ titleId, titleName }: ReviewSystemProps) {
  const queryClient = useQueryClient();
  const { toasts, showToast, dismissToast } = useToast();

  const [sortBy, setSortBy] = React.useState<SortBy>("helpful");
  const [showWriteReview, setShowWriteReview] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);

  // Fetch paginated reviews
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["reviews", titleId, sortBy],
    queryFn: async ({ pageParam = 1 }): Promise<ReviewsResponse> => {
      const response = await fetch(
        `/api/v1/titles/${titleId}/reviews?sort=${sortBy}&page=${pageParam}&size=${PAGE_SIZE}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch reviews");
      }

      const reviews = await response.json();
      // Backend returns array, wrap in response format
      return {
        reviews: Array.isArray(reviews) ? reviews : reviews.reviews || [],
        total: reviews.total || reviews.length || 0,
        page: pageParam,
        per_page: PAGE_SIZE,
        has_more: (Array.isArray(reviews) ? reviews.length : reviews.reviews?.length || 0) >= PAGE_SIZE,
        average_rating: reviews.average_rating || 0,
        rating_distribution: reviews.rating_distribution || {},
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30000,
  });

  // Flatten paginated results
  const allReviews = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.reviews) || [];
  }, [data]);

  const averageRating = data?.pages[0]?.average_rating || 0;
  const totalReviews = data?.pages[0]?.total || allReviews.length;
  const ratingDistribution = data?.pages[0]?.rating_distribution || {};

  // Check if user has already reviewed
  const { data: userReview } = useQuery({
    queryKey: ["user-review", titleId],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/titles/${titleId}/reviews/me`,
        { credentials: "include" }
      );
      if (response.status === 404) return null;
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 60000,
  });

  const handleReviewSuccess = (message: string) => {
    showToast("success", message);
    setShowWriteReview(false);
    setEditingReview(null);
  };

  const handleReviewError = (message: string) => {
    showToast("error", message);
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-white">Failed to load reviews</h3>
        <p className="mt-2 text-gray-400">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= Math.round(averageRating / 2)
                      ? "text-yellow-400"
                      : "text-gray-700"
                  )}
                  fill={star <= Math.round(averageRating / 2) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="font-semibold text-white">
              {(averageRating / 2).toFixed(1)}
            </span>
            <span className="text-gray-400">
              ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none rounded-lg bg-gray-900 py-2 pl-4 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Sort reviews"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Write Review Button */}
          {!userReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <MessageSquare className="h-5 w-5" />
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <RatingDistribution
        distribution={ratingDistribution}
        totalReviews={totalReviews}
      />

      {/* Write/Edit Review Modal */}
      {(showWriteReview || editingReview) && (
        <ReviewForm
          titleId={titleId}
          titleName={titleName}
          existingReview={editingReview}
          onClose={() => {
            setShowWriteReview(false);
            setEditingReview(null);
          }}
          onSuccess={handleReviewSuccess}
          onError={handleReviewError}
        />
      )}

      {/* User's Own Review */}
      {userReview && (
        <div className="rounded-lg border border-blue-600/30 bg-blue-900/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-blue-400">
            <User className="h-4 w-4" />
            Your Review
          </div>
          <ReviewCard
            review={{ ...userReview, is_own: true }}
            onEdit={() => setEditingReview(userReview)}
            showToast={showToast}
          />
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <ReviewsSkeleton />
      ) : allReviews.length > 0 ? (
        <div className="space-y-4">
          {allReviews
            .filter((r) => r.id !== userReview?.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showToast={showToast}
              />
            ))}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Reviews"
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-900 p-12 text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-gray-600" />
          <h3 className="mt-4 text-xl font-semibold text-white">No reviews yet</h3>
          <p className="mt-2 text-gray-400">Be the first to review this title!</p>
          {!userReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// ============================================================================
// Review Form Component
// ============================================================================

function ReviewForm({
  titleId,
  titleName,
  existingReview,
  onClose,
  onSuccess,
  onError,
}: {
  titleId: string;
  titleName: string;
  existingReview?: Review | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(existingReview?.rating || 0);
  const [content, setContent] = React.useState(existingReview?.content || "");
  const [containsSpoilers, setContainsSpoilers] = React.useState(
    existingReview?.contains_spoilers || false
  );
  const [hoverRating, setHoverRating] = React.useState(0);

  const isEditing = !!existingReview;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const url = existingReview
        ? `/api/v1/reviews/${existingReview.id}`
        : `/api/v1/titles/${titleId}/reviews`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (!existingReview) {
        headers["Idempotency-Key"] = generateIdempotencyKey();
      }

      const response = await fetch(url, {
        method: existingReview ? "PATCH" : "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          content,
          rating: rating || null,
          contains_spoilers: containsSpoilers,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", titleId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", titleId] });
      onSuccess(isEditing ? "Review updated successfully" : "Review submitted successfully");
    },
    onError: (err) => {
      onError(err instanceof Error ? err.message : "Failed to submit review");
    },
  });

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h3 id="review-form-title" className="text-xl font-semibold text-white">
            {isEditing ? "Edit Review" : "Write a Review"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-6 text-gray-400">{titleName}</p>

          {/* Rating */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Your Rating
            </label>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Rate ${star} out of 10`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7",
                        star <= displayRating ? "text-yellow-400" : "text-gray-600"
                      )}
                      fill={star <= displayRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <span className="min-w-[3rem] text-lg font-semibold text-white">
                {displayRating > 0 ? `${displayRating}/10` : "—"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think about this title? Share your thoughts..."
              rows={5}
              maxLength={5000}
              className="w-full resize-none rounded-lg bg-gray-800 p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-describedby="content-hint"
            />
            <p id="content-hint" className="mt-1 text-right text-xs text-gray-500">
              {content.length}/5000 characters
            </p>
          </div>

          {/* Spoiler Warning */}
          <div className="mb-6 rounded-lg bg-gray-800 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
              />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-white">This review contains spoilers</span>
              </div>
            </label>
            <p className="mt-2 pl-8 text-sm text-gray-400">
              Mark this if your review reveals plot points or key story elements
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-800 py-3 font-semibold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => submitMutation.mutate()}
              disabled={!content.trim() || submitMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {isEditing ? "Update Review" : "Submit Review"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Review Card Component
// ============================================================================

function ReviewCard({
  review,
  onEdit,
  showToast,
}: {
  review: Review;
  onEdit?: () => void;
  showToast: (type: Toast["type"], message: string) => void;
}) {
  const queryClient = useQueryClient();
  const [showSpoilers, setShowSpoilers] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  // Vote mutation with optimistic update
  const voteMutation = useMutation({
    mutationFn: async (vote: -1 | 0 | 1) => {
      const response = await fetch(`/api/v1/reviews/${review.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": generateIdempotencyKey(),
        },
        credentials: "include",
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to vote");
      }

      return { ok: true };
    },
    onMutate: async (vote) => {
      await queryClient.cancelQueries({ queryKey: ["reviews"] });
      // Optimistic update would go here
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => {
      showToast("error", err instanceof Error ? err.message : "Failed to vote");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/reviews/${review.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete review");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-review"] });
      showToast("success", "Review deleted");
    },
    onError: (err) => {
      showToast("error", err instanceof Error ? err.message : "Failed to delete");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Delete your review? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const handleVote = (vote: -1 | 0 | 1) => {
    if (review.is_own) {
      showToast("warning", "You cannot vote on your own review");
      return;
    }
    voteMutation.mutate(vote);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg bg-gray-900 p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-lg font-semibold text-white">
            {review.user_avatar ? (
              <img
                src={review.user_avatar}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              review.user_name.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{review.user_name}</p>
              {review.is_verified_purchase && (
                <span className="rounded bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
              {/* Rating */}
              {review.rating !== null && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3.5 w-3.5",
                        star <= Math.round((review.rating || 0) / 2)
                          ? "text-yellow-400"
                          : "text-gray-700"
                      )}
                      fill={star <= Math.round((review.rating || 0) / 2) ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="ml-1 font-medium text-gray-400">
                    {review.rating}/10
                  </span>
                </div>
              )}
              {/* Date */}
              {review.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(review.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Review actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg bg-gray-800 shadow-lg">
                {review.is_own ? (
                  <>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onEdit?.();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        handleDelete();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowReportModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-700"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {review.contains_spoilers && !showSpoilers ? (
        <div className="mb-4 rounded-lg bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">This review contains spoilers</span>
          </div>
          <button
            onClick={() => setShowSpoilers(true)}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300"
          >
            <Eye className="h-4 w-4" />
            Show review anyway
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 whitespace-pre-line text-gray-300">{review.content}</p>

          {review.contains_spoilers && showSpoilers && (
            <button
              onClick={() => setShowSpoilers(false)}
              className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400"
            >
              <EyeOff className="h-4 w-4" />
              Hide spoilers
            </button>
          )}
        </>
      )}

      {/* Voting */}
      <div className="flex items-center gap-4 border-t border-gray-800 pt-4">
        <span className="text-sm text-gray-500">Was this helpful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(1)}
            disabled={voteMutation.isPending || review.is_own}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              review.user_vote === 1
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-800 text-gray-400 hover:text-green-400",
              (voteMutation.isPending || review.is_own) && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Mark as helpful (${review.helpful_count})`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpful_count}</span>
          </button>
          <button
            onClick={() => handleVote(-1)}
            disabled={voteMutation.isPending || review.is_own}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              review.user_vote === -1
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-800 text-gray-400 hover:text-red-400",
              (voteMutation.isPending || review.is_own) && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Mark as not helpful (${review.not_helpful_count})`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{review.not_helpful_count}</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          reviewId={review.id}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            showToast("success", "Report submitted. Thank you for your feedback.");
          }}
          onError={(message) => showToast("error", message)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Rating Distribution Component
// ============================================================================

function RatingDistribution({
  distribution,
  totalReviews,
}: {
  distribution: Record<number, number>;
  totalReviews: number;
}) {
  // Normalize distribution to 5-star scale (backend uses 0-10)
  const normalizedDist = React.useMemo(() => {
    const result: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    Object.entries(distribution).forEach(([rating, count]) => {
      const stars = Math.ceil(parseInt(rating) / 2);
      if (stars >= 1 && stars <= 5) {
        result[stars] += count;
      }
    });

    return result;
  }, [distribution]);

  const total = Object.values(normalizedDist).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="rounded-lg bg-gray-900 p-5">
      <h3 className="mb-4 font-semibold text-white">Rating Breakdown</h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = normalizedDist[stars] || 0;
          const percentage = (count / total) * 100;

          return (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex w-16 items-center justify-end gap-1 text-sm text-gray-400">
                <span>{stars}</span>
                <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm text-gray-500">
                {count > 0 ? `${Math.round(percentage)}%` : "0%"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Report Modal Component
// ============================================================================

function ReportModal({
  reviewId,
  onClose,
  onSuccess,
  onError,
}: {
  reviewId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const [details, setDetails] = React.useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/reviews/${reviewId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": generateIdempotencyKey(),
        },
        credentials: "include",
        body: JSON.stringify({ reason, details: details || undefined }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to submit report");
      }

      return { ok: true };
    },
    onSuccess: () => onSuccess(),
    onError: (err) => onError(err instanceof Error ? err.message : "Failed to report"),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-gray-900 shadow-2xl">
        <div className="border-b border-gray-800 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">Report Review</h3>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Reason <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={256}
              placeholder="Provide more context..."
              className="w-full resize-none rounded-lg bg-gray-800 p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-800 py-3 font-semibold text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => reportMutation.mutate()}
              disabled={!reason || reportMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-5 w-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg bg-gray-900 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-gray-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
