/**
 * =============================================================================
 * PersonDetailPage Component
 * =============================================================================
 * Actor/Director/Crew member detail page with filmography
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  Calendar,
  MapPin,
  Award,
  Star,
  ExternalLink,
  Share2,
  Heart,
  Play,
  Grid3x3,
  List,
} from 'lucide-react';

interface Title {
  id: string;
  name: string;
  poster_url?: string;
  backdrop_url?: string;
  release_year?: number;
  rating_average: number;
  type: string;
  role?: string; // Actor's role in this title
  job?: string; // Crew member's job (Director, Writer, etc.)
}

interface Person {
  id: string;
  name: string;
  profile_image_url?: string;
  biography?: string;
  birth_date?: string;
  birth_place?: string;
  known_for_department?: string; // Acting, Directing, Writing
  popularity?: number;
  awards?: string[];
  social_links?: {
    imdb?: string;
    instagram?: string;
    twitter?: string;
  };
  filmography: {
    as_actor?: Title[];
    as_director?: Title[];
    as_writer?: Title[];
    as_crew?: Title[];
  };
}

interface PersonDetailPageProps {
  personId: string;
}

export default function PersonDetailPage({ personId }: PersonDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'actor' | 'director' | 'writer' | 'crew'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLiked, setIsLiked] = useState(false);

  // Mock data - replace with actual API call
  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ['person', personId],
    queryFn: async () => {
      // Replace with actual API call
      return {
        id: personId,
        name: 'Sample Actor',
        profile_image_url: 'https://via.placeholder.com/400x600',
        biography:
          'Award-winning actor known for compelling performances across multiple genres. Started career in theater before transitioning to film and television.',
        birth_date: '1985-05-15',
        birth_place: 'Los Angeles, California, USA',
        known_for_department: 'Acting',
        popularity: 8.5,
        awards: ['Academy Award - Best Actor', 'Golden Globe - Best Performance'],
        social_links: {
          imdb: 'https://imdb.com/name/nm0000001',
        },
        filmography: {
          as_actor: [],
          as_director: [],
        },
      };
    },
  });

  const getAllTitles = (): Title[] => {
    if (!person) return [];

    const titles: Title[] = [];
    if (person.filmography.as_actor) titles.push(...person.filmography.as_actor);
    if (person.filmography.as_director) titles.push(...person.filmography.as_director);
    if (person.filmography.as_writer) titles.push(...person.filmography.as_writer);
    if (person.filmography.as_crew) titles.push(...person.filmography.as_crew);

    return titles.sort(
      (a, b) => (b.release_year || 0) - (a.release_year || 0)
    );
  };

  const getFilteredTitles = (): Title[] => {
    if (!person) return [];

    switch (activeTab) {
      case 'actor':
        return person.filmography.as_actor || [];
      case 'director':
        return person.filmography.as_director || [];
      case 'writer':
        return person.filmography.as_writer || [];
      case 'crew':
        return person.filmography.as_crew || [];
      default:
        return getAllTitles();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: person?.name,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Person not found</div>
      </div>
    );
  }

  const filteredTitles = getFilteredTitles();
  const age = person.birth_date
    ? new Date().getFullYear() - new Date(person.birth_date).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-900 to-black" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 w-full">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
                  {person.profile_image_url ? (
                    <img
                      src={person.profile_image_url}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <span className="text-6xl font-bold text-gray-500">
                        {person.name[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl">
                    {person.name}
                  </h1>
                  {person.known_for_department && (
                    <p className="text-xl text-purple-400 font-semibold mt-2">
                      {person.known_for_department}
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  {person.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>
                        Age {age} ({new Date(person.birth_date).getFullYear()})
                      </span>
                    </div>
                  )}

                  {person.birth_place && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{person.birth_place}</span>
                    </div>
                  )}

                  {person.popularity && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{person.popularity.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                      isLiked
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 backdrop-blur-sm text-white border-2 border-white/20'
                    }`}
                  >
                    <Heart className={`h-5 w-5 inline mr-2 ${isLiked ? 'fill-white' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold transition-all transform hover:scale-105 border-2 border-white/20"
                  >
                    <Share2 className="h-5 w-5 inline mr-2" />
                    Share
                  </button>

                  {person.social_links?.imdb && (
                    <a
                      href={person.social_links.imdb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-yellow-500/20 backdrop-blur-sm text-yellow-400 rounded-lg font-bold transition-all transform hover:scale-105 border-2 border-yellow-500/30"
                    >
                      <ExternalLink className="h-5 w-5 inline mr-2" />
                      IMDb
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-12 space-y-12">
        {/* Biography */}
        {person.biography && (
          <section className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Biography</h2>
            <p className="text-gray-300 leading-relaxed">{person.biography}</p>
          </section>
        )}

        {/* Awards */}
        {person.awards && person.awards.length > 0 && (
          <section className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="h-7 w-7 text-yellow-400" />
              Awards & Recognition
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {person.awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg border border-yellow-500/20"
                >
                  <Award className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                  <span className="text-white font-medium">{award}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filmography */}
        <section>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Film className="h-8 w-8 text-purple-400" />
              Filmography
              <span className="text-xl text-gray-400">({filteredTitles.length})</span>
            </h2>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'actor', 'director', 'writer', 'crew'].map((tab) => {
              const count =
                tab === 'all'
                  ? getAllTitles().length
                  : person.filmography[`as_${tab}` as keyof typeof person.filmography]?.length ||
                    0;

              if (count === 0 && tab !== 'all') return null;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-sm">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Titles */}
          {filteredTitles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredTitles.map((title) => (
                  <TitleCard key={title.id} title={title} onClick={() => router.push(`/title/${title.id}`)} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTitles.map((title) => (
                  <TitleRow key={title.id} title={title} onClick={() => router.push(`/title/${title.id}`)} />
                ))}
              </div>
            )
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
              <Film className="h-24 w-24 text-gray-700 mx-auto mb-6" />
              <p className="text-gray-400">No titles found in this category</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Title Card Component (Grid View)
// ─────────────────────────────────────────────────────────────────────────────

function TitleCard({ title, onClick }: { title: Title; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-all transform hover:scale-105"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3">
        {title.poster_url ? (
          <img src={title.poster_url} alt={title.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Film className="h-16 w-16 text-gray-600" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 text-white">
              <Play className="h-6 w-6" />
              <span className="font-bold">View Details</span>
            </div>
          </div>
        </div>

        {/* Year Badge */}
        {title.release_year && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-bold text-white">
            {title.release_year}
          </div>
        )}
      </div>

      <h3 className="font-bold text-white line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
        {title.name}
      </h3>

      {title.role && (
        <p className="text-sm text-gray-400 line-clamp-1">as {title.role}</p>
      )}

      {title.job && (
        <p className="text-sm text-gray-400 line-clamp-1">{title.job}</p>
      )}

      <div className="flex items-center gap-1 mt-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-white font-medium">
          {title.rating_average.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Title Row Component (List View)
// ─────────────────────────────────────────────────────────────────────────────

function TitleRow({ title, onClick }: { title: Title; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/50 hover:border-purple-500 transition-all"
    >
      {/* Poster */}
      <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
        {title.poster_url ? (
          <img src={title.poster_url} alt={title.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Film className="h-8 w-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white line-clamp-1 hover:text-purple-400 transition-colors">
          {title.name}
        </h3>

        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
          {title.release_year && <span>{title.release_year}</span>}
          {title.type && <span className="capitalize">{title.type}</span>}
          {title.role && <span>as {title.role}</span>}
          {title.job && <span>{title.job}</span>}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-white font-bold">{title.rating_average.toFixed(1)}</span>
      </div>

      {/* Play Icon */}
      <Play className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
    </div>
  );
}
