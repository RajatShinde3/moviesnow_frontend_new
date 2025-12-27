/**
 * =============================================================================
 * Reviews API Service
 * =============================================================================
 * Handles all review-related API calls for the MoviesNow platform
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Review {
  id: string;
  user_id: string;
  title_id: string;
  rating: number; // 1-10
  content: string;
  spoiler: boolean;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  user: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
  };
  user_vote?: 'helpful' | 'not_helpful' | null;
}

export interface CreateReviewData {
  rating: number; // 1-10
  content: string;
  spoiler?: boolean;
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
  spoiler?: boolean;
}

export interface ReviewsListResponse {
  items: Review[];
  total: number;
  page: number;
  page_size: number;
  average_rating?: number;
}

export interface ReviewVoteData {
  vote: 'helpful' | 'not_helpful';
}

export interface ReportReviewData {
  reason: 'spam' | 'offensive' | 'spoiler' | 'inappropriate' | 'other';
  details?: string;
}

/**
 * Reviews Service
 */
export const reviewsService = {
  /**
   * Get reviews for a title
   */
  async listReviews(
    titleId: string,
    options?: {
      page?: number;
      page_size?: number;
      sort?: 'recent' | 'helpful' | 'rating';
      rating_filter?: number;
    }
  ): Promise<ReviewsListResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.rating_filter) params.append('rating', options.rating_filter.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`${API_BASE}/api/v1/titles/${titleId}/reviews${query}`);
  },

  /**
   * Create a new review
   */
  async createReview(titleId: string, data: CreateReviewData): Promise<Review> {
    return fetchJson(`${API_BASE}/api/v1/titles/${titleId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    return fetchJson(`${API_BASE}/api/v1/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Vote on a review (helpful/not helpful)
   */
  async voteReview(reviewId: string, vote: 'helpful' | 'not_helpful'): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  },

  /**
   * Report a review
   */
  async reportReview(reviewId: string, data: ReportReviewData): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default reviewsService;
