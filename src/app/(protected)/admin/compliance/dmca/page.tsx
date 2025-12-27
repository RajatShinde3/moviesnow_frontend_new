"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Mail,
  X,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api/services";
import type { DMCATakedownRequest } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data/DataTable";
import { ConfirmDialog } from "@/components/ui/data/ConfirmDialog";

const STATUS_CONFIG = {
  pending: { label: "Pending Review", color: "amber", icon: Clock },
  approved: { label: "Approved", color: "green", icon: CheckCircle },
  rejected: { label: "Rejected", color: "red", icon: XCircle },
} as const;

export default function DMCACompliancePage() {
  const queryClient = useQueryClient();
  const [viewingRequest, setViewingRequest] = useState<DMCATakedownRequest | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Fetch DMCA requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin", "compliance", "dmca"],
    queryFn: () => api.compliance.listDMCATakedowns(),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin", "compliance", "dmca", "stats"],
    queryFn: () => api.compliance.getDMCAStats(),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (data: { requestId: string; notes?: string }) =>
      api.compliance.approveDMCATakedown(data.requestId, { notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "dmca"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "dmca", "stats"] });
      closeProcessModal();
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string; notes?: string }) =>
      api.compliance.rejectDMCATakedown(data.requestId, { notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "dmca"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "compliance", "dmca", "stats"] });
      closeProcessModal();
    },
  });

  const closeProcessModal = () => {
    setProcessingRequestId(null);
    setAction(null);
    setNotes("");
  };

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingRequestId || !action) return;

    if (action === "approve") {
      approveMutation.mutate({ requestId: processingRequestId, notes: notes || undefined });
    } else {
      rejectMutation.mutate({ requestId: processingRequestId, notes: notes || undefined });
    }
  };

  const openProcessModal = (requestId: string, actionType: "approve" | "reject") => {
    setProcessingRequestId(requestId);
    setAction(actionType);
  };

  // Filter requests
  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter((req) => req.status === statusFilter);

  // DataTable columns
  const columns = [
    {
      header: "ID",
      accessor: "id" as keyof DMCATakedownRequest,
      cell: (value: any) => (
        <span className="font-mono text-xs text-slate-400">
          {value.toString().slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Content",
      accessor: "title_id" as keyof DMCATakedownRequest,
      cell: (value: any, row: DMCATakedownRequest) => (
        <div>
          <div className="font-medium text-white">{row.content_title || "Unknown Title"}</div>
          <div className="text-xs text-slate-400">ID: {value?.toString().slice(0, 8)}</div>
        </div>
      ),
    },
    {
      header: "Complainant",
      accessor: "complainant_name" as keyof DMCATakedownRequest,
      cell: (value: any, row: DMCATakedownRequest) => (
        <div>
          <div className="text-white">{value}</div>
          <div className="text-xs text-slate-400">{row.complainant_email}</div>
        </div>
      ),
    },
    {
      header: "Submitted",
      accessor: "submitted_at" as keyof DMCATakedownRequest,
      cell: (value: any) => (
        <span className="text-sm text-slate-300">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status" as keyof DMCATakedownRequest,
      cell: (value: any) => {
        const config = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG];
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400 text-xs font-medium rounded-full`}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "id" as keyof DMCATakedownRequest,
      cell: (value: any, row: DMCATakedownRequest) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingRequest(row)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={() => openProcessModal(value.toString(), "approve")}
                className="p-2 hover:bg-green-900/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => openProcessModal(value.toString(), "reject")}
                className="p-2 hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              DMCA Compliance Manager
            </h1>
            <p className="text-slate-400">
              Review and process DMCA takedown requests
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? "bg-red-500/20 border border-red-500/30 text-red-400"
                    : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-400" />
                <span className="text-3xl font-bold text-white">{stats.pending_count}</span>
              </div>
              <p className="text-slate-400 text-sm">Pending Review</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats.approved_count}</span>
              </div>
              <p className="text-slate-400 text-sm">Approved</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-rose-900/20 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-400" />
                <span className="text-3xl font-bold text-white">{stats.rejected_count}</span>
              </div>
              <p className="text-slate-400 text-sm">Rejected</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">{stats.total_requests}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Requests</p>
            </div>
          </motion.div>
        )}

        {/* Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
        >
          <DataTable
            data={filteredRequests}
            columns={columns}
            searchable
            searchPlaceholder="Search by complainant, content..."
            emptyMessage="No DMCA requests found"
          />
        </motion.div>

        {/* View Request Modal */}
        <AnimatePresence>
          {viewingRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setViewingRequest(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      DMCA Takedown Request Details
                    </h2>
                    <button
                      onClick={() => setViewingRequest(null)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-400">Status</span>
                      {(() => {
                        const config = STATUS_CONFIG[viewingRequest.status as keyof typeof STATUS_CONFIG];
                        const Icon = config.icon;
                        return (
                          <div
                            className={`mt-2 inline-flex items-center gap-2 px-4 py-2 bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400 font-medium rounded-lg`}
                          >
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-400">Submitted</span>
                      <div className="mt-1 text-white font-medium">
                        {new Date(viewingRequest.submitted_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">
                      Reported Content
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Title</span>
                        <span className="text-white font-medium">
                          {viewingRequest.content_title || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Content ID</span>
                        <span className="text-white font-mono text-sm">
                          {viewingRequest.title_id?.toString().slice(0, 16)}...
                        </span>
                      </div>
                      {viewingRequest.infringing_url && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">URL</span>
                          <a
                            href={viewingRequest.infringing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm"
                          >
                            View Content
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complainant Info */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">
                      Complainant Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name</span>
                        <span className="text-white font-medium">
                          {viewingRequest.complainant_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email</span>
                        <a
                          href={`mailto:${viewingRequest.complainant_email}`}
                          className="text-blue-400 hover:underline"
                        >
                          {viewingRequest.complainant_email}
                        </a>
                      </div>
                      {viewingRequest.complainant_organization && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Organization</span>
                          <span className="text-white">
                            {viewingRequest.complainant_organization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">
                      Complaint Details
                    </h3>
                    <p className="text-white whitespace-pre-wrap">
                      {viewingRequest.complaint_details}
                    </p>
                  </div>

                  {/* Copyrighted Work */}
                  {viewingRequest.copyrighted_work_description && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-400 mb-3">
                        Copyrighted Work Description
                      </h3>
                      <p className="text-white whitespace-pre-wrap">
                        {viewingRequest.copyrighted_work_description}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {viewingRequest.admin_notes && (
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-400 mb-3">
                        Admin Notes
                      </h3>
                      <p className="text-white whitespace-pre-wrap">
                        {viewingRequest.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Processed Info */}
                  {viewingRequest.status !== "pending" && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-400 mb-3">
                        Processing Information
                      </h3>
                      <div className="space-y-2">
                        {viewingRequest.processed_at && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Processed At</span>
                            <span className="text-white">
                              {new Date(viewingRequest.processed_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {viewingRequest.processed_by && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Processed By</span>
                            <span className="text-white">{viewingRequest.processed_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {viewingRequest.status === "pending" && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => {
                          openProcessModal(viewingRequest.id.toString(), "reject");
                          setViewingRequest(null);
                        }}
                        className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg font-medium transition-all"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => {
                          openProcessModal(viewingRequest.id.toString(), "approve");
                          setViewingRequest(null);
                        }}
                        className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg font-medium transition-all"
                      >
                        Approve & Takedown
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Process Modal */}
        <AnimatePresence>
          {processingRequestId && action && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={closeProcessModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {action === "approve" ? "Approve" : "Reject"} DMCA Request
                    </h2>
                    <button
                      onClick={closeProcessModal}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProcess} className="p-6 space-y-6">
                  <div
                    className={`p-4 rounded-lg border ${
                      action === "approve"
                        ? "bg-green-900/20 border-green-700/50"
                        : "bg-red-900/20 border-red-700/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          action === "approve" ? "text-green-400" : "text-red-400"
                        }`}
                      />
                      <div>
                        <h3
                          className={`font-semibold mb-1 ${
                            action === "approve" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {action === "approve"
                            ? "Content will be removed"
                            : "Request will be rejected"}
                        </h3>
                        <p className="text-sm text-slate-300">
                          {action === "approve"
                            ? "Approving this request will remove the content from the platform and notify the complainant."
                            : "Rejecting this request will keep the content online and notify the complainant of the decision."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Add notes about your decision..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={closeProcessModal}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className={`px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        action === "approve"
                          ? "bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
                          : "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                      }`}
                    >
                      {approveMutation.isPending || rejectMutation.isPending
                        ? "Processing..."
                        : action === "approve"
                          ? "Approve & Remove Content"
                          : "Reject Request"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
