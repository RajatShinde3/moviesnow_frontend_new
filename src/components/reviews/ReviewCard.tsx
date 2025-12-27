/**
 * =============================================================================
 * ReviewCard Component
 * =============================================================================
 * Displays a single review with vote and report functionality
 */

'use client';

import { useState, useMemo } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import StarRating from './StarRating';
import { Review } from '@/lib/api/services/reviews';
import { useVoteReview, useDeleteReview, useReportReview } from '@/lib/api/hooks/useReviews';
import { useAuthStore } from '@/lib/auth_store';
import LoginModal, { useLoginModal } from '@/components/auth/LoginModal';

interface ReviewCardProps {
  review: Review;
  titleId: string;
  onEdit?: (review: Review) => void;
  showActions?: boolean;
}

export default function ReviewCard({ review, titleId, onEdit, showActions = true }: ReviewCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('spam');
  const [reportDetails, setReportDetails] = useState('');

  const { accessToken, user } = useAuthStore();
  const { isOpen, openLoginModal, closeLoginModal, config } = useLoginModal();
  const voteReview = useVoteReview(titleId);
  const deleteReview = useDeleteReview(review.id, titleId);
  const reportReviewMutation = useReportReview(titleId);

  // Check if current user is the author
  const isOwnReview = useMemo(() => {
    return user?.id === review.user_id;
  }, [user?.id, review.user_id]);

  const handleVote = async (vote: 'helpful' | 'not_helpful') => {
    if (!accessToken) {
      openLoginModal('Sign In to Vote', 'Please sign in to vote on reviews');
      return;
    }
    await voteReview.mutateAsync({ reviewId: review.id, vote });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview.mutateAsync();
    }
  };

  const handleReport = async () => {
    if (!accessToken) return;

    await reportReviewMutation.mutateAsync({
      reviewId: review.id,
      data: {
        reason: reportReason as any,
        details: reportDetails,
      },
    });

    setShowReportModal(false);
    setReportReason('spam');
    setReportDetails('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
              {review.user.full_name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div>
              <h4 className="font-semibold text-white">{review.user.full_name}</h4>
              <p className="text-sm text-gray-400">{formatDate(review.created_at)}</p>
            </div>
          </div>

          {/* Rating */}
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Review Content */}
        <div className="mb-4">
          {review.spoiler && (
            <div className="flex items-center gap-2 mb-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Contains Spoilers</span>
            </div>
          )}
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{review.content}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center gap-4">
              {/* Helpful Button */}
              <button
                onClick={() => handleVote('helpful')}
                disabled={voteReview.isPending}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    review.user_vote === 'helpful'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful</span>
                {review.helpful_count > 0 && (
                  <span className="text-xs">({review.helpful_count})</span>
                )}
              </button>

              {/* Not Helpful Button */}
              <button
                onClick={() => handleVote('not_helpful')}
                disabled={voteReview.isPending}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    review.user_vote === 'not_helpful'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>

            {/* Edit/Delete/Report */}
            <div className="flex items-center gap-2">
              {isOwnReview ? (
                <>
                  <button
                    onClick={() => onEdit?.(review)}
                    className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteReview.isPending}
                    className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-all duration-200"
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isOpen}
        onClose={closeLoginModal}
        title={config.title}
        message={config.message}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Report Review</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="spam">Spam</option>
                  <option value="offensive">Offensive Content</option>
                  <option value="spoiler">Unmarked Spoiler</option>
                  <option value="inappropriate">Inappropriate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Provide additional context..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reportReviewMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {reportReviewMutation.isPending ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
