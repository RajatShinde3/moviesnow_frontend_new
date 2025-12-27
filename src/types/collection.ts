// types/collection.ts

/**
 * User-created collection of content
 */
export interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  username: string;
  items: CollectionItem[];
  itemCount: number;
  coverImage?: string; // URL to cover image
  isPublic: boolean;
  isCollaborative: boolean;
  collaborators: Collaborator[];
  tags: string[];
  category: CollectionCategory;
  views: number;
  likes: number;
  isLiked: boolean; // Current user liked this collection
  createdAt: string;
  updatedAt: string;
  customization: CollectionCustomization;
}

/**
 * Item in a collection
 */
export interface CollectionItem {
  id: string;
  collectionId: string;
  contentType: 'movie' | 'series' | 'anime' | 'documentary';
  contentId: string;
  title: string;
  thumbnail: string;
  releaseYear?: number;
  rating?: number;
  addedAt: string;
  addedBy: string; // User who added this item
  note?: string; // Personal note about why this was added
  position: number; // Order in collection
}

/**
 * Collection collaborator
 */
export interface Collaborator {
  userId: string;
  username: string;
  avatar?: string;
  role: CollaboratorRole;
  permissions: CollaboratorPermission[];
  addedAt: string;
}

/**
 * Collaborator role
 */
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

/**
 * Collaborator permissions
 */
export type CollaboratorPermission = 'add_items' | 'remove_items' | 'edit_collection' | 'invite_others' | 'delete_collection';

/**
 * Collection category
 */
export type CollectionCategory =
  | 'personal'
  | 'watchlist'
  | 'favorites'
  | 'recommendations'
  | 'genre_based'
  | 'mood_based'
  | 'custom';

/**
 * Collection customization
 */
export interface CollectionCustomization {
  theme: CollectionTheme;
  layout: CollectionLayout;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  showMetadata: boolean;
  showNotes: boolean;
}

/**
 * Collection theme
 */
export interface CollectionTheme {
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  icon?: string;
}

/**
 * Collection layout
 */
export type CollectionLayout = 'grid' | 'list' | 'carousel' | 'masonry';

/**
 * Sort options for collections
 */
export type SortOption =
  | 'date_added'
  | 'title'
  | 'release_year'
  | 'rating'
  | 'custom_order';

/**
 * Create collection request
 */
export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
  tags?: string[];
  category?: CollectionCategory;
  customization?: Partial<CollectionCustomization>;
}

/**
 * Update collection request
 */
export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
  tags?: string[];
  category?: CollectionCategory;
  coverImage?: string;
  customization?: Partial<CollectionCustomization>;
}

/**
 * Add item to collection request
 */
export interface AddToCollectionRequest {
  collectionId: string;
  contentType: 'movie' | 'series' | 'anime' | 'documentary';
  contentId: string;
  note?: string;
}

/**
 * Collection filters
 */
export interface CollectionFilters {
  category?: CollectionCategory[];
  isPublic?: boolean;
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'created' | 'updated' | 'popular' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Collection statistics
 */
export interface CollectionStats {
  totalCollections: number;
  publicCollections: number;
  totalItems: number;
  mostPopularCollections: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
  }>;
  categoryBreakdown: Record<CollectionCategory, number>;
}

/**
 * Collection templates for quick creation
 */
