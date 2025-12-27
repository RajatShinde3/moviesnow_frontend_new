/**
 * =============================================================================
 * Bundle Management Page (Admin)
 * =============================================================================
 * Complete bundle management interface with CRUD operations
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  HardDrive,
  Film,
  Star,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';
import {
  useBundles,
  useCreateBundle,
  useUpdateBundle,
  useDeleteBundle,
  useBundleStats,
} from '@/lib/api/hooks/useBundles';
import { Bundle, CreateBundleRequest } from '@/lib/api/services/bundles';

export default function BundleManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [page, setPage] = useState(1);

  const { data: bundlesData, isLoading } = useBundles({
    quality: selectedQuality === 'all' ? undefined : selectedQuality,
    format: selectedFormat === 'all' ? undefined : selectedFormat,
    page,
    per_page: 20,
  });

  const deleteBundle = useDeleteBundle();

  const handleDelete = async (bundleId: string) => {
    if (window.confirm('Are you sure you want to delete this bundle?')) {
      await deleteBundle.mutateAsync(bundleId);
    }
  };

  const filteredBundles = bundlesData?.bundles.filter((bundle) => {
    const matchesSearch =
      search === '' ||
      bundle.title_name?.toLowerCase().includes(search.toLowerCase()) ||
      bundle.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'all' || bundle.bundle_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Package className="h-10 w-10 text-purple-400" />
                Bundle Management
              </h1>
              <p className="text-gray-400">
                Manage download bundles and packages for your content
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Bundle
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Package />}
              label="Total Bundles"
              value={bundlesData?.total_count || 0}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<Download />}
              label="Premium Bundles"
              value={
                bundlesData?.bundles.filter((b) => b.is_premium_only).length || 0
              }
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<HardDrive />}
              label="Total Size"
              value={formatBytes(
                bundlesData?.bundles.reduce((sum, b) => sum + b.file_size_bytes, 0) || 0
              )}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={<Film />}
              label="Movie Bundles"
              value={
                bundlesData?.bundles.filter((b) => b.bundle_type === 'movie').length || 0
              }
              color="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-white">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bundles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Quality Filter */}
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Qualities</option>
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Formats</option>
              <option value="mp4">MP4</option>
              <option value="mkv">MKV</option>
              <option value="avi">AVI</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movie</option>
              <option value="single_episode">Single Episode</option>
              <option value="season">Season</option>
              <option value="complete_series">Complete Series</option>
            </select>
          </div>
        </div>

        {/* Bundles List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBundles && filteredBundles.length > 0 ? (
          <div className="space-y-3">
            {filteredBundles.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onEdit={() => {
                  setSelectedBundle(bundle);
                  setShowCreateModal(true);
                }}
                onDelete={() => handleDelete(bundle.id)}
                onViewStats={() => router.push(`/admin/bundles/${bundle.id}/stats`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <Package className="h-24 w-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Bundles Found</h2>
            <p className="text-gray-400 mb-6">
              {search || selectedQuality !== 'all' || selectedFormat !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first download bundle to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Create Bundle
            </button>
          </div>
        )}

        {/* Pagination */}
        {bundlesData && bundlesData.total_count > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-900/50 text-white rounded-lg">
              Page {page} of {Math.ceil(bundlesData.total_count / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(bundlesData.total_count / 20)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BundleModal
          bundle={selectedBundle}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBundle(null);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <div className={`p-3 bg-gradient-to-br ${color} rounded-lg mb-3 w-fit text-white`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundle Card Component
// ─────────────────────────────────────────────────────────────────────────────

function BundleCard({
  bundle,
  onEdit,
  onDelete,
  onViewStats,
}: {
  bundle: Bundle;
  onEdit: () => void;
  onDelete: () => void;
  onViewStats: () => void;
}) {
  const { data: stats } = useBundleStats(bundle.id);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{bundle.title_name || 'Untitled'}</h3>

            {/* Type Badge */}
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
              {bundle.bundle_type.replace('_', ' ').toUpperCase()}
            </span>

            {/* Premium Badge */}
            {bundle.is_premium_only && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
                PREMIUM
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Quality:</span>
              <span className="ml-2 text-white font-medium">{bundle.quality}</span>
            </div>
            <div>
              <span className="text-gray-400">Format:</span>
              <span className="ml-2 text-white font-medium">{bundle.format.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-400">Size:</span>
              <span className="ml-2 text-white font-medium">
                {formatBytes(bundle.file_size_bytes)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Downloads:</span>
              <span className="ml-2 text-white font-medium">
                {stats?.total_downloads || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {bundle.includes_subtitles && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-400" />
                <span>Subtitles</span>
              </div>
            )}
            {bundle.includes_audio_tracks.length > 0 && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-400" />
                <span>Audio: {bundle.includes_audio_tracks.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button
            onClick={onViewStats}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="View Stats"
          >
            <TrendingUp className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundle Modal Component
// ─────────────────────────────────────────────────────────────────────────────

function BundleModal({ bundle, onClose }: { bundle: Bundle | null; onClose: () => void }) {
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();
  const [formData, setFormData] = useState<Partial<CreateBundleRequest>>({
    title_id: bundle?.title_id || '',
    bundle_type: bundle?.bundle_type || 'movie',
    format: bundle?.format || 'mp4',
    quality: bundle?.quality || '1080p',
    download_url: bundle?.download_url || '',
    file_size_bytes: bundle?.file_size_bytes || 0,
    is_premium_only: bundle?.is_premium_only || false,
    includes_subtitles: bundle?.includes_subtitles || false,
    includes_audio_tracks: bundle?.includes_audio_tracks || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bundle) {
      await updateBundle.mutateAsync({
        bundleId: bundle.id,
        data: formData,
      });
    } else {
      await createBundle.mutateAsync(formData as CreateBundleRequest);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {bundle ? 'Edit Bundle' : 'Create New Bundle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title ID */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title_id}
              onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Bundle Type and Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bundle Type
              </label>
              <select
                value={formData.bundle_type}
                onChange={(e) =>
                  setFormData({ ...formData, bundle_type: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="movie">Movie</option>
                <option value="single_episode">Single Episode</option>
                <option value="season">Season</option>
                <option value="complete_series">Complete Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>
          </div>

          {/* Format and File Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="avi">AVI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                File Size (bytes)
              </label>
              <input
                type="number"
                value={formData.file_size_bytes}
                onChange={(e) =>
                  setFormData({ ...formData, file_size_bytes: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Download URL */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Download URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={formData.download_url}
              onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_premium_only}
                onChange={(e) =>
                  setFormData({ ...formData, is_premium_only: e.target.checked })
                }
                className="w-5 h-5 bg-gray-800 border-gray-700 rounded"
              />
              <span className="text-white">Premium Only</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.includes_subtitles}
                onChange={(e) =>
                  setFormData({ ...formData, includes_subtitles: e.target.checked })
                }
                className="w-5 h-5 bg-gray-800 border-gray-700 rounded"
              />
              <span className="text-white">Includes Subtitles</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createBundle.isPending || updateBundle.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {createBundle.isPending || updateBundle.isPending
                ? 'Saving...'
                : bundle
                ? 'Update Bundle'
                : 'Create Bundle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
