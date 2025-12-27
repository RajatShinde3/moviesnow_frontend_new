/**
 * =============================================================================
 * Admin Loading Skeletons
 * =============================================================================
 * Reusable loading states for admin pages with beautiful animations
 */

'use client';

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-800 animate-pulse">
      <div className="w-12 h-12 bg-gray-800 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-8 bg-gray-800 rounded" />
        <div className="w-20 h-8 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-4 bg-gray-800 rounded" />
        <div className="w-8 h-8 bg-gray-800 rounded-lg" />
      </div>
      <div className="w-20 h-8 bg-gray-800 rounded mb-2" />
      <div className="w-24 h-3 bg-gray-800 rounded" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-pulse">
      <div className="w-full aspect-video bg-gray-800 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-5 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-800 rounded w-20" />
          <div className="h-8 bg-gray-800 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-24" />
        <div className="h-10 bg-gray-800 rounded w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-32" />
        <div className="h-24 bg-gray-800 rounded w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-20" />
          <div className="h-10 bg-gray-800 rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-20" />
          <div className="h-10 bg-gray-800 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <div className="h-10 bg-gray-800 rounded w-24" />
        <div className="h-10 bg-gray-800 rounded w-32" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-48 mb-6" />
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-48">
          {[60, 80, 40, 90, 70, 85, 65].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-800 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="h-3 bg-gray-800 rounded w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-64" />
        <div className="h-4 bg-gray-800 rounded w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-48" />
        </div>
        <ListSkeleton count={8} />
      </div>
    </div>
  );
}
