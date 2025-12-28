// app/(protected)/collections/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Heart,
  Clock,
  ThumbsUp,
  Grid,
  List,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Share2,
  Lock,
  Globe,
  Users,
  Star,
  X,
  ChevronDown,
  Sparkles,
  Film,
  Tv,
  BookOpen,
  Smile,
  User,
  LayoutGrid,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import type { Collection, CollectionCategory, CreateCollectionRequest, CollectionLayout } from '@/types/collection';
import {
  COLLECTION_TEMPLATES,
  THEME_PRESETS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  LAYOUT_ICONS,
} from '@/types/collection';

export default function CollectionsPage() {
  const [filters, setFilters] = useState<{ searchQuery?: string; category?: CollectionCategory[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { collections, stats, isLoading, createCollection, deleteCollection, likeCollection, isCreating } = useCollections({ ...filters, searchQuery });

  const handleCreateCollection = (data: CreateCollectionRequest) => {
    createCollection(data, {
      onSuccess: () => setShowCreateModal(false),
    });
  };

  const handleDeleteCollection = (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background-dark/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                My Collections
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Organize and share your favorite content
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 p-1 bg-background-elevated rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-accent-primary text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-accent-primary text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New Collection</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20">
                  <LayoutGrid className="w-5 h-5 text-blue-400" />
                </div>
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.totalCollections}</h3>
              <p className="text-sm text-white/60 mt-1">Total Collections</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-green-500/20">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.publicCollections}</h3>
              <p className="text-sm text-white/60 mt-1">Public Collections</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-purple-500/20">
                  <Film className="w-5 h-5 text-purple-400" />
                </div>
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.totalItems}</h3>
              <p className="text-sm text-white/60 mt-1">Total Items</p>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-12 pr-4 py-3 bg-background-elevated border border-white/10 rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
          />
        </motion.div>

        {/* Collections Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
            <p className="text-white/60 mb-6">Create your first collection to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
            >
              Create Collection
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {collections.map((collection, index) => {
              const CategoryIcon = Icons[CATEGORY_ICONS[collection.category] as keyof typeof Icons] as React.ComponentType<{
                className?: string;
              }>;

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all cursor-pointer"
                  onClick={() => setSelectedCollection(collection)}
                  whileHover={{ y: -4 }}
                >
                  {/* Cover Image */}
                  <div
                    className="h-48 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${collection.customization.theme.gradientStart}, ${collection.customization.theme.gradientEnd})`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-16 h-16 text-white/20" />
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {collection.isPublic ? (
                        <div className="px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30">
                          <Globe className="w-4 h-4 text-green-100" />
                        </div>
                      ) : (
                        <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{collection.name}</h3>
                        <p className="text-sm text-white/60 line-clamp-2">{collection.description || 'No description'}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Film className="w-4 h-4" />
                          <span>{collection.itemCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{collection.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className={`w-4 h-4 ${collection.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                          <span>{collection.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {collection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {collection.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          likeCollection(collection.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${collection.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                        <span className="text-sm">Like</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id);
                        }}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {collections.map((collection, index) => {
              const CategoryIcon = Icons[CATEGORY_ICONS[collection.category] as keyof typeof Icons] as React.ComponentType<{
                className?: string;
              }>;

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-5 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${collection.customization.theme.gradientStart}, ${collection.customization.theme.gradientEnd})`,
                        }}
                      >
                        <CategoryIcon className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {collection.name}
                              {collection.isPublic ? (
                                <Globe className="w-4 h-4 text-green-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-white/60" />
                              )}
                            </h3>
                            <p className="text-sm text-white/60 mt-1">{collection.description || 'No description'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Film className="w-4 h-4" />
                            <span>{collection.itemCount} items</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{collection.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className={`w-4 h-4 ${collection.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                            <span>{collection.likes} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{collection.username}</span>
                          </div>
                        </div>

                        {collection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {collection.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => likeCollection(collection.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${collection.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => setSelectedCollection(collection)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(collection.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCollection}
        isCreating={isCreating}
      />
    </div>
  );
}

// Create Collection Modal Component
function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateCollectionRequest) => void;
  isCreating: boolean;
}) {
  const [formData, setFormData] = useState<CreateCollectionRequest>({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    tags: [],
    category: 'personal',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = COLLECTION_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.suggestedTags,
        customization: {
          theme: template.defaultTheme,
          layout: 'grid',
          sortBy: 'date_added',
          sortOrder: 'desc',
          showMetadata: true,
          showNotes: false,
        },
      }));
      setSelectedTemplate(templateId);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Create Collection</h2>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="p-6 space-y-6">
                  {/* Templates */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Quick Templates</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COLLECTION_TEMPLATES.map((template) => {
                        const IconComponent = Icons[template.icon as keyof typeof Icons] as React.ComponentType<{
                          className?: string;
                        }>;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`p-4 rounded-xl border transition-all ${
                              selectedTemplate === template.id
                                ? 'border-2'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                            style={{
                              backgroundColor:
                                selectedTemplate === template.id ? `${template.color}15` : 'rgba(255, 255, 255, 0.05)',
                              borderColor: selectedTemplate === template.id ? template.color : undefined,
                            }}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className="p-3 rounded-xl mb-2"
                                style={{ backgroundColor: `${template.color}20` }}
                              >
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <h4 className="font-semibold text-sm">{template.name}</h4>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome Collection"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your collection..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-accent-primary"
                      />
                      <span className="text-sm">Make Public</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isCollaborative}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isCollaborative: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-accent-primary"
                      />
                      <span className="text-sm">Allow Collaboration</span>
                    </label>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 rounded-lg bg-accent-primary/20 hover:bg-accent-primary/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg"
                        >
                          <span className="text-sm">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !formData.name}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
