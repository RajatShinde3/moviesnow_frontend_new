import React from 'react';
/**
 * =============================================================================
 * Infinite Scroll Component
 * =============================================================================
 * Automatically loads more content as user scrolls
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
}

export default function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.8,
  loader,
  endMessage,
  className = '',
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Fallback scroll detection
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
    >
      {children}

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4" />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          {loader || (
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {!hasMore && !isLoading && endMessage && (
        <div className="flex justify-center py-8">
          {endMessage}
        </div>
      )}
    </div>
  );
}

// Hook for managing infinite scroll state
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  initialPage = 1
) {
  const [items, setItems] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(initialPage);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await fetchFunction(page);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, fetchFunction]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  return {
    items,
    hasMore,
    isLoading,
    loadMore,
    reset,
  };
}
