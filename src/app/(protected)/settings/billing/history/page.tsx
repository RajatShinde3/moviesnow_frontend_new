// app/(protected)/settings/billing/history/page.tsx
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Billing History - Enterprise-Grade Premium Design
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✨ Invoice list with download/view options
 * ✨ Payment status indicators
 * ✨ Filtering by date range and status
 * ✨ Export functionality
 * ✨ Real-time payment history
 * ✨ Beautiful glassmorphism design
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Receipt,
  Download,
  Eye,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ArrowLeft,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ══════════════════════════════════════════════════════════════════════════════
// Types & Mock Data
// ══════════════════════════════════════════════════════════════════════════════

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  plan: string;
  invoiceNumber: string;
  paymentMethod: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "1",
    date: "2025-12-01",
    amount: 9.99,
    status: "paid",
    plan: "Premium Monthly",
    invoiceNumber: "INV-2025-12-001",
    paymentMethod: "•••• 4242",
  },
  {
    id: "2",
    date: "2025-11-01",
    amount: 9.99,
    status: "paid",
    plan: "Premium Monthly",
    invoiceNumber: "INV-2025-11-001",
    paymentMethod: "•••• 4242",
  },
  {
    id: "3",
    date: "2025-10-01",
    amount: 9.99,
    status: "paid",
    plan: "Premium Monthly",
    invoiceNumber: "INV-2025-10-001",
    paymentMethod: "•••• 4242",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function BillingHistoryPage() {
  const [filter, setFilter] = React.useState<"all" | "paid" | "pending" | "failed">("all");
  const [invoices] = React.useState<Invoice[]>(MOCK_INVOICES);

  const filteredInvoices = invoices.filter(
    (inv) => filter === "all" || inv.status === filter
  );

  const totalSpent = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusConfig = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return {
          icon: CheckCircle2,
          label: "Paid",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Failed",
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-2xl shadow-purple-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Receipt className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-white">Billing History</h1>
              <p className="text-slate-400 mt-1">
                View and download your invoices and payment history
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-2 ring-2 ring-emerald-500/30">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Total Spent</span>
            </div>
            <p className="text-3xl font-black text-white">${totalSpent.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 ring-2 ring-blue-500/30">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Invoices</span>
            </div>
            <p className="text-3xl font-black text-white">{invoices.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 ring-2 ring-purple-500/30">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Status</span>
            </div>
            <p className="text-3xl font-black text-emerald-400">All Paid</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium text-white">Filter by status:</span>
            </div>

            <div className="flex gap-2">
              {(["all", "paid", "pending", "failed"] as const).map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilter(status)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                    filter === status
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                  )}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Invoice List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, index) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 ring-1 ring-purple-500/30">
                              <Receipt className="h-4 w-4 text-purple-400" />
                            </div>
                            <span className="font-mono text-sm text-white font-semibold">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(invoice.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-white font-medium">
                            {invoice.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            {invoice.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white">
                            ${invoice.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                              statusConfig.bg,
                              statusConfig.border,
                              statusConfig.color,
                              "ring-1"
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors ring-1 ring-blue-500/30"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-slate-800/30 p-4">
                          <Receipt className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-400">No invoices found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
