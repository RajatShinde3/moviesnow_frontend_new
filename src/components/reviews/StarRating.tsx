/**
 * =============================================================================
 * StarRating Component
 * =============================================================================
 * Interactive star rating component with hover effects
 */

'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showNumber?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 10,
  size = 'md',
  interactive = false,
  onChange,
  showNumber = true,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Convert rating (1-10) to stars (0-5)
  const stars = maxRating === 10 ? Math.round(rating / 2) : rating;
  const displayRating = hoveredRating !== null && interactive ? hoveredRating : stars;

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      // Convert star index (1-5) back to rating (1-10)
      const newRating = maxRating === 10 ? starIndex * 2 : starIndex;
      onChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= displayRating;
          const isHalfFilled = starIndex === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => interactive && setHoveredRating(starIndex)}
              onMouseLeave={() => interactive && setHoveredRating(null)}
              className={`
                transition-all duration-200
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                ${interactive ? 'hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}
              `}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  transition-colors duration-200
                  ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : isHalfFilled
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : interactive && hoveredRating && starIndex <= hoveredRating
                      ? 'fill-yellow-400/30 text-yellow-400/50'
                      : 'fill-gray-600 text-gray-600'
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className={`font-medium text-gray-300 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}/10
        </span>
      )}
    </div>
  );
}
