/**
 * =============================================================================
 * Content Timeline
 * =============================================================================
 * Interactive timeline showing content release schedule
 */

'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';

interface TimelineEvent {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'season' | 'episode';
  releaseDate: Date;
  thumbnail?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  rating?: number;
}

interface ContentTimelineProps {
  events: TimelineEvent[];
  onEventClick: (eventId: string) => void;
}

export default function ContentTimeline({ events, onEventClick }: ContentTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get days in current month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();
    events.forEach((event) => {
      const dateKey = format(event.releaseDate, 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    return grouped;
  }, [events]);

  const getEventsForDay = (day: Date): TimelineEvent[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Release Schedule</h2>
            <p className="text-sm text-gray-400">Upcoming shows and movies</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'month'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'week'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          ← Previous
        </button>
        <h3 className="text-xl font-bold text-white">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-500 uppercase py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for alignment */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const isCurrentDay = isToday(day);
          const isFutureDay = isFuture(day);

          return (
            <motion.button
              key={day.toISOString()}
              whileHover={{ scale: hasEvents ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => hasEvents && setSelectedDate(day)}
              className={`aspect-square rounded-lg p-2 transition-all relative ${
                isCurrentDay
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  : hasEvents
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-purple-500/30'
                  : 'bg-gray-900/50 text-gray-600'
              }`}
              disabled={!hasEvents}
            >
              {/* Day Number */}
              <div className="text-sm font-bold mb-1">{format(day, 'd')}</div>

              {/* Event Indicators */}
              {hasEvents && (
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        event.type === 'movie'
                          ? 'bg-blue-400'
                          : event.type === 'series'
                          ? 'bg-green-400'
                          : event.type === 'season'
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                      }`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] text-gray-400 font-bold">
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      {getEventsForDay(selectedDate).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Releasing on {format(selectedDate, 'MMMM d, yyyy')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getEventsForDay(selectedDate).map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onEventClick(event.id)}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                {event.thumbnail && (
                  <div className="relative aspect-video bg-gray-800">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                      {event.title}
                    </h5>
                    {event.rating && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs font-bold text-white">
                          {event.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`px-2 py-0.5 rounded ${
                      event.type === 'movie'
                        ? 'bg-blue-500/20 text-blue-400'
                        : event.type === 'series'
                        ? 'bg-green-500/20 text-green-400'
                        : event.type === 'season'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    {event.seasonNumber && (
                      <span>S{event.seasonNumber}</span>
                    )}
                    {event.episodeNumber && (
                      <span>E{event.episodeNumber}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-sm text-gray-400">Movie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-sm text-gray-400">Series</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-sm text-gray-400">Season</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400" />
          <span className="text-sm text-gray-400">Episode</span>
        </div>
      </div>
    </div>
  );
}
