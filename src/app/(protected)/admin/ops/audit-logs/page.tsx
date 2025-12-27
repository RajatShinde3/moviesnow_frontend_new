"use client";

/**
 * =============================================================================
 * Audit Logs Viewer
 * =============================================================================
 * Comprehensive audit trail of all admin actions and system events
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Filter,
  Download,
  Search,
  User,
  Activity,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Database,
  Lock,
  Settings,
  Webhook,
  Mail,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { auditService } from "@/lib/api/services/audit";
import type { AuditLogEntry } from "@/lib/api/services/audit";

const SOURCE_ICONS: Record<string, any> = {
  admin: Shield,
  user: User,
  system: Settings,
  database: Database,
  auth: Lock,
  webhook: Webhook,
  email: Mail,
  payments: CreditCard,
  cdn: Activity,
  encoding: FileText,
};

const SOURCE_COLORS: Record<string, string> = {
  admin: "text-purple-400",
  user: "text-blue-400",
  system: "text-cyan-400",
  database: "text-emerald-400",
  auth: "text-amber-400",
  webhook: "text-pink-400",
  email: "text-indigo-400",
  payments: "text-green-400",
  cdn: "text-orange-400",
  encoding: "text-violet-400",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [actorFilter, setActorFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Queries
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["audit-logs", page, pageSize, sourceFilter, actorFilter],
    queryFn: () =>
      auditService.getAuditLogs({
        page,
        page_size: pageSize,
        source: sourceFilter || undefined,
        actor: actorFilter || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["audit-logs", "stats"],
    queryFn: () => auditService.getAuditStats(),
  });

  const getSourceIcon = (source: string) => {
    return SOURCE_ICONS[source.toLowerCase()] || Activity;
  };

  const getSourceColor = (source: string) => {
    return SOURCE_COLORS[source.toLowerCase()] || "text-gray-400";
  };

  const filteredLogs =
    logsData?.items.filter(
      (log) =>
        !searchTerm ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalPages = logsData ? Math.ceil(logsData.total / pageSize) : 0;

  const uniqueSources = stats
    ? Object.keys(stats.entries_by_source).sort()
    : [];

  if (isLoading && !logsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300">Loading audit logs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-400" />
              Audit Logs
            </h1>
            <p className="text-slate-400 mt-2">
              Complete audit trail of system events and admin actions
            </p>
          </div>

          <button
            onClick={() => auditService.exportAuditLogs()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
          >
            <Download className="w-5 h-5 inline mr-2" />
            Export Logs
          </button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <FileText className="w-8 h-8 text-indigo-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats?.total_entries.toLocaleString() || 0}
              </p>
              <p className="text-slate-400 text-sm">Total Entries</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Database className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats ? Object.keys(stats.entries_by_source).length : 0}
              </p>
              <p className="text-slate-400 text-sm">Unique Sources</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Activity className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats ? Object.keys(stats.entries_by_action).length : 0}
              </p>
              <p className="text-slate-400 text-sm">Action Types</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <User className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats?.unique_actors || 0}
              </p>
              <p className="text-slate-400 text-sm">Unique Actors</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Sources</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source} ({stats?.entries_by_source[source]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Actor</label>
              <input
                type="text"
                value={actorFilter}
                onChange={(e) => {
                  setActorFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by actor..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={200}>200 per page</option>
              </select>
            </div>
          </div>

          {(searchTerm || sourceFilter || actorFilter) && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm text-slate-400">
                Active filters: {searchTerm && `Search: "${searchTerm}"`}
                {sourceFilter && ` Source: ${sourceFilter}`}
                {actorFilter && ` Actor: ${actorFilter}`}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSourceFilter("");
                  setActorFilter("");
                  setPage(1);
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-400" />
                Log Entries
              </h3>
              <p className="text-sm text-slate-400">
                Showing {filteredLogs.length} of {logsData?.total || 0} entries
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLogs.length > 0 ? (
              <div className="p-6 space-y-2">
                {filteredLogs.map((log) => {
                  const SourceIcon = getSourceIcon(log.source);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <SourceIcon
                            className={`w-5 h-5 mt-1 ${getSourceColor(log.source)}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getSourceColor(
                                  log.source
                                )} bg-current/20`}
                              >
                                {log.source}
                              </span>
                              <p className="text-sm text-white font-medium">{log.action}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                              <div>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                              {log.actor && (
                                <div>
                                  <User className="w-3 h-3 inline mr-1" />
                                  {log.actor}
                                </div>
                              )}
                              {log.ip_address && (
                                <div>
                                  <Activity className="w-3 h-3 inline mr-1" />
                                  {log.ip_address}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No audit logs found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-300 px-4">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="backdrop-blur-sm bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  Audit Log Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">ID</p>
                    <code className="bg-slate-800/50 px-3 py-1 rounded text-sm text-purple-300">
                      {selectedLog.id}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Timestamp</p>
                    <p className="text-white">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Source</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getSourceColor(
                        selectedLog.source
                      )} bg-current/20`}
                    >
                      {selectedLog.source}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Action</p>
                    <p className="text-white">{selectedLog.action}</p>
                  </div>
                  {selectedLog.actor && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Actor</p>
                      <p className="text-white">{selectedLog.actor}</p>
                    </div>
                  )}
                  {selectedLog.ip_address && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">IP Address</p>
                      <p className="text-white">{selectedLog.ip_address}</p>
                    </div>
                  )}
                  {selectedLog.user_agent && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-1">User Agent</p>
                      <p className="text-white text-sm">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>

                {selectedLog.meta && Object.keys(selectedLog.meta).length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Metadata</p>
                    <pre className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto max-h-96">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
