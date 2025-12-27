// app/(protected)/admin/genres/page.tsx
/**
 * =============================================================================
 * Admin - Genre & Taxonomy Manager
 * =============================================================================
 * Manage genres, categories, tags, and content classification
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tag,
  Tags,
  Folder,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Film,
  Tv,
  Globe,
  Star,
  TrendingUp,
  Users,
  Eye,
  Grid3x3,
  List,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  Award,
  Zap,
  Crown,
  Flame,
  Heart,
  Play,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  title_count: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  category?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: "movie" | "series" | "anime" | "documentary";
  title_count: number;
  is_active: boolean;
}

export default function GenreTaxonomyPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"genres" | "tags" | "categories">("genres");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddingGenre, setIsAddingGenre] = React.useState(false);
  const [isAddingTag, setIsAddingTag] = React.useState(false);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const { data: genres, isLoading: loadingGenres, refetch: refetchGenres } = useQuery({
    queryKey: ["admin", "genres"],
    queryFn: () => fetchJson<Genre[]>("/api/v1/admin/genres"),
  });

  const { data: tags, isLoading: loadingTags, refetch: refetchTags } = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: () => fetchJson<Tag[]>("/api/v1/admin/tags"),
  });

  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => fetchJson<Category[]>("/api/v1/admin/categories"),
  });

  const stats = [
    {
      label: "Total Genres",
      value: genres?.length || 0,
      icon: Tag,
      color: "purple",
    },
    {
      label: "Active Tags",
      value: tags?.length || 0,
      icon: Tags,
      color: "blue",
    },
    {
      label: "Categories",
      value: categories?.length || 0,
      icon: Folder,
      color: "green",
    },
    {
      label: "Featured",
      value: genres?.filter((g) => g.is_featured).length || 0,
      icon: Star,
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg shadow-purple-500/30">
                <Tag className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Genre & Taxonomy Manager</h1>
                <p className="mt-1 text-gray-400">Organize content with genres, tags, and categories</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800/50 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-2 transition-all ${
                    viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-2 transition-all ${
                    viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  refetchGenres();
                  refetchTags();
                  refetchCategories();
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search genres, tags, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 backdrop-blur-xl transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
          <button
            onClick={() => setActiveTab("genres")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "genres" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Tag className="h-4 w-4" />
            Genres
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{genres?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "tags" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Tags className="h-4 w-4" />
            Tags
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{tags?.length || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "categories" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Folder className="h-4 w-4" />
            Categories
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{categories?.length || 0}</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === "genres" && (
          <GenresTab
            genres={genres || []}
            isLoading={loadingGenres}
            viewMode={viewMode}
            searchQuery={searchQuery}
            isAdding={isAddingGenre}
            setIsAdding={setIsAddingGenre}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            refetch={refetchGenres}
          />
        )}

        {activeTab === "tags" && (
          <TagsTab
            tags={tags || []}
            isLoading={loadingTags}
            viewMode={viewMode}
            searchQuery={searchQuery}
            isAdding={isAddingTag}
            setIsAdding={setIsAddingTag}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            refetch={refetchTags}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories || []}
            isLoading={loadingCategories}
            viewMode={viewMode}
            searchQuery={searchQuery}
            isAdding={isAddingCategory}
            setIsAdding={setIsAddingCategory}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            refetch={refetchCategories}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Genres Tab
// ============================================================================

function GenresTab({
  genres,
  isLoading,
  viewMode,
  searchQuery,
  isAdding,
  setIsAdding,
  editingItem,
  setEditingItem,
  refetch,
}: {
  genres: Genre[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  searchQuery: string;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  refetch: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteGenreMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/v1/admin/genres/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "genres"] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      await fetchJson(`/api/v1/admin/genres/${id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ is_featured }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "genres"] });
    },
  });

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Genre Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Genres</h2>
          <p className="text-sm text-gray-400">Organize titles by genre classification</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4" />
          Add Genre
        </button>
      </div>

      {/* Genre Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGenres.map((genre) => (
            <div
              key={genre.id}
              className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700"
            >
              {genre.is_featured && (
                <div className="absolute right-4 top-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}

              <div className="mb-4">
                <div className="mb-3 inline-flex rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white shadow-lg">
                  <Tag className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{genre.name}</h3>
                {genre.description && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{genre.description}</p>
                )}
              </div>

              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Titles</span>
                <span className="font-bold text-white">{genre.title_count}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeaturedMutation.mutate({ id: genre.id, is_featured: !genre.is_featured })}
                  className="flex-1 rounded-lg bg-gray-800/50 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {genre.is_featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => setEditingItem(genre)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteGenreMutation.mutate(genre.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGenres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4 backdrop-blur-xl transition-all hover:border-gray-700"
            >
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white">
                <Tag className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{genre.name}</h3>
                  {genre.is_featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                </div>
                {genre.description && (
                  <p className="text-sm text-gray-400 truncate">{genre.description}</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-white">{genre.title_count}</p>
                <p className="text-xs text-gray-400">titles</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeaturedMutation.mutate({ id: genre.id, is_featured: !genre.is_featured })}
                  className="rounded-lg bg-gray-800/50 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {genre.is_featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => setEditingItem(genre)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteGenreMutation.mutate(genre.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredGenres.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 py-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-3 text-gray-400">
            {searchQuery ? "No genres found matching your search" : "No genres yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300"
            >
              Create your first genre
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tags Tab
// ============================================================================

function TagsTab({
  tags,
  isLoading,
  viewMode,
  searchQuery,
  isAdding,
  setIsAdding,
  editingItem,
  setEditingItem,
  refetch,
}: {
  tags: Tag[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  searchQuery: string;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  refetch: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/v1/admin/tags/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Tag Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Tags</h2>
          <p className="text-sm text-gray-400">Tag content for better discovery and search</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-cyan-700"
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </button>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-3">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className="group relative inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 backdrop-blur-xl transition-all hover:border-blue-500 hover:bg-gray-800"
          >
            <Tags className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-white">{tag.name}</span>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
              {tag.usage_count}
            </span>

            <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setEditingItem(tag)}
                className="rounded p-1 text-gray-400 hover:text-white"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteTagMutation.mutate(tag.id)}
                className="rounded p-1 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 py-12 text-center">
          <Tags className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-3 text-gray-400">
            {searchQuery ? "No tags found matching your search" : "No tags yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Create your first tag
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Categories Tab
// ============================================================================

function CategoriesTab({
  categories,
  isLoading,
  viewMode,
  searchQuery,
  isAdding,
  setIsAdding,
  editingItem,
  setEditingItem,
  refetch,
}: {
  categories: Category[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  searchQuery: string;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  refetch: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/v1/admin/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await fetchJson(`/api/v1/admin/categories/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  const typeIcons = {
    movie: Film,
    series: Tv,
    anime: Sparkles,
    documentary: Globe,
  };

  return (
    <div className="space-y-6">
      {/* Add Category Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Categories</h2>
          <p className="text-sm text-gray-400">Organize content by type-specific categories</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const TypeIcon = typeIcons[category.type];
          return (
            <div
              key={category.id}
              className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{category.type}</p>
                  </div>
                </div>

                <div className={`h-2 w-2 rounded-full ${category.is_active ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
              </div>

              {category.description && (
                <p className="mb-4 text-sm text-gray-400 line-clamp-2">{category.description}</p>
              )}

              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Titles</span>
                <span className="font-bold text-white">{category.title_count}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActiveMutation.mutate({ id: category.id, is_active: !category.is_active })}
                  className="flex-1 rounded-lg bg-gray-800/50 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {category.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setEditingItem(category)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 py-12 text-center">
          <Folder className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-3 text-gray-400">
            {searchQuery ? "No categories found matching your search" : "No categories yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-sm text-green-400 hover:text-green-300"
            >
              Create your first category
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: "from-purple-500 to-pink-600",
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-500 to-orange-600",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
      <div className={`absolute right-0 top-0 h-32 w-32 opacity-10 blur-3xl bg-gradient-to-br ${colorClasses[color]}`} />
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-full bg-gradient-to-br ${colorClasses[color]} p-3 text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
