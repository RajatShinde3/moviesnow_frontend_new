/**
 * =============================================================================
 * DownloadManager Component
 * =============================================================================
 * Complete download management page with filtering and bulk actions
 */

'use client';

import { useState } from 'react';
import {
  Download as DownloadIcon,
  Filter,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import {
  useDownloads,
  useCancelDownload,
  useGetDownloadUrl,
  useCleanupExpiredDownloads,
  useDownloadStats,
} from '@/lib/api/hooks/useDownloads';
import { Download, DownloadStatus, DownloadQuality } from '@/lib/api/services/downloads';
import { formatDistanceToNow } from 'date-fns';
import DownloadQuotaBar from './DownloadQuotaBar';

type FilterStatus = 'all' | DownloadStatus;
type FilterQuality = 'all' | DownloadQuality;

export default function DownloadManager() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterQuality, setFilterQuality] = useState<FilterQuality>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: downloads, isLoading, refetch } = useDownloads({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    quality: filterQuality !== 'all' ? filterQuality : undefined,
  });

  const { data: stats } = useDownloadStats();

  const cancelDownload = useCancelDownload();
  const getDownloadUrl = useGetDownloadUrl();
  const cleanupExpired = useCleanupExpiredDownloads();

  const handleSelectAll = () => {
    if (selectedIds.size === downloads?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(downloads?.map((d) => d.id) || []));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkCancel = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Cancel ${selectedIds.size} download(s)?`)) return;

    for (const id of selectedIds) {
      await cancelDownload.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Download Manager</h1>
          <p className="text-gray-400">
            Manage your downloads and track your quota usage
          </p>
        </div>

        {/* Quota Bar */}
        <DownloadQuotaBar />

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
            <StatCard
              label="Total Downloads"
              value={stats.total_downloads}
              icon="📥"
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              label="Completed"
              value={stats.completed_downloads}
              icon="✅"
              color="from-green-500 to-green-600"
            />
            <StatCard
              label="Success Rate"
              value={`${stats.success_rate}%`}
              icon="📊"
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              label="Total Downloaded"
              value={`${stats.total_gb_downloaded} GB`}
              icon="💾"
              color="from-orange-500 to-orange-600"
            />
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="downloading">Downloading</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              {/* Quality Filter */}
              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value as FilterQuality)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="all">All Qualities</option>
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              <button
                onClick={() => cleanupExpired.mutate()}
                disabled={cleanupExpired.isPending}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Cleanup Expired
              </button>
            </div>
          </div>

          {/* Bulk Selection Actions */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedIds.size} download(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkCancel}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Downloads List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <DownloadSkeleton key={i} />
            ))}
          </div>
        ) : !downloads || downloads.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
            <DownloadIcon className="h-16 w-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No downloads found</h3>
            <p className="text-gray-400 mb-6">
              {filterStatus !== 'all' || filterQuality !== 'all'
                ? 'No downloads match your filters. Try adjusting the filters.'
                : 'You haven\'t requested any downloads yet. Start downloading your favorite content!'}
            </p>
            {(filterStatus !== 'all' || filterQuality !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterQuality('all');
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.size === downloads.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
                />
                Select all on this page ({downloads.length} items)
              </label>
            </div>

            <div className="space-y-3">
              {downloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  isSelected={selectedIds.has(download.id)}
                  onToggleSelect={() => handleToggleSelect(download.id)}
                  onCancel={() => cancelDownload.mutate(download.id)}
                  onDownload={() => getDownloadUrl.mutate(download.id)}
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
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DownloadCardProps {
  download: Download;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCancel: () => void;
  onDownload: () => void;
}

function DownloadCard({
  download,
  isSelected,
  onToggleSelect,
  onCancel,
  onDownload,
}: DownloadCardProps) {
  const getStatusIcon = () => {
    switch (download.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'downloading':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (download.status) {
      case 'completed':
        return 'border-l-green-500 bg-green-500/5';
      case 'ready':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'pending':
      case 'processing':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'downloading':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-gray-700';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const gb = bytes / (1024 ** 3);
    const mb = bytes / (1024 ** 2);
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  };

  const canDownload = download.status === 'ready' || download.status === 'completed';
  const canCancel = download.status === 'pending' || download.status === 'processing' || download.status === 'downloading';

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200 border-l-4 ${getStatusColor()}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
        />

        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{download.content_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-400">
                  Quality: <span className="text-white font-medium">{download.quality}</span>
                </span>
                <span className="text-gray-400">
                  Format: <span className="text-white font-medium">{download.format.toUpperCase()}</span>
                </span>
                <span className="text-gray-400">
                  Size: <span className="text-white font-medium">{formatFileSize(download.file_size_bytes)}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    download.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : download.status === 'ready'
                      ? 'bg-blue-500/20 text-blue-400'
                      : download.status === 'pending' || download.status === 'processing'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : download.status === 'downloading'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {download.status}
                </span>
              </div>

              {download.error_message && (
                <p className="text-sm text-red-400 mt-2">
                  Error: {download.error_message}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>
                  Requested {formatDistanceToNow(new Date(download.created_at), { addSuffix: true })}
                </span>
                {download.expires_at && (
                  <span>
                    Expires {formatDistanceToNow(new Date(download.expires_at), { addSuffix: true })}
                  </span>
                )}
                {download.completed_at && (
                  <span>
                    Completed {formatDistanceToNow(new Date(download.completed_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {canDownload && (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg shadow-red-500/20"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download
                </button>
              )}

              {canCancel && (
                <button
                  onClick={onCancel}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-5 w-5 bg-gray-800 rounded"></div>
        <div className="h-6 w-6 bg-gray-800 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
          <div className="flex gap-4 mb-3">
            <div className="h-4 bg-gray-800 rounded w-24"></div>
            <div className="h-4 bg-gray-800 rounded w-20"></div>
            <div className="h-4 bg-gray-800 rounded w-28"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-800 rounded w-32"></div>
            <div className="h-3 bg-gray-800 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
