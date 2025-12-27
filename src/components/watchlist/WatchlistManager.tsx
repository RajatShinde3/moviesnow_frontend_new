/**
 * =============================================================================
 * WatchlistManager Component
 * =============================================================================
 * Enhanced watchlist with import/export, reordering, and advanced features
 */

'use client';

import { useState, useRef } from 'react';
import {
  Heart,
  Archive,
  Star,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  SortAsc,
  Filter,
  Grid,
  List,
  Edit2,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  useWatchlist,
  useRemoveFromWatchlist,
  useUpdateWatchlistItem,
  useExportWatchlist,
  useBulkUploadWatchlist,
} from '@/lib/api/hooks/useWatchlist';
import { WatchlistItem } from '@/lib/api/services/watchlist';
import { formatDistanceToNow } from 'date-fns';

interface WatchlistManagerProps {
  profileId: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'updated_at' | 'sort_index' | 'title_name';

export default function WatchlistManager({ profileId }: WatchlistManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [mergeStrategy, setMergeStrategy] = useState<'upsert' | 'skip_existing' | 'replace_all'>('upsert');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useWatchlist(profileId, {
    archived: showArchived ? undefined : false,
    favorites_only: favoritesOnly,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const removeFromWatchlist = useRemoveFromWatchlist(profileId);
  const updateWatchlistItem = useUpdateWatchlistItem(profileId);
  const exportWatchlist = useExportWatchlist(profileId);
  const bulkUpload = useBulkUploadWatchlist(profileId);

  const handleSelectAll = () => {
    if (selectedItems.size === data?.watchlist.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data?.watchlist.map((item) => item.title_id) || []));
    }
  };

  const handleToggleSelect = (titleId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(titleId)) {
      newSelected.delete(titleId);
    } else {
      newSelected.add(titleId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkArchive = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Archive ${selectedItems.size} item(s)?`)) return;

    for (const titleId of selectedItems) {
      await updateWatchlistItem.mutateAsync({
        titleId,
        data: { archived: true },
      });
    }
    setSelectedItems(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} item(s) permanently?`)) return;

    for (const titleId of selectedItems) {
      await removeFromWatchlist.mutateAsync({ titleId, archiveOnly: false });
    }
    setSelectedItems(new Set());
  };

