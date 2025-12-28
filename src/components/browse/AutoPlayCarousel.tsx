/**
 * =============================================================================
 * Auto-Play Carousel
 * =============================================================================
 * Netflix-style carousel with auto-advance and video previews
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Plus, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoPreview?: string;
  rating?: number;
  year?: number;
  genres?: string[];
}

interface AutoPlayCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
  showControls?: boolean;
  onPlay?: (id: string) => void;
  onAddToList?: (id: string) => void;
  onMoreInfo?: (id: string) => void;
}

export default function AutoPlayCarousel({
  items,
  autoPlayInterval = 5000,
  showControls = true,
  onPlay,
  onAddToList,
  onMoreInfo,
}: AutoPlayCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const currentItem = items[currentIndex];

  // Auto-advance
  useEffect(() => {
    if (isHovered || items.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isHovered, items.length, autoPlayInterval]);

  // Play video preview on hover
  useEffect(() => {
    if (isHovered && currentItem.videoPreview && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch((error) => {
            console.error('Video play failed:', error);
          });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [isHovered, currentItem.videoPreview]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden rounded-2xl bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image/Video */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {currentItem.videoPreview && isVideoPlaying ? (
            <video
              ref={videoRef}
              src={currentItem.videoPreview}
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentItem.thumbnail}
              alt={currentItem.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-2xl px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
                {currentItem.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4">
                {currentItem.rating && (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-bold">{currentItem.rating.toFixed(1)}</span>
                  </div>
                )}
                {currentItem.year && (
                  <span className="text-gray-300 font-medium">{currentItem.year}</span>
                )}
                {currentItem.genres && currentItem.genres.length > 0 && (
                  <div className="flex gap-2">
                    {currentItem.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-gray-800/60 backdrop-blur-sm rounded text-sm text-gray-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-lg text-gray-200 mb-6 line-clamp-3 drop-shadow-lg max-w-xl">
                {currentItem.description}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay?.(currentItem.id)}
                  className="px-8 py-3 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 flex items-center gap-2 shadow-2xl"
                >
                  <Play className="h-6 w-6" />
                  Play
                </button>

                <button
                  onClick={() => onMoreInfo?.(currentItem.id)}
                  className="px-6 py-3 bg-gray-600/80 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <Info className="h-5 w-5" />
                  More Info
                </button>

                <button
                  onClick={() => onAddToList?.(currentItem.id)}
                  className="p-3 bg-gray-800/80 backdrop-blur-sm text-white rounded-full hover:bg-gray-700 transition-all hover:scale-110"
                  title="Add to My List"
                >
                  <Plus className="h-6 w-6" />
                </button>

                {currentItem.videoPreview && isVideoPlaying && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 bg-gray-800/80 backdrop-blur-sm text-white rounded-full hover:bg-gray-700 transition-all"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-4 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Age Rating (if available) */}
      <div className="absolute top-6 right-6 px-3 py-1 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600 rounded text-white font-bold text-sm">
        13+
      </div>
    </div>
  );
}
