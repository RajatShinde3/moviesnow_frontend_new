/**
 * =============================================================================
 * DownloadQuotaBar Component
 * =============================================================================
 * Visual quota display with progress bars and stats
 */

'use client';

import { Download, HardDrive, Zap, Calendar, TrendingUp } from 'lucide-react';
import { useDownloadQuota } from '@/lib/api/hooks/useDownloads';
import { formatDistanceToNow } from 'date-fns';

export default function DownloadQuotaBar() {
  const { data: quota, isLoading } = useDownloadQuota();

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!quota) return null;

  const dailyPercentage = (quota.daily_downloads_used / quota.daily_download_limit) * 100;
  const bandwidthPercentage = (quota.monthly_bandwidth_used_gb / quota.monthly_bandwidth_limit_gb) * 100;
  const concurrentPercentage = (quota.current_concurrent_downloads / quota.concurrent_download_limit) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-red-400" />
          Download Quota
        </h2>
        <div className="text-sm text-gray-400">
          Resets {formatDistanceToNow(new Date(quota.last_daily_reset), { addSuffix: true })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Downloads */}
        <QuotaCard
          icon={<Download className="h-6 w-6" />}
          label="Daily Downloads"
          current={quota.daily_downloads_used}
          total={quota.daily_download_limit}
          percentage={dailyPercentage}
          color={getProgressColor(dailyPercentage)}
          suffix="downloads"
        />

        {/* Monthly Bandwidth */}
        <QuotaCard
          icon={<HardDrive className="h-6 w-6" />}
          label="Monthly Bandwidth"
          current={quota.monthly_bandwidth_used_gb}
          total={quota.monthly_bandwidth_limit_gb}
          percentage={bandwidthPercentage}
          color={getProgressColor(bandwidthPercentage)}
          suffix="GB"
          decimals={2}
        />

        {/* Concurrent Downloads */}
        <QuotaCard
          icon={<Zap className="h-6 w-6" />}
          label="Active Downloads"
          current={quota.current_concurrent_downloads}
          total={quota.concurrent_download_limit}
          percentage={concurrentPercentage}
          color={getProgressColor(concurrentPercentage)}
          suffix="active"
        />
      </div>

      {/* Warning Messages */}
      {dailyPercentage >= 90 && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ You're approaching your daily download limit. Consider upgrading to Premium for unlimited downloads.
          </p>
        </div>
      )}

      {bandwidthPercentage >= 90 && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ You're approaching your monthly bandwidth limit. Resets {formatDistanceToNow(new Date(quota.last_monthly_reset), { addSuffix: true })}.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuotaCard Sub-Component
// ─────────────────────────────────────────────────────────────────────────────

interface QuotaCardProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  total: number;
  percentage: number;
  color: string;
  suffix?: string;
  decimals?: number;
}

function QuotaCard({
  icon,
  label,
  current,
  total,
  percentage,
  color,
  suffix = '',
  decimals = 0,
}: QuotaCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-lg font-bold text-white">
            {current.toFixed(decimals)} / {total.toFixed(decimals)} {suffix}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-right">
        {percentage.toFixed(1)}% used
      </p>
    </div>
  );
}
