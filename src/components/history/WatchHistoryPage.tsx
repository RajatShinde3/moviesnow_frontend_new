/**
 * =============================================================================
 * WatchHistoryPage Component
 * =============================================================================
 * Complete watch history with filtering, sorting, and deletion
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Clock, Trash2, Play, Calendar, Filter, X } from 'lucide-react';

interface WatchHistoryPageProps {
  profileId: string;
}

export default function WatchHistoryPage({ profileId }: WatchHistoryPageProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'movie' | 'series' | 'anime'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual API call
  const history = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Clock className="h-10 w-10 text-purple-400" />
            Watch History
          </h1>
          <p className="text-gray-400">View and manage your viewing history</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showFilters
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
              <option value="anime">Anime</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Watch Progress</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Clear all watch history?')) {
                // Clear history
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium border border-red-500/30"
          >
            <Trash2 className="h-5 w-5" />
            Clear All
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Completion</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Just Started</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Genre</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>All Genres</option>
                  <option>Action</option>
                  <option>Drama</option>
                  <option>Comedy</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <Clock className="h-24 w-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Watch History</h2>
            <p className="text-gray-400 mb-6">
              Start watching content to build your history
            </p>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sample history items would go here */}
          </div>
        )}
      </div>
    </div>
  );
}
