/**
 * =============================================================================
 * TitleDetailPage Component
 * =============================================================================
 * Complete title detail page with backdrop, metadata, cast, episodes, and more
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Plus,
  Check,
  Share2,
  ThumbsUp,
  Star,
  Calendar,
  Clock,
  Film,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TitleDetailPageProps {
  titleId: string;
}

interface Title {
  id: string;
  name: string;
  type: 'movie' | 'series' | 'anime' | 'documentary';
  description: string;
  backdrop_url?: string;
  poster_url?: string;
  release_year: number;
  rating_average: number;
  rating_count: number;
  duration_minutes?: number;
  genres: string[];
  cast: { name: string; role: string; image_url?: string }[];
  crew: { name: string; role: string }[];
  studio?: string;
  seasons?: Season[];
  similar_titles?: SimilarTitle[];
}

interface Season {
  id: string;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  air_date: string;
  thumbnail_url?: string;
}

interface SimilarTitle {
  id: string;
  name: string;
  poster_url?: string;
  rating_average: number;
}

export default function TitleDetailPage({ titleId }: TitleDetailPageProps) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Mock data - replace with actual API call
  const title: Title = {
    id: titleId,
    name: 'Sample Title',
    type: 'series',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    backdrop_url: '',
    poster_url: '',
    release_year: 2024,
    rating_average: 8.5,
    rating_count: 1250,
    genres: ['Action', 'Drama', 'Thriller'],
    cast: [],
    crew: [],
    seasons: [],
    similar_titles: [],
  };

  const handlePlay = () => {
    if (title.type === 'movie') {
      router.push(`/watch/${titleId}`);
    } else {
      // Play first episode of first season
      router.push(`/watch/${titleId}/s1/e1`);
    }
  };

  const handleWatchlistToggle = () => {
    setIsInWatchlist(!isInWatchlist);
    // API call to add/remove from watchlist
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh]">
        {/* Backdrop Image */}
        {title.backdrop_url ? (
          <img
            src={title.backdrop_url}
            alt={title.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Poster (mobile hidden, desktop shown) */}
              <div className="hidden md:block flex-shrink-0">
                {title.poster_url ? (
                  <img
                    src={title.poster_url}
                    alt={title.name}
                    className="w-64 rounded-xl shadow-2xl border-4 border-white/10"
                  />
                ) : (
                  <div className="w-64 h-96 bg-gray-800 rounded-xl shadow-2xl border-4 border-white/10" />
                )}
              </div>

              {/* Title Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-lg">
                    {title.name}
                  </h1>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-lg">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-bold">{title.rating_average.toFixed(1)}</span>
                      <span className="text-gray-400">({title.rating_count.toLocaleString()})</span>
                    </div>

                    <span className="text-gray-400">•</span>
                    <span className="text-white font-medium">{title.release_year}</span>

                    {title.duration_minutes && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{Math.floor(title.duration_minutes / 60)}h {title.duration_minutes % 60}m</span>
                        </div>
                      </>
                    )}

                    <span className="text-gray-400">•</span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium capitalize border border-white/20">
                      {title.type}
                    </span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {title.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm text-gray-300 text-sm rounded-full border border-gray-700"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-gray-300 text-lg max-w-3xl line-clamp-2">
                  {title.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handlePlay}
                    className="px-8 py-4 bg-white hover:bg-white/90 text-black rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl"
                  >
                    <Play className="h-6 w-6 fill-black" />
                    Play Now
                  </button>

                  <button
                    onClick={handleWatchlistToggle}
                    className={`px-6 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl ${
                      isInWatchlist
                        ? 'bg-gray-800/90 text-white border-2 border-white/30'
                        : 'bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {isInWatchlist ? (
                      <>
                        <Check className="h-6 w-6" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="h-6 w-6" />
                        Add to Watchlist
                      </>
                    )}
                  </button>

                  <button className="p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all transform hover:scale-105 border-2 border-white/20">
                    <Share2 className="h-6 w-6" />
                  </button>

                  <button className="p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-all transform hover:scale-105 border-2 border-white/20">
                    <ThumbsUp className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto p-8 md:p-12 space-y-12">
        {/* Full Description */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Info className="h-6 w-6 text-purple-400" />
              About
            </h2>
          </div>

          <p className={`text-gray-300 text-lg leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
            {title.description}
          </p>

          {title.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-4 text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2"
            >
              {showFullDescription ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-800">
            <InfoRow label="Studio" value={title.studio || 'N/A'} />
            <InfoRow label="Type" value={title.type.charAt(0).toUpperCase() + title.type.slice(1)} />
            {title.crew.find(c => c.role === 'Director') && (
              <InfoRow
                label="Director"
                value={title.crew.find(c => c.role === 'Director')?.name || 'N/A'}
              />
            )}
            {title.seasons && (
              <InfoRow label="Seasons" value={title.seasons.length.toString()} />
            )}
          </div>
        </div>

        {/* Episodes Section (for series) */}
        {title.type === 'series' && title.seasons && title.seasons.length > 0 && (
          <SeasonEpisodeSection
            seasons={title.seasons}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            titleId={titleId}
          />
        )}

        {/* Cast Section */}
        {title.cast.length > 0 && (
          <CastSection cast={title.cast} />
        )}

        {/* Similar Titles */}
        {title.similar_titles && title.similar_titles.length > 0 && (
          <SimilarTitlesSection titles={title.similar_titles} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500 text-sm">{label}</span>
      <p className="text-white font-medium text-lg">{value}</p>
    </div>
  );
}

function SeasonEpisodeSection({
  seasons,
  selectedSeason,
  onSeasonChange,
  titleId,
}: {
  seasons: Season[];
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  titleId: string;
}) {
  const router = useRouter();
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="h-6 w-6 text-purple-400" />
          Episodes
        </h2>

        <select
          value={selectedSeason}
          onChange={(e) => onSeasonChange(parseInt(e.target.value))}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-medium"
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.season_number}>
              Season {season.season_number} ({season.episode_count} episodes)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {currentSeason?.episodes?.map((episode, index) => (
          <button
            key={episode.id}
            onClick={() => router.push(`/watch/${titleId}/s${selectedSeason}/e${episode.episode_number}`)}
            className="w-full flex gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-all group"
          >
            <div className="flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gray-700">
              {episode.thumbnail_url ? (
                <img
                  src={episode.thumbnail_url}
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">{episode.episode_number}</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                  {episode.episode_number}. {episode.title}
                </h3>
                <span className="text-gray-400 text-sm">{episode.duration_minutes}m</span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{episode.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CastSection({ cast }: { cast: { name: string; role: string; image_url?: string }[] }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.slice(0, 12).map((member, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-800 mb-2">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>
            <p className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors">
              {member.name}
            </p>
            <p className="text-gray-500 text-xs">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarTitlesSection({ titles }: { titles: SimilarTitle[] }) {
  const router = useRouter();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {titles.map((title) => (
          <button
            key={title.id}
            onClick={() => router.push(`/title/${title.id}`)}
            className="group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
              {title.poster_url ? (
                <img
                  src={title.poster_url}
                  alt={title.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
            </div>
            <p className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors line-clamp-2">
              {title.name}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-400 text-xs">{title.rating_average.toFixed(1)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
