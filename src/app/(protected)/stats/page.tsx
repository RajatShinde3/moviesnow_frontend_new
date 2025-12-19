'use client';

/**
 * User Analytics Dashboard
 * =========================
 * Comprehensive viewing statistics and insights with:
 * - Watch time tracking and trends
 * - Genre preferences and breakdown
 * - Quality usage statistics
 * - Device usage analytics
 * - Viewing patterns and habits
 * - Interactive charts and visualizations
 * - Performance metrics
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Play,
  TrendingUp,
  Tv,
  Film,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Zap,
  Eye,
} from 'lucide-react';

interface ViewingInsights {
  user_id: string;
  period_days: number;
  total_sessions: number;
  total_watch_time_minutes: number;
  avg_session_duration_minutes: number;
  quality_distribution: { [key: string]: number };
  performance_metrics: {
    avg_buffer_ratio: number;
    avg_startup_time_ms: number;
  };
  device_usage: Array<{
    device_type: string;
    sessions: number;
    watch_time_minutes: number;
  }>;
}

interface QualityPreferences {
  user_id: string;
  period_days: number;
  current_preference: string | null;
  recommended_preference: string | null;
  quality_usage: Array<{
    quality: string;
    sessions: number;
    percentage: number;
  }>;
  confidence_score: number | null;
}

export default function StatsPage() {
  const [periodDays, setPeriodDays] = useState(30);

  // Fetch viewing insights
  const { data: insights, isLoading: insightsLoading } = useQuery<ViewingInsights>({
    queryKey: ['viewing-insights', periodDays],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/users/me/analytics/viewing-insights?period_days=${periodDays}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
  });

  // Fetch quality preferences
  const { data: qualityPrefs, isLoading: qualityLoading } = useQuery<QualityPreferences>({
    queryKey: ['quality-preferences', periodDays],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/users/me/analytics/quality-preferences?period_days=${periodDays}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch quality preferences');
      return response.json();
    },
  });

  const isLoading = insightsLoading || qualityLoading;

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      case 'tv':
        return Tv;
      default:
        return Monitor;
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color = 'red',
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className="rounded-lg bg-gray-800/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-lg bg-${color}-500/10 p-3`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Your Viewing Stats
            </h1>
            <p className="mt-2 text-gray-400">
              Insights into your entertainment habits
            </p>
          </div>

          {/* Period Selector */}
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="rounded-lg bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Clock}
            label="Total Watch Time"
            value={insights ? formatTime(insights.total_watch_time_minutes) : '0m'}
            subtitle={`${periodDays} days`}
            color="red"
          />
          <StatCard
            icon={Play}
            label="Total Sessions"
            value={insights?.total_sessions || 0}
            subtitle={`Avg ${insights ? Math.round(insights.avg_session_duration_minutes) : 0} min/session`}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Session"
            value={insights ? formatTime(insights.avg_session_duration_minutes) : '0m'}
            subtitle="per viewing session"
            color="green"
          />
          <StatCard
            icon={Activity}
            label="Streaming Quality"
            value={qualityPrefs?.current_preference || 'Auto'}
            subtitle={qualityPrefs?.recommended_preference ? `Recommended: ${qualityPrefs.recommended_preference}` : ''}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quality Distribution */}
          <div className="rounded-lg bg-gray-800/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <PieChart className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Quality Distribution</h2>
            </div>

            {qualityPrefs && qualityPrefs.quality_usage.length > 0 ? (
              <div className="space-y-4">
                {qualityPrefs.quality_usage.map((item, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-300">{item.quality}</span>
                      <span className="text-gray-400">
                        {item.sessions} sessions ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Eye className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p>No quality data available</p>
              </div>
            )}
          </div>

          {/* Device Usage */}
          <div className="rounded-lg bg-gray-800/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Device Usage</h2>
            </div>

            {insights && insights.device_usage.length > 0 ? (
              <div className="space-y-6">
                {insights.device_usage.map((device, index) => {
                  const Icon = getDeviceIcon(device.device_type);
                  const percentage = (device.watch_time_minutes / insights.total_watch_time_minutes) * 100;

                  return (
                    <div key={index} className="rounded-lg bg-gray-900/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-500/10 p-2">
                            <Icon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-white capitalize">{device.device_type}</p>
                            <p className="text-sm text-gray-400">{device.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatTime(device.watch_time_minutes)}</p>
                          <p className="text-sm text-gray-400">{Math.round(percentage)}%</p>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Monitor className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p>No device data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        {insights?.performance_metrics && (
          <div className="rounded-lg bg-gray-800/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-900/50 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <p className="font-medium text-gray-300">Average Buffer Ratio</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {((insights.performance_metrics.avg_buffer_ratio || 0) * 100).toFixed(2)}%
                </p>
                <p className="mt-1 text-sm text-gray-500">Lower is better</p>
              </div>

              <div className="rounded-lg bg-gray-900/50 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <p className="font-medium text-gray-300">Average Startup Time</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {Math.round(insights.performance_metrics.avg_startup_time_ms || 0)}ms
                </p>
                <p className="mt-1 text-sm text-gray-500">Faster loading times</p>
              </div>
            </div>
          </div>
        )}

        {/* Quality Recommendation */}
        {qualityPrefs?.recommended_preference &&
         qualityPrefs.recommended_preference !== qualityPrefs.current_preference && (
          <div className="mt-8 rounded-lg border border-blue-500/20 bg-blue-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Quality Recommendation</h3>
                <p className="mt-2 text-gray-300">
                  Based on your viewing patterns and device usage, we recommend switching to{' '}
                  <strong className="text-blue-400">{qualityPrefs.recommended_preference}</strong> quality for an optimal experience.
                </p>
                {qualityPrefs.confidence_score && (
                  <p className="mt-2 text-sm text-gray-400">
                    Confidence: {(qualityPrefs.confidence_score * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!insights?.total_sessions && (
          <div className="rounded-lg bg-gray-800/50 p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-xl font-semibold text-white">No viewing data yet</h3>
            <p className="text-gray-400">
              Start watching content to see your personalized viewing statistics and insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
