/**
 * =============================================================================
 * Collections Browse Page
 * =============================================================================
 * Curated collections of content organized by themes, moods, and categories
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import {
  Sparkles,
  Heart,
  Flame,
  Laugh,
  Ghost,
  Rocket,
  Film,
  TvIcon,
  Play,
  Plus,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail_url?: string;
  item_count: number;
  tags: string[];
  created_at: string;
}

// Mock collections data (replace with actual API call)
const FEATURED_COLLECTIONS: Collection[] = [
  {
    id: '1',
    name: 'Feel-Good Favorites',
    description: 'Uplifting movies and series to brighten your day',
    item_count: 24,
    tags: ['comedy', 'family', 'drama'],
    created_at: '2025-01-01',
  },
  {
    id: '2',
    name: 'Edge of Your Seat Thrillers',
    description: 'Heart-pounding suspense that keeps you guessing',
    item_count: 18,
    tags: ['thriller', 'mystery', 'suspense'],
    created_at: '2025-01-05',
  },
  {
    id: '3',
    name: 'Epic Sci-Fi Journeys',
    description: 'Explore distant galaxies and futuristic worlds',
    item_count: 32,
    tags: ['sci-fi', 'space', 'adventure'],
    created_at: '2025-01-10',
  },
  {
    id: '4',
    name: 'Romance & Heartbreak',
    description: 'Love stories that will make you laugh and cry',
    item_count: 20,
    tags: ['romance', 'drama', 'relationships'],
    created_at: '2025-01-12',
  },
  {
    id: '5',
    name: 'Horror Nightmares',
    description: 'Terrifying tales for the brave at heart',
    item_count: 15,
    tags: ['horror', 'thriller', 'supernatural'],
    created_at: '2025-01-15',
  },
  {
    id: '6',
    name: 'Action-Packed Blockbusters',
    description: 'Non-stop adrenaline and explosive entertainment',
    item_count: 28,
    tags: ['action', 'adventure', 'thriller'],
    created_at: '2025-01-18',
  },
];

const COLLECTION_CATEGORIES = [
  { id: 'trending', label: 'Trending Collections', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  { id: 'mood', label: 'By Mood', icon: Heart, color: 'from-pink-500 to-purple-500' },
  { id: 'genre', label: 'By Genre', icon: Film, color: 'from-blue-500 to-cyan-500' },
  { id: 'popular', label: 'Most Popular', icon: Star, color: 'from-yellow-500 to-orange-500' },
  { id: 'staff_picks', label: 'Staff Picks', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
];

export default function CollectionsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // This would be replaced with actual API call
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections', selectedCategory],
    queryFn: async () => {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return FEATURED_COLLECTIONS;
    },
  });

  const filteredCollections = collections?.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCollectionIcon = (name: string) => {
    if (name.includes('Feel-Good') || name.includes('Romance')) return Heart;
    if (name.includes('Thriller') || name.includes('Horror')) return Ghost;
    if (name.includes('Sci-Fi') || name.includes('Space')) return Rocket;
    if (name.includes('Action')) return Flame;
    if (name.includes('Comedy')) return Laugh;
    return Sparkles;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Curated Collections</h1>
              <p className="text-gray-400 mt-1">
                Discover hand-picked selections for every mood and moment
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {COLLECTION_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Featured Collection Hero */}
        {!searchQuery && collections && collections.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="relative p-8 md:p-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="text-yellow-400 font-bold uppercase text-sm tracking-wider">
                    Featured Collection
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  {collections[0].name}
                </h2>
                <p className="text-gray-300 text-lg mb-6">{collections[0].description}</p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Film className="h-5 w-5" />
                    <span className="font-medium">{collections[0].item_count} titles</span>
                  </div>
                  <div className="flex gap-2">
                    {collections[0].tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/browse/collections/${collections[0].id}`)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Browse Collection
                  </button>
                  <button className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collections Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : COLLECTION_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <div className="text-gray-400 text-sm">
              {filteredCollections?.length || 0} collections
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CollectionCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCollections && filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  icon={getCollectionIcon(collection.name)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No collections found. Try a different search or category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collection Card Component
// ─────────────────────────────────────────────────────────────────────────────

function CollectionCard({
  collection,
  icon: Icon,
}: {
  collection: Collection;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/browse/collections/${collection.id}`)}
      className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all hover:scale-105 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <Icon className="h-20 w-20 text-white/70 group-hover:text-white group-hover:scale-110 transition-all relative z-10" />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1.5">
          <Film className="h-4 w-4 text-gray-300" />
          <span className="text-sm font-medium text-white">{collection.item_count}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {collection.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{collection.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {collection.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium"
              >
                {tag}
              </span>
            ))}
            {collection.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500 font-medium">
                +{collection.tags.length - 2}
              </span>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collection Card Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function CollectionCardSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-800 rounded w-5/6" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-gray-800 rounded w-16" />
          <div className="h-6 bg-gray-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