export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  category: CollectionCategory;
  icon: string;
  color: string;
  defaultTheme: CollectionTheme;
  suggestedTags: string[];
}

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'watchlist',
    name: 'Watch Later',
    description: 'Save content to watch when you have time',
    category: 'watchlist',
    icon: 'Clock',
    color: '#3b82f6',
    defaultTheme: {
      primaryColor: '#3b82f6',
      gradientStart: '#3b82f6',
      gradientEnd: '#8b5cf6',
    },
    suggestedTags: ['to-watch', 'priority'],
  },
  {
    id: 'favorites',
    name: 'My Favorites',
    description: 'Your all-time favorite movies and shows',
    category: 'favorites',
    icon: 'Heart',
    color: '#ef4444',
    defaultTheme: {
      primaryColor: '#ef4444',
      gradientStart: '#ef4444',
      gradientEnd: '#f97316',
    },
    suggestedTags: ['favorites', 'loved'],
  },
  {
    id: 'recommendations',
    name: 'Recommendations',
    description: 'Great content to share with friends',
    category: 'recommendations',
    icon: 'ThumbsUp',
    color: '#10b981',
    defaultTheme: {
      primaryColor: '#10b981',
      gradientStart: '#10b981',
      gradientEnd: '#06b6d4',
    },
    suggestedTags: ['must-watch', 'recommended'],
  },
  {
    id: 'movie_night',
    name: 'Movie Night',
    description: 'Perfect picks for your next movie night',
    category: 'mood_based',
    icon: 'Film',
    color: '#8b5cf6',
    defaultTheme: {
      primaryColor: '#8b5cf6',
      gradientStart: '#8b5cf6',
      gradientEnd: '#ec4899',
    },
    suggestedTags: ['movie-night', 'entertainment'],
  },
  {
    id: 'weekend_binge',
    name: 'Weekend Binge',
    description: 'Series perfect for binge-watching',
    category: 'mood_based',
    icon: 'Tv',
    color: '#f59e0b',
    defaultTheme: {
      primaryColor: '#f59e0b',
      gradientStart: '#f59e0b',
      gradientEnd: '#f97316',
    },
    suggestedTags: ['binge-worthy', 'weekend'],
  },
  {
    id: 'study_with',
    name: 'Study Companion',
    description: 'Documentaries and educational content',
    category: 'genre_based',
    icon: 'BookOpen',
    color: '#06b6d4',
    defaultTheme: {
      primaryColor: '#06b6d4',
      gradientStart: '#06b6d4',
      gradientEnd: '#8b5cf6',
    },
    suggestedTags: ['educational', 'learning'],
  },
];

/**
 * Theme presets
 */
export const THEME_PRESETS: CollectionTheme[] = [
  { primaryColor: '#3b82f6', gradientStart: '#3b82f6', gradientEnd: '#8b5cf6', icon: 'Sparkles' },
  { primaryColor: '#ef4444', gradientStart: '#ef4444', gradientEnd: '#f97316', icon: 'Heart' },
  { primaryColor: '#10b981', gradientStart: '#10b981', gradientEnd: '#06b6d4', icon: 'Star' },
  { primaryColor: '#f59e0b', gradientStart: '#f59e0b', gradientEnd: '#f97316', icon: 'Sun' },
  { primaryColor: '#8b5cf6', gradientStart: '#8b5cf6', gradientEnd: '#ec4899', icon: 'Zap' },
  { primaryColor: '#06b6d4', gradientStart: '#06b6d4', gradientEnd: '#3b82f6', icon: 'Droplet' },
];

/**
 * Category icons
 */
export const CATEGORY_ICONS: Record<CollectionCategory, string> = {
  personal: 'User',
  watchlist: 'Clock',
  favorites: 'Heart',
  recommendations: 'ThumbsUp',
  genre_based: 'Grid',
  mood_based: 'Smile',
  custom: 'Star',
};

/**
 * Category labels
 */
export const CATEGORY_LABELS: Record<CollectionCategory, string> = {
  personal: 'Personal',
  watchlist: 'Watch Later',
  favorites: 'Favorites',
  recommendations: 'Recommendations',
  genre_based: 'By Genre',
  mood_based: 'By Mood',
  custom: 'Custom',
};

/**
 * Layout icons
 */
export const LAYOUT_ICONS: Record<CollectionLayout, string> = {
  grid: 'Grid',
  list: 'List',
  carousel: 'ArrowRightCircle',
  masonry: 'LayoutGrid',
};
