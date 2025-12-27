/**
 * =============================================================================
 * useReviews Hook
 * =============================================================================
 * React Query hooks for managing reviews
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService, CreateReviewData, UpdateReviewData, ReportReviewData } from '../services/reviews';
import { toast } from 'sonner';

/**
 * Hook to fetch reviews for a title
 */
export function useReviews(
  titleId: string,
  options?: {
    page?: number;
    page_size?: number;
    sort?: 'recent' | 'helpful' | 'rating';
    rating_filter?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['reviews', titleId, options],
    queryFn: () => reviewsService.listReviews(titleId, options),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a review
 */
export function useCreateReview(titleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsService.createReview(titleId, data),
    onSuccess: () => {
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['reviews', titleId] });
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit review');
    },
  });
}

/**
 * Hook to update a review
 */
export function useUpdateReview(reviewId: string, titleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReviewData) => reviewsService.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', titleId] });
      toast.success('Review updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update review');
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview(reviewId: string, titleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reviewsService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', titleId] });
      toast.success('Review deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete review');
    },
  });
}

/**
 * Hook to vote on a review
 */
export function useVoteReview(titleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, vote }: { reviewId: string; vote: 'helpful' | 'not_helpful' }) =>
      reviewsService.voteReview(reviewId, vote),
    onSuccess: () => {
      // Optimistically update the UI
      queryClient.invalidateQueries({ queryKey: ['reviews', titleId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to vote on review');
    },
  });
}

/**
 * Hook to report a review
 */
export function useReportReview(titleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReportReviewData }) =>
      reviewsService.reportReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', titleId] });
      toast.success('Review reported. Thank you for your feedback.');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to report review');
    },
  });
}
