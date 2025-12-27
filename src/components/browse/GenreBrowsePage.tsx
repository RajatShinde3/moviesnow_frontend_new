/**
 * =============================================================================
 * GenreBrowsePage Component
 * =============================================================================
 * Browse content by genre with beautiful grid layout
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal, Star, TrendingUp } from 'lucide-react';

interface GenreBrowsePageProps {
  genre: string;
}

const GENRE_COLORS: Record<string, string> = {
  Action: 'from-red-500 to-orange-500',
  Drama: 'from-blue-500 to-purple-500',
  Comedy: 'from-yellow-500 to-orange-500',
  Horror: 'from-gray-800 to-black',
  SciFi: 'from-cyan-500 to-blue-500',
  Romance: 'from-pink-500 to-red-500',
  Thriller: 'from-purple-900 to-red-900',
  Fantasy: 'from-purple-500 to-pink-500',
  Mystery: 'from-indigo-800 to-purple-800',
  Adventure: 'from-green-500 to-teal-500',
};

const GENRE_EMOJIS: Record<string, string> = {
  Action: '💥',
  Drama: '🎭',
  Comedy: '😂',
  Horror: '👻',
  SciFi: '🚀',
  Romance: '💕',
  Thriller: '🔪',
  Fantasy: '🧙',
  Mystery: '🔍',
  Adventure: '🗺️',
};

export default function GenreBrowsePage({ genre }: GenreBrowsePageProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const genreColor = GENRE_COLORS[genre] || 'from-purple-500 to-pink-500';
  const genreEmoji = GENRE_EMOJIS[genre] || '🎬';

  // Mock data - replace with actual API call
  const titles: any[] = [];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className={`relative h-64 bg-gradient-to-br ${genreColor}`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">{genreEmoji}</div>
            <h1 className="text-6xl font-black text-white drop-shadow-lg">{genre}</h1>
            <p className="text-xl text-white/90 mt-4">
              Explore the best {genre.toLowerCase()} content
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Recently Added</option>
              <option value="title">Title (A-Z)</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                showFilters
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </button>
          </div>

          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-8">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All</option>
                  <option>Movies</option>
                  <option>Series</option>
                  <option>Anime</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Year</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All Years</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2020-2022</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Rating</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All Ratings</option>
                  <option>9+ Stars</option>
                  <option>8+ Stars</option>
                  <option>7+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Quality</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All</option>
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid/List */}
        {titles.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <div className="text-6xl mb-4">{genreEmoji}</div>
            <h2 className="text-2xl font-bold text-white mb-2">No {genre} Content Yet</h2>
            <p className="text-gray-400 mb-6">Check back soon for new additions</p>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Browse All Content
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Grid items would go here */}
          </div>
        ) : (
          <div className="space-y-4">
            {/* List items would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