  const handleExport = async (includeArchived: boolean) => {
    await exportWatchlist.mutateAsync(includeArchived);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await bulkUpload.mutateAsync({ file, mergeStrategy });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">
            Manage and organize your saved content
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left: Filters & Sort */}
            <div className="flex flex-wrap gap-3">
              {/* View Mode */}
              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="created_at">Date Added</option>
                <option value="updated_at">Recently Updated</option>
                <option value="title_name">Title Name</option>
                <option value="sort_index">Custom Order</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <SortAsc className={`h-5 w-5 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </button>

              {/* Filters */}
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  favoritesOnly
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart className="h-4 w-4 inline mr-2" />
                Favorites
              </button>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showArchived
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Archive className="h-4 w-4 inline mr-2" />
                Archived
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              <button
                onClick={handleImportClick}
                disabled={bulkUpload.isPending}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>

              <button
                onClick={() => handleExport(showArchived)}
                disabled={exportWatchlist.isPending}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Import Options */}
          {fileInputRef.current && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <label className="text-sm text-gray-400 mb-2 block">Import Strategy:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMergeStrategy('upsert')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mergeStrategy === 'upsert'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Merge (Recommended)
                </button>
                <button
                  onClick={() => setMergeStrategy('skip_existing')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mergeStrategy === 'skip_existing'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Skip Existing
                </button>
                <button
                  onClick={() => setMergeStrategy('replace_all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mergeStrategy === 'replace_all'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Replace All (Dangerous)
                </button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedItems.size} item(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkArchive}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Archive Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Items" value={data.total_count} icon="📚" />
            <StatCard
              label="Favorites"
              value={data.watchlist.filter((i) => i.is_favorite).length}
              icon="❤️"
            />
            <StatCard
              label="In Progress"
              value={data.watchlist.filter((i) => i.progress_pct > 0 && i.progress_pct < 100).length}
              icon="▶️"
            />
            <StatCard
              label="Completed"
              value={data.watchlist.filter((i) => i.progress_pct === 100).length}
              icon="✅"
            />
          </div>
        )}

        {/* Watchlist Items */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <WatchlistSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : !data || data.watchlist.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
            <Archive className="h-16 w-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-gray-400 mb-6">
              {favoritesOnly || showArchived
                ? 'No items match your filters'
                : 'Start adding titles to track what you want to watch!'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={selectedItems.size === data.watchlist.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
                />
                Select all ({data.watchlist.length} items)
              </label>
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
              }
            >
              {data.watchlist.map((item) => (
                <WatchlistItemCard
                  key={item.title_id}
                  item={item}
                  viewMode={viewMode}
                  isSelected={selectedItems.has(item.title_id)}
                  onToggleSelect={() => handleToggleSelect(item.title_id)}
                  onRemove={(archiveOnly) =>
                    removeFromWatchlist.mutate({ titleId: item.title_id, archiveOnly })
                  }
                  onUpdate={(data) =>
                    updateWatchlistItem.mutate({ titleId: item.title_id, data })
                  }
                  profileId={profileId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface WatchlistItemCardProps {
  item: WatchlistItem;
  viewMode: ViewMode;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRemove: (archiveOnly: boolean) => void;
  onUpdate: (data: any) => void;
  profileId: string;
}

function WatchlistItemCard({
  item,
  viewMode,
  isSelected,
  onToggleSelect,
  onRemove,
  onUpdate,
}: WatchlistItemCardProps) {
  const [showActions, setShowActions] = useState(false);

  if (viewMode === 'list') {
    return (
      <div
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-600"
          />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">{item.title_name || 'Unknown Title'}</h3>
              {item.is_favorite && <Heart className="h-5 w-5 text-red-400 fill-red-400" />}
              {item.notify_new_content && <Bell className="h-4 w-4 text-blue-400" />}
              {item.archived && <Archive className="h-4 w-4 text-yellow-400" />}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Progress: {item.progress_pct}%</span>
              <span>•</span>
              <span>Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              {item.note && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1">{item.note}</span>
                </>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ is_favorite: !item.is_favorite })}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-5 w-5 ${item.is_favorite ? 'fill-red-400 text-red-400' : 'text-gray-400'}`} />
              </button>

              <button
                onClick={() => onRemove(true)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => onRemove(false)}
                className="p-2 bg-gray-800 hover:bg-red-800 rounded-lg transition-colors"
                title="Delete permanently"
              >
                <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
      <div className="aspect-[2/3] bg-gray-800 relative">
        {/* Placeholder for poster */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Star className="h-16 w-16 text-gray-700" />
        </div>

        {/* Progress Bar */}
        {item.progress_pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${item.progress_pct}%` }}
            />
          </div>
        )}

        {/* Checkbox */}
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-5 w-5 rounded border-gray-600 bg-gray-800/90 text-red-600"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.is_favorite && (
            <div className="p-1.5 bg-red-600 rounded-full">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
          )}
          {item.archived && (
            <div className="p-1.5 bg-yellow-600 rounded-full">
              <Archive className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Actions on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onUpdate({ is_favorite: !item.is_favorite })}
            className="p-3 bg-gray-900 hover:bg-red-600 rounded-full transition-colors"
          >
            <Heart className={`h-5 w-5 ${item.is_favorite ? 'fill-current' : ''} text-white`} />
          </button>

          <button
            onClick={() => onRemove(true)}
            className="p-3 bg-gray-900 hover:bg-yellow-600 rounded-full transition-colors"
          >
            <Archive className="h-5 w-5 text-white" />
          </button>

          <button
            onClick={() => onRemove(false)}
            className="p-3 bg-gray-900 hover:bg-red-600 rounded-full transition-colors"
          >
            <Trash2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white mb-1 line-clamp-2">
          {item.title_name || 'Unknown Title'}
        </h3>
        <p className="text-sm text-gray-400">
          {item.progress_pct}% complete
        </p>
        {item.note && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.note}</p>
        )}
      </div>
    </div>
  );
}

function WatchlistSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-gray-900/50 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-gray-800 rounded"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-800"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-800 rounded mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
      </div>
    </div>
  );
}
