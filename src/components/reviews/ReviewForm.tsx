/**
 * =============================================================================
 * ReviewForm Component
 * =============================================================================
 * Form for creating/editing reviews with star rating
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { Review } from '@/lib/api/services/reviews';
import { useCreateReview, useUpdateReview } from '@/lib/api/hooks/useReviews';

interface ReviewFormProps {
  titleId: string;
  titleName: string;
  existingReview?: Review;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewForm({
  titleId,
  titleName,
  existingReview,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 7);
  const [content, setContent] = useState(existingReview?.content || '');
  const [spoiler, setSpoiler] = useState(existingReview?.spoiler || false);

  const createReview = useCreateReview(titleId);
  const updateReview = useUpdateReview(existingReview?.id || '', titleId);

  const isEditing = !!existingReview;
  const mutation = isEditing ? updateReview : createReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    try {
      await mutation.mutateAsync({
        rating,
        content: content.trim(),
        spoiler,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled by React Query
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <p className="text-gray-400 mt-1">{titleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Rating
            </label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
                showNumber={false}
              />
              <span className="text-2xl font-bold text-white">{rating}/10</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click on the stars to rate (1-10 scale)
            </p>
          </div>

          {/* Review Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Your Review
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              minLength={10}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none transition-colors"
              placeholder="Share your thoughts about this title... What did you like or dislike? (Minimum 10 characters)"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">Minimum 10 characters</p>
              <p className="text-sm text-gray-500">{content.length}/2000</p>
            </div>
          </div>

          {/* Spoiler Warning */}
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <input
              type="checkbox"
              id="spoiler"
              checked={spoiler}
              onChange={(e) => setSpoiler(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="spoiler" className="text-sm text-gray-300 cursor-pointer">
              This review contains spoilers
            </label>
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Be respectful and constructive in your feedback</li>
              <li>• Focus on the content, not other reviewers</li>
              <li>• Mark reviews as containing spoilers when appropriate</li>
              <li>• Keep your review relevant to the title</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || content.trim().length < 10}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </span>
              ) : isEditing ? (
                'Update Review'
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
