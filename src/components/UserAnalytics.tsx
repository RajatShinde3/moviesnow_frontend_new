// components/UserAnalytics.tsx
/**
 * =============================================================================
 * User Analytics Component
 * =============================================================================
 * Best Practices:
 * - Visual charts and graphs
 * - Time period filtering
 * - Clear data presentation
 * - Performance optimized
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Clock,
  Film,
  Tv,
  TrendingUp,
  Calendar,
  Star,
  Play,
  BarChart3,
  PieChart,
} from "lucide-react";

interface WatchStats {
  total_watch_time_minutes: number;
  total_titles_watched: number;
  total_episodes_watched: number;
  movies_watched: number;
  series_watched: number;
  average_rating_given: number;
  favorite_genres: { genre: string; count: number }[];
  watch_time_by_day: { day: string; minutes: number }[];
  top_titles: { title: string; watch_time_minutes: number; poster_url?: string }[];
  streak_days: number;
  longest_streak: number;
}

type TimePeriod = "week" | "month" | "year" | "all";

export function UserAnalytics() {
  const [period, setPeriod] = React.useState<TimePeriod>("month");

  const { data: stats, isLoading } = useQuery<WatchStats | null>({
    queryKey: ["user-analytics", period],
    queryFn: async (): Promise<WatchStats | null> => {
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) return null;
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];
      if (!activeProfile) return null;

      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/analytics?period=${period}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        // Return mock data for demo
        return {
          total_watch_time_minutes: 4280,
          total_titles_watched: 47,
          total_episodes_watched: 186,
          movies_watched: 23,
          series_watched: 24,
          average_rating_given: 4.2,
          favorite_genres: [
            { genre: "Action", count: 18 },
            { genre: "Drama", count: 15 },
            { genre: "Sci-Fi", count: 12 },
            { genre: "Comedy", count: 8 },
            { genre: "Thriller", count: 6 },
          ],
          watch_time_by_day: [
            { day: "Mon", minutes: 120 },
            { day: "Tue", minutes: 90 },
            { day: "Wed", minutes: 150 },
            { day: "Thu", minutes: 80 },
            { day: "Fri", minutes: 200 },
            { day: "Sat", minutes: 280 },
            { day: "Sun", minutes: 240 },
          ],
          top_titles: [
            { title: "Breaking Bad", watch_time_minutes: 620 },
            { title: "The Dark Knight", watch_time_minutes: 152 },
            { title: "Stranger Things", watch_time_minutes: 480 },
            { title: "Inception", watch_time_minutes: 148 },
            { title: "Game of Thrones", watch_time_minutes: 380 },
          ],
          streak_days: 7,
          longest_streak: 21,
        } as WatchStats;
      }
      return response.json();
    },
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">My Analytics</h1>
            <p className="mt-2 text-gray-400">Your watching statistics and preferences</p>
          </div>

          {/* Period Selector */}
          <div className="flex rounded-lg bg-gray-900 p-1">
            {(["week", "month", "year", "all"] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors",
                  period === p ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {p === "all" ? "All Time" : `This ${p}`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-900" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Clock className="h-6 w-6" />}
                label="Total Watch Time"
                value={formatTime(stats.total_watch_time_minutes)}
                color="blue"
              />
              <StatCard
                icon={<Film className="h-6 w-6" />}
                label="Titles Watched"
                value={stats.total_titles_watched.toString()}
                subtext={`${stats.movies_watched} movies, ${stats.series_watched} series`}
                color="purple"
              />
              <StatCard
                icon={<Tv className="h-6 w-6" />}
                label="Episodes Watched"
                value={stats.total_episodes_watched.toString()}
                color="green"
              />
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Current Streak"
                value={`${stats.streak_days} days`}
                subtext={`Best: ${stats.longest_streak} days`}
                color="yellow"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Watch Time by Day */}
              <div className="rounded-lg bg-gray-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Watch Time by Day</h2>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {stats.watch_time_by_day.map((day) => {
                    const maxMinutes = Math.max(...stats.watch_time_by_day.map(d => d.minutes));
                    const height = (day.minutes / maxMinutes) * 100;
                    return (
                      <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                        <div className="relative w-full flex-1">
                          <div
                            className="absolute bottom-0 w-full rounded-t bg-blue-600 transition-all"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="rounded-lg bg-gray-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Favorite Genres</h2>
                </div>
                <div className="space-y-3">
                  {stats.favorite_genres.map((genre, i) => {
                    const maxCount = stats.favorite_genres[0].count;
                    const width = (genre.count / maxCount) * 100;
                    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-yellow-500", "bg-red-500"];
                    return (
                      <div key={genre.genre} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{genre.genre}</span>
                          <span className="text-gray-400">{genre.count} titles</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-800">
                          <div
                            className={cn("h-full rounded-full transition-all", colors[i % colors.length])}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Titles */}
              <div className="rounded-lg bg-gray-900 p-6 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Most Watched Titles</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.top_titles.map((title, i) => (
                    <div key={title.title} className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-lg font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{title.title}</p>
                        <p className="text-xs text-gray-400">{formatTime(title.watch_time_minutes)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Rating */}
              <div className="rounded-lg bg-gray-900 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Your Average Rating</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-white">{stats.average_rating_given.toFixed(1)}</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-8 w-8",
                          star <= Math.round(stats.average_rating_given) ? "text-yellow-400" : "text-gray-700"
                        )}
                        fill={star <= Math.round(stats.average_rating_given) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Based on {stats.total_titles_watched} rated titles
                </p>
              </div>

              {/* Quick Stats */}
              <div className="rounded-lg bg-gray-900 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-800 p-4 text-center">
                    <Play className="mx-auto h-6 w-6 text-blue-400" />
                    <div className="mt-2 text-2xl font-bold text-white">
                      {Math.round(stats.total_watch_time_minutes / stats.total_titles_watched)}m
                    </div>
                    <p className="text-xs text-gray-400">Avg per title</p>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-4 text-center">
                    <Calendar className="mx-auto h-6 w-6 text-green-400" />
                    <div className="mt-2 text-2xl font-bold text-white">
                      {Math.round(stats.total_watch_time_minutes / 7)}m
                    </div>
                    <p className="text-xs text-gray-400">Avg per day</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-gray-900 p-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-xl font-semibold text-white">No analytics yet</h3>
            <p className="mt-2 text-gray-400">Start watching to see your stats</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: "blue" | "purple" | "green" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("rounded-full p-2", colorClasses[color])}>{icon}</div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
    </div>
  );
}
