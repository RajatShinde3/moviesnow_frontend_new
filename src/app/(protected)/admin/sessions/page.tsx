// app/(protected)/admin/sessions/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  HelpCircle,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  Globe,
  Wifi,
  WifiOff,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useSessionMonitoring } from '@/hooks/useSessionMonitoring';
import type { UserSession, SessionStatus, DeviceType, SessionFilters } from '@/types/session';
import { DEVICE_ICONS, STATUS_COLORS, STATUS_LABELS } from '@/types/session';

export default function SessionMonitoringPage() {
  const [filters, setFilters] = useState<SessionFilters>({
    sortBy: 'lastActivity',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const {
    sessions,
    stats,
    alerts,
    isLoading,
    terminateSession,
    bulkTerminate,
    acknowledgeAlert,
    isTerminating,
    isBulkTerminating,
    isConnected,
  } = useSessionMonitoring({ ...filters, searchQuery });

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const toggleSessionSelection = (sessionId: string) => {
    const newSet = new Set(selectedSessions);
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId);
    } else {
      newSet.add(sessionId);
    }
    setSelectedSessions(newSet);
  };

  const handleBulkTerminate = () => {
    if (
      selectedSessions.size > 0 &&
      window.confirm(`Are you sure you want to terminate ${selectedSessions.size} session(s)?`)
    ) {
      bulkTerminate(
        { sessionIds: Array.from(selectedSessions), reason: 'Bulk termination by admin' },
        {
          onSuccess: () => setSelectedSessions(new Set()),
        }
      );
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'tv':
        return Tv;
      default:
        return HelpCircle;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
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
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Session Monitoring
                {isConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-medium text-green-100">
                    <Wifi className="w-4 h-4" />
                    <span>Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-100">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </div>
                )}
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Monitor and manage active user sessions in real-time
              </motion.p>
            </div>

            {selectedSessions.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkTerminate}
                disabled={isBulkTerminating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-100">Terminate ({selectedSessions.size})</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-2"
          >
            {unacknowledgedAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border flex items-start justify-between ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.severity === 'high'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'text-red-400'
                        : alert.severity === 'high'
                        ? 'text-orange-400'
                        : 'text-yellow-400'
                    }`}
                  />
                  <div>
                    <h4 className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</h4>
                    <p className="text-sm text-white/70 mt-1">{alert.message}</p>
                    <p className="text-xs text-white/50 mt-2">{getTimeAgo(alert.timestamp)}</p>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.totalActiveSessions}</h3>
              <p className="text-sm text-white/60 mt-1">Active Sessions</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-green-500/20">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-sm text-white/60 mt-1">Online Users</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-purple-500/20">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">{formatDuration(stats.sessionDuration.average)}</h3>
              <p className="text-sm text-white/60 mt-1">Avg Session Duration</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-orange-500/20">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.topLocations[0]?.flag || '🌍'}</h3>
              <p className="text-sm text-white/60 mt-1">{stats.topLocations[0]?.country || 'Global'}</p>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or IP address..."
              className="w-full pl-12 pr-4 py-3 bg-background-elevated border border-white/10 rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
              showFilters
                ? 'bg-accent-primary/20 border-accent-primary/40'
                : 'bg-background-elevated border-white/10 hover:bg-white/5'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </motion.div>

        {/* Session List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No active sessions</h3>
            <p className="text-white/60">There are no active sessions to display</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.deviceInfo.type);
              const isSelected = selectedSessions.has(session.id);
              const statusColor = STATUS_COLORS[session.status];

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-accent-primary/10 border-accent-primary/40'
                      : 'bg-gradient-to-br from-background-elevated to-background-hover border-white/10 hover:border-white/30'
                  } ${session.isCurrentSession ? 'ring-2 ring-green-500/30' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Selection Checkbox */}
                      {!session.isCurrentSession && (
                        <button
                          onClick={() => toggleSessionSelection(session.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 transition-all ${
                            isSelected
                              ? 'bg-accent-primary border-accent-primary'
                              : 'border-white/30 hover:border-white/50'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                      )}

                      {/* Device Icon */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                        <DeviceIcon className="w-6 h-6 text-accent-primary" />
                      </div>

                      {/* Session Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {session.username}
                              {session.isCurrentSession && (
                                <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-100">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-white/60">{session.email}</p>
                          </div>
                          <div
                            className="px-3 py-1 rounded-lg text-sm font-medium"
                            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                          >
                            {STATUS_LABELS[session.status]}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60">
                          <div>
                            <p className="text-xs text-white/40 mb-1">Device</p>
                            <p className="font-medium text-white/80">
                              {session.deviceInfo.browser} on {session.deviceInfo.os}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Location</p>
                            <p className="font-medium text-white/80 flex items-center gap-1">
                              {session.location.flag} {session.location.city || session.location.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">IP Address</p>
                            <p className="font-medium text-white/80 font-mono text-xs">{session.ipAddress}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Last Activity</p>
                            <p className="font-medium text-white/80">{getTimeAgo(session.lastActivity)}</p>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        {session.activityLog.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-white/40 mb-2">Recent Activity</p>
                            <div className="space-y-1">
                              {session.activityLog.slice(0, 3).map((activity) => (
                                <div key={activity.id} className="text-xs text-white/60 flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-accent-primary" />
                                  <span>{activity.description}</span>
                                  <span className="text-white/40">• {getTimeAgo(activity.timestamp)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!session.isCurrentSession && (
                      <button
                        onClick={() =>
                          terminateSession({ sessionId: session.id, reason: 'Terminated by admin' })
                        }
                        disabled={isTerminating}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
