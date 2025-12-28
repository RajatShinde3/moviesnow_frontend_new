// app/(protected)/admin/audit/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  XOctagon,
  ChevronDown,
  ChevronUp,
  MapPin,
  Monitor,
  Clock,
  X,
  FileJson,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type {
  AuditLog,
  AuditFilters,
  AuditAction,
  AuditResource,
  AuditSeverity,
  ExportFormat,
} from '@/types/audit';
import {
  SEVERITY_COLORS,
  SEVERITY_ICONS,
  ACTION_CATEGORIES,
  ACTION_LABELS,
} from '@/types/audit';
import * as Icons from 'lucide-react';

export default function AuditLogViewerPage() {
  const [filters, setFilters] = useState<AuditFilters>({
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit: 50,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const { logs, stats, isLoading, exportLogs, isExporting } = useAuditLogs({
    ...filters,
    searchQuery,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const getSeverityIcon = (severity: AuditSeverity) => {
    const iconName = SEVERITY_ICONS[severity];
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{
      className?: string;
    }>;
    return IconComponent || Info;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExport = (format: ExportFormat) => {
    exportLogs({
      filters: { ...filters, searchQuery, startDate: dateRange.start, endDate: dateRange.end },
      format,
      includeMetadata: true,
      includeChanges: true,
    });
  };

  const toggleFilter = (
    filterType: 'actions' | 'resources' | 'severities' | 'status',
    value: string
  ) => {
    setFilters((prev) => {
      const currentFilter = prev[filterType] || [];
      const newFilter = currentFilter.includes(value as never)
        ? currentFilter.filter((v) => v !== value)
        : [...currentFilter, value as never];
      return { ...prev, [filterType]: newFilter };
    });
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
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Audit Log Viewer
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Track and analyze all system activities and security events
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-elevated border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors first:rounded-t-xl"
                  >
                    <FileJson className="w-5 h-5 text-blue-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors last:rounded-b-xl"
                  >
                    <FileText className="w-5 h-5 text-red-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</h3>
              <p className="text-sm text-white/60 mt-1">Total Logs</p>
              <p className="text-xs text-blue-200/60 mt-2">+{stats.todayLogs} today</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-red-500/20">
                  <XOctagon className="w-5 h-5 text-red-400" />
                </div>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.failedActions}</h3>
              <p className="text-sm text-white/60 mt-1">Failed Actions</p>
              <p className="text-xs text-red-200/60 mt-2">Requires attention</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-orange-500/20">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.criticalEvents}</h3>
              <p className="text-sm text-white/60 mt-1">Critical Events</p>
              <p className="text-xs text-orange-200/60 mt-2">Security alerts</p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-green-500/20">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.topUsers.length}</h3>
              <p className="text-sm text-white/60 mt-1">Active Users</p>
              <p className="text-xs text-green-200/60 mt-2">Tracked activities</p>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 space-y-3"
        >
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, email, action, or resource..."
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
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-xl bg-background-elevated border border-white/10 space-y-4 overflow-hidden"
              >
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="flex gap-3">
                    <input
                      type="datetime-local"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                    />
                    <input
                      type="datetime-local"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <div className="flex flex-wrap gap-2">
                    {(['info', 'low', 'medium', 'high', 'critical'] as AuditSeverity[]).map((severity) => {
                      const isSelected = filters.severities?.includes(severity);
                      return (
                        <button
                          key={severity}
                          onClick={() => toggleFilter('severities', severity)}
                          className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                            isSelected
                              ? 'border-2'
                              : 'border hover:border-white/30'
                          }`}
                          style={{
                            backgroundColor: isSelected ? `${SEVERITY_COLORS[severity]}20` : 'rgba(255, 255, 255, 0.05)',
                            borderColor: isSelected ? SEVERITY_COLORS[severity] : 'rgba(255, 255, 255, 0.1)',
                            color: isSelected ? SEVERITY_COLORS[severity] : 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {severity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="flex gap-2">
                    {['success', 'failure'].map((status) => {
                      const isSelected = filters.status?.includes(status as 'success' | 'failure');
                      return (
                        <button
                          key={status}
                          onClick={() => toggleFilter('status', status)}
                          className={`flex-1 px-4 py-2 rounded-lg border transition-all capitalize ${
                            isSelected
                              ? status === 'success'
                                ? 'bg-green-500/20 border-green-500/40 text-green-100'
                                : 'bg-red-500/20 border-red-500/40 text-red-100'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilters({ sortBy: 'timestamp', sortOrder: 'desc', limit: 50 });
                    setDateRange({ start: '', end: '' });
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Audit Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-semibold mb-2">No audit logs found</h3>
            <p className="text-white/60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            {logs.map((log, index) => {
              const SeverityIcon = getSeverityIcon(log.severity);
              const severityColor = SEVERITY_COLORS[log.severity];

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-background-elevated to-background-hover hover:border-white/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${severityColor}20` }}
                      >
                        <div style={{ color: severityColor }}>
                          <SeverityIcon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {ACTION_LABELS[log.action]}
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: log.status === 'success' ? '#10b98120' : '#ef444420',
                                  color: log.status === 'success' ? '#10b981' : '#ef4444',
                                }}
                              >
                                {log.status}
                              </span>
                            </h3>
                            <p className="text-sm text-white/60 mt-1">{log.username} ({log.email})</p>
                          </div>
                          <div className="text-xs text-white/50 text-right">
                            <p>{formatTimestamp(log.timestamp)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1.5">
                            <Monitor className="w-4 h-4" />
                            <span className="font-mono text-xs">{log.ipAddress}</span>
                          </div>
                          {log.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {log.location.flag} {log.location.city || log.location.country}
                              </span>
                            </div>
                          )}
                          {log.resourceName && (
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-4 h-4" />
                              <span>{log.resourceName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-auto pointer-events-auto shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold">{ACTION_LABELS[selectedLog.action]}</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Timestamp</p>
                      <p className="font-medium">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Status</p>
                      <p
                        className="font-medium"
                        style={{
                          color: selectedLog.status === 'success' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {selectedLog.status.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">User</p>
                      <p className="font-medium">{selectedLog.username}</p>
                      <p className="text-sm text-white/60">{selectedLog.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Severity</p>
                      <p
                        className="font-medium capitalize"
                        style={{ color: SEVERITY_COLORS[selectedLog.severity] }}
                      >
                        {selectedLog.severity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">IP Address</p>
                      <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                    </div>
                    {selectedLog.location && (
                      <div>
                        <p className="text-xs text-white/40 mb-1">Location</p>
                        <p className="font-medium">
                          {selectedLog.location.flag} {selectedLog.location.city || selectedLog.location.country}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedLog.changes && selectedLog.changes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Changes</p>
                      <div className="space-y-2">
                        {selectedLog.changes.map((change, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/60 mb-1">{change.field}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-red-400 line-through">
                                {JSON.stringify(change.oldValue)}
                              </span>
                              <span className="text-white/40">→</span>
                              <span className="text-green-400">{JSON.stringify(change.newValue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLog.errorMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-100 mb-1">Error Message</p>
                      <p className="text-sm text-red-200/80">{selectedLog.errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
