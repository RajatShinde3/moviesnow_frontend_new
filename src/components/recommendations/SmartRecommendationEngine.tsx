/**
 * =============================================================================
 * Smart Recommendation Engine
 * =============================================================================
 * AI-powered content suggestions with explanation cards
 */

'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Heart, Clock, Users, Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationReason {
  type: 'genre_match' | 'similar_users' | 'trending' | 'watch_history' | 'rating';
  weight: number;
  description: string;
}

interface SmartRecommendation {
  id: string;
  title: string;
  thumbnail: string;
  matchScore: number;
  reasons: RecommendationReason[];
  metadata: {
    year: number;
    rating: number;
    genres: string[];
    duration?: number;
  };
}

interface SmartRecommendationEngineProps {
  recommendations: SmartRecommendation[];
  onTitleClick: (id: string) => void;
  onRefresh?: () => void;
}

export default function SmartRecommendationEngine({
  recommendations,
  onTitleClick,
  onRefresh,
}: SmartRecommendationEngineProps) {
  const [selectedRec, setSelectedRec] = useState<SmartRecommendation | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'genre_match':
        return <Sparkles className="h-4 w-4" />;
      case 'similar_users':
        return <Users className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'watch_history':
        return <Clock className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case 'genre_match':
        return 'text-purple-400 bg-purple-500/20';
      case 'similar_users':
        return 'text-blue-400 bg-blue-500/20';
      case 'trending':
        return 'text-orange-400 bg-orange-500/20';
      case 'watch_history':
        return 'text-green-400 bg-green-500/20';
      case 'rating':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Smart Recommendations</h2>
            <p className="text-sm text-gray-400">Personalized just for you</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTitleClick(rec.id)}
            className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-800">
              {rec.thumbnail && (
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Match Score Badge */}
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-purple-400" />
                <span className="text-white font-bold">{rec.matchScore}%</span>
                <span className="text-xs text-gray-400">match</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                {rec.title}
              </h3>

              {/* Metadata */}
              <div className="flex items-center gap-3 mb-3 text-sm text-gray-400">
                <span>{rec.metadata.year}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  {rec.metadata.rating.toFixed(1)}
                </span>
                {rec.metadata.duration && <span>{rec.metadata.duration}min</span>}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {rec.metadata.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Top Reason */}
              {rec.reasons.length > 0 && (
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${getReasonColor(
                      rec.reasons[0].type
                    )}`}
                  >
                    {getReasonIcon(rec.reasons[0].type)}
                    <span>{rec.reasons[0].description}</span>
                  </div>

                  {rec.reasons.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRec(rec);
                        setShowExplanation(true);
                      }}
                      className="p-1 hover:bg-gray-800 rounded transition-colors"
                    >
                      <Info className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explanation Modal */}
      {showExplanation && selectedRec && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white mb-1">Why we recommend this</h3>
              <p className="text-gray-400 text-sm">{selectedRec.title}</p>
            </div>

            {/* Match Score */}
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Heart className="h-8 w-8 text-purple-400" />
                <span className="text-5xl font-black text-white">
                  {selectedRec.matchScore}%
                </span>
              </div>
              <p className="text-center text-gray-400 text-sm">
                Match based on your preferences
              </p>
            </div>

            {/* Reasons */}
            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              {selectedRec.reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getReasonColor(
                      reason.type
                    )}`}
                  >
                    {getReasonIcon(reason.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">
                      {reason.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${reason.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {Math.round(reason.weight * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => setShowExplanation(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-750 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowExplanation(false);
                  onTitleClick(selectedRec.id);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
              >
                Watch Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
