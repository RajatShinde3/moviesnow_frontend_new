/**
 * =============================================================================
 * AnimeSchedule Component
 * =============================================================================
 * Beautiful airing schedule with calendar view
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnimeSchedule } from '@/lib/api/hooks/useAnime';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';

export default function AnimeSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const from_ts = weekStart.toISOString();
  const to_ts = endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString();

  const { data: schedule, isLoading, refetch } = useAnimeSchedule({
    from_ts,
    to_ts,
  });

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(today);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getScheduleForDay = (date: Date) => {
    if (!schedule) return [];
    return schedule.filter((item) => {
      const airDate = parseISO(item.air_time);
      return isSameDay(airDate, date);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar className="h-10 w-10 text-red-400" />
                Anime Schedule
              </h1>
              <p className="text-gray-400">
                Track your favorite anime airing times
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousWeek}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                {format(weekStart, 'MMMM yyyy')}
              </h2>
              <p className="text-sm text-gray-400">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={goToNextWeek}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((date) => {
              const daySchedule = getScheduleForDay(date);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`relative p-4 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                      : isToday
                      ? 'bg-gray-800 border-2 border-red-500'
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  <div className="text-center">
                    <p
                      className={`text-xs font-medium mb-1 ${
                        isSelected ? 'text-red-200' : 'text-gray-400'
                      }`}
                    >
                      {format(date, 'EEE')}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isSelected ? 'text-white' : 'text-white'
                      }`}
                    >
                      {format(date, 'd')}
                    </p>
                    {daySchedule.length > 0 && (
                      <div
                        className={`mt-2 text-xs font-medium ${
                          isSelected ? 'text-red-200' : 'text-red-400'
                        }`}
                      >
                        {daySchedule.length} episode{daySchedule.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {isToday && !isSelected && (
                    <div className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Schedule */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <ScheduleSkeleton key={i} />
              ))}
            </div>
          ) : getScheduleForDay(selectedDate).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-700 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">No episodes airing</h4>
              <p className="text-gray-400">
                No anime scheduled to air on this day
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getScheduleForDay(selectedDate)
                .sort((a, b) => new Date(a.air_time).getTime() - new Date(b.air_time).getTime())
                .map((item, index) => (
                  <ScheduleCard key={`${item.title_id}-${item.episode_number}-${index}`} item={item} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleCardProps {
  item: {
    title_id: string;
    episode_number: number;
    air_time: string;
    region?: string;
  };
}

function ScheduleCard({ item }: ScheduleCardProps) {
  const airDate = parseISO(item.air_time);
  const isUpcoming = airDate > new Date();

  return (
    <div className="bg-gray-800/50 rounded-lg p-5 hover:bg-gray-800 transition-all duration-200 border border-gray-700 hover:border-gray-600">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-1 rounded-md text-xs font-bold ${
                isUpcoming
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Episode {item.episode_number}
            </span>
            {item.region && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                {item.region}
              </span>
            )}
          </div>

          <h4 className="text-lg font-bold text-white mb-2">
            Title ID: {item.title_id}
          </h4>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{format(airDate, 'h:mm a')}</span>
            <span className="text-gray-600">•</span>
            <span>
              {isUpcoming
                ? `Airs in ${Math.floor((airDate.getTime() - Date.now()) / (1000 * 60))} minutes`
                : `Aired ${format(airDate, 'MMM d, h:mm a')}`}
            </span>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-red-500/20"
        >
          View
        </button>
      </div>
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-lg p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded w-32 mb-3"></div>
          <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-10 w-20 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
