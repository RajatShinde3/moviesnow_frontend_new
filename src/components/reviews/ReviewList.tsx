/**
 * =============================================================================
 * ReviewList Component
 * =============================================================================
 * Displays paginated list of reviews with filtering and sorting
 */

'use client';

import { useState } from 'react';
import { ChevronDown, Filter, PenSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import { useReviews } from '@/lib/api/hooks/useReviews';
import { Review } from '@/lib/api/services/reviews';
// Auth store not needed - using hooks instead

interface ReviewListProps {
  titleId: string;
  titleName: string;
}

export default function ReviewList({ titleId, titleName }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();

  // Auth store temporarily disabled - using hooks instead
  const accessToken = null;
  const { data, isLoading, error } = useReviews(titleId, {
    page,
    page_size: 10,
    sort,
    rating_filter: ratingFilter,
  });

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReview(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Reviews</h2>
          {data && (
            <div className="flex items-center gap-4 text-gray-400">
              <span>{data.total} reviews</span>
              {data.average_rating && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={data.average_rating} size="sm" showNumber={false} />
                    <span>{data.average_rating.toFixed(1)}/10 average</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {accessToken && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg shadow-red-500/20"
          >
            <PenSquare className="h-5 w-5" />
            Write Review
          </button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="appearance-none px-4 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rated</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-1">
            {[10, 8, 6, 4, 2].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(ratingFilter === rating ? undefined : rating)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  ratingFilter === rating
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {rating}+
              </button>
            ))}
            {ratingFilter && (
              <button
                onClick={() => setRatingFilter(undefined)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/6" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-800 rounded w-5/6" />
                <div className="h-3 bg-gray-800 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load reviews. Please try again.</p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.items.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                titleId={titleId}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.total > 10 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {page} of {Math.ceil(data.total / 10)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 10)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
          <p className="text-gray-400 mb-4">No reviews yet. Be the first to review!</p>
          {accessToken && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium"
            >
              Write the First Review
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          titleId={titleId}
          titleName={titleName}
          existingReview={editingReview}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
