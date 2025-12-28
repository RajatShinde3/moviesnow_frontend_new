"use client";

/**
 * =============================================================================
 * Webhook Management Dashboard
 * =============================================================================
 * Monitor webhook events from CDN, Email, Encoding, and Payment providers
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Webhook,
  Mail,
  Film,
  CreditCard,
  Cloud,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Calendar,
  Filter,
  Eye,
  RefreshCw,
  TrendingUp,
  Shield,
  AlertCircle,
} from "lucide-react";
import { webhooksService } from "@/lib/api/services/webhooks";
import type { WebhookEvent } from "@/lib/api/services/webhooks";

const WEBHOOK_SOURCES = [
  { id: "cdn", label: "CDN Events", icon: Cloud, color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
  { id: "email", label: "Email Events", icon: Mail, color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
  { id: "encoding", label: "Encoding", icon: Film, color: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
  { id: "payments", label: "Payments (Stripe)", icon: CreditCard, color: "text-emerald-400", gradient: "from-emerald-500 to-green-500" },
] as const;

export default function WebhooksPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [dateRange, setDateRange] = useState(7);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["webhooks", "stats", dateRange],
    queryFn: () => webhooksService.getWebhookStats(dateRange),
  });

  const { data: configurations } = useQuery({
    queryKey: ["webhooks", "configurations"],
    queryFn: () => webhooksService.getWebhookConfigurations(),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["webhooks", "events", selectedSource, dateRange],
    queryFn: () =>
      webhooksService.getWebhookEvents({
        source: selectedSource as any,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        per_page: 100,
      }),
  });

  const getSourceIcon = (source: string) => {
    const found = WEBHOOK_SOURCES.find((s) => s.id === source);
    return found?.icon || Webhook;
  };

  const getSourceColor = (source: string) => {
    const found = WEBHOOK_SOURCES.find((s) => s.id === source);
    return found?.color || "text-gray-400";
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Webhook className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300">Loading webhook data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Webhook className="w-10 h-10 text-purple-400" />
              Webhook Management
            </h1>
            <p className="text-slate-400 mt-2">
              Monitor and manage webhook events from external services
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Activity className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats?.total_events.toLocaleString() || 0}
              </p>
              <p className="text-slate-400 text-sm">Total Events ({dateRange}d)</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats?.events_last_24h || 0}
              </p>
              <p className="text-slate-400 text-sm">Last 24 Hours</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Clock className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {stats?.events_last_7d || 0}
              </p>
              <p className="text-slate-400 text-sm">Last 7 Days</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Shield className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {((1 - (stats?.failure_rate || 0)) * 100).toFixed(1)}%
              </p>
              <p className="text-slate-400 text-sm">Success Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Webhook Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Webhook className="w-6 h-6 text-purple-400" />
            Webhook Sources
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {WEBHOOK_SOURCES.map((source) => {
              const Icon = source.icon;
              const count = stats?.events_by_source[source.id] || 0;
              const isSelected = selectedSource === source.id;
              const config = configurations?.find((c) => c.source === source.id);

              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    setSelectedSource(selectedSource === source.id ? null : source.id)
                  }
                  className={`backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-500/20 border-purple-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-8 h-8 ${source.color}`} />
                    {config?.secret_configured && (
                      <div title="HMAC Configured">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{count}</p>
                  <p className="text-slate-400 text-sm">{source.label}</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-slate-500">
                      Endpoint: {config?.endpoint || "N/A"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Event Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Filter className="w-5 h-5 text-slate-400" />
          <p className="text-slate-300">
            {selectedSource
              ? `Showing ${selectedSource} events`
              : "Showing all webhook events"}
          </p>
          {selectedSource && (
            <button
              onClick={() => setSelectedSource(null)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Clear filter
            </button>
          )}
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                Recent Webhook Events
              </h3>
              <p className="text-sm text-slate-400">
                {eventsData?.total || 0} events
              </p>
            </div>
          </div>

          <div className="p-6">
            {eventsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
                <p className="text-slate-400">Loading events...</p>
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <div className="space-y-3">
                {eventsData.events.map((event) => {
                  const SourceIcon = getSourceIcon(event.source);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <SourceIcon
                            className={`w-5 h-5 mt-1 ${getSourceColor(event.source)}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getSourceColor(
                                  event.source
                                )} bg-current/20`}
                              >
                                {event.source}
                              </span>
                              <p className="text-sm text-white font-medium">
                                {event.action}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mt-2">
                              <div>
                                <span className="text-slate-500">Timestamp:</span>{" "}
                                {new Date(event.timestamp).toLocaleString()}
                              </div>
                              {event.actor && (
                                <div>
                                  <span className="text-slate-500">Actor:</span>{" "}
                                  {event.actor}
                                </div>
                              )}
                              {event.event_id && (
                                <div>
                                  <span className="text-slate-500">Event ID:</span>{" "}
                                  <code className="bg-slate-800/50 px-2 py-0.5 rounded text-xs">
                                    {event.event_id}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all"
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
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No webhook events found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Events will appear here when webhooks are triggered
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="backdrop-blur-sm bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Webhook className="w-6 h-6 text-purple-400" />
                  Webhook Event Details
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Source</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getSourceColor(
                        selectedEvent.source
                      )} bg-current/20`}
                    >
                      {selectedEvent.source}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Timestamp</p>
                    <p className="text-white">
                      {new Date(selectedEvent.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {selectedEvent.event_id && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Event ID</p>
                      <code className="bg-slate-800/50 px-3 py-1 rounded text-sm text-purple-300">
                        {selectedEvent.event_id}
                      </code>
                    </div>
                  )}
                </div>

                {selectedEvent.meta?.headers && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Headers (Scrubbed)</p>
                    <pre className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEvent.meta.headers, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEvent.meta?.body && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Payload</p>
                    <pre className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto max-h-96">
                      {JSON.stringify(selectedEvent.meta.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Webhook Configuration */}
        {configurations && configurations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              Webhook Configuration
            </h3>

            <div className="space-y-3">
              {configurations.map((config) => (
                <div
                  key={config.source}
                  className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-white capitalize">
                          {config.source}
                        </p>
                        {config.enabled ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500">Endpoint:</span>{" "}
                          <code className="text-slate-300">{config.endpoint}</code>
                        </div>
                        <div>
                          <span className="text-slate-500">HMAC:</span>{" "}
                          {config.secret_configured ? (
                            <span className="text-emerald-400">Configured</span>
                          ) : (
                            <span className="text-red-400">Not configured</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500">Dedup TTL:</span>{" "}
                          <span className="text-slate-300">
                            {config.dedup_ttl_seconds}s
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Status:</span>{" "}
                          {config.enabled ? (
                            <span className="text-emerald-400">Active</span>
                          ) : (
                            <span className="text-slate-400">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
