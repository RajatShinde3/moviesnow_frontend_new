// components/billing/BillingManagement.tsx
/**
 * =============================================================================
 * Billing Management Component
 * =============================================================================
 * Best Practices:
 * - Clear subscription status
 * - Easy plan management
 * - Payment method security
 * - Invoice accessibility
 * - Cancellation flow with retention
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  CreditCard,
  Download,
  Calendar,
  AlertCircle,
  Check,
  Edit,
  Trash2,
  Plus,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface Subscription {
  id: string;
  plan_name: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  amount: number;
  interval: "month" | "year";
}

interface PaymentMethod {
  id: string;
  type: "card";
  card_brand: string;
  card_last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  created_at: string;
  invoice_pdf?: string;
  period_start: string;
  period_end: string;
}

/**
 * Main Billing Management Component
 */
export function BillingManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  // Fetch subscription
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/v1/subscriptions/current", {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: pmLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await fetch("/api/v1/subscriptions/payment-methods", {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch("/api/v1/subscriptions/invoices", {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/subscriptions/cancel", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to cancel subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setShowCancelModal(false);
    },
  });

  const statusColors = {
    active: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
    past_due: "bg-yellow-500/20 text-yellow-400",
    trialing: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-gray-400">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        {/* Current Subscription */}
        <div className="mb-8 rounded-lg bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Current Plan</h2>

          {subLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-gray-800" />
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">
                      {subscription.plan_name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize",
                        statusColors[subscription.status]
                      )}
                    >
                      {subscription.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-400">
                    ${subscription.amount.toFixed(2)} / {subscription.interval}
                  </p>
                </div>

                <button
                  onClick={() => router.push("/subscribe")}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <TrendingUp className="h-5 w-5" />
                  Change Plan
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-4">
                  <Calendar className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Current Period</p>
                    <p className="font-medium text-white">
                      {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-4">
                  <DollarSign className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Next Payment</p>
                    <p className="font-medium text-white">
                      ${subscription.amount.toFixed(2)} on{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-500">
                      Subscription Ending
                    </p>
                    <p className="text-sm text-yellow-400">
                      Your subscription will end on{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}.
                      You can reactivate anytime before this date.
                    </p>
                  </div>
                </div>
              )}

              {!subscription.cancel_at_period_end && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-gray-400">You don't have an active subscription</p>
              <button
                onClick={() => router.push("/subscribe")}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                View Plans
              </button>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-8 rounded-lg bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
            <button className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700">
              <Plus className="h-5 w-5" />
              Add Card
            </button>
          </div>

          {pmLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-gray-800" />
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((pm: PaymentMethod) => (
                <PaymentMethodCard key={pm.id} paymentMethod={pm} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-800 p-6 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-2 text-gray-400">No payment methods added</p>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="rounded-lg bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Billing History</h2>

          {invoicesLoading ? (
            <div className="h-48 animate-pulse rounded-lg bg-gray-800" />
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">
                      Date
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">
                      Description
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-400">
                      Status
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-400">
                      Amount
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-400">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {invoices.map((invoice: Invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-800 p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-2 text-gray-400">No billing history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelModal
          onConfirm={() => cancelMutation.mutate()}
          onClose={() => setShowCancelModal(false)}
          isLoading={cancelMutation.isPending}
        />
      )}
    </div>
  );
}

/**
 * Payment Method Card Component
 */
function PaymentMethodCard({ paymentMethod }: { paymentMethod: PaymentMethod }) {
  const brandLogos: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-700 text-2xl">
          {brandLogos[paymentMethod.card_brand.toLowerCase()] || "💳"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium capitalize text-white">
              {paymentMethod.card_brand}
            </p>
            {paymentMethod.is_default && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            •••• {paymentMethod.card_last4} • Expires{" "}
            {paymentMethod.exp_month}/{paymentMethod.exp_year}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {!paymentMethod.is_default && (
          <button className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
            <Check className="h-5 w-5" />
          </button>
        )}
        <button className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Invoice Row Component
 */
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const statusColors = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <tr className="transition-colors hover:bg-gray-800/50">
      <td className="p-4 text-white">
        {new Date(invoice.created_at).toLocaleDateString()}
      </td>
      <td className="p-4 text-gray-300">
        Subscription Payment -{" "}
        {new Date(invoice.period_start).toLocaleDateString()} to{" "}
        {new Date(invoice.period_end).toLocaleDateString()}
      </td>
      <td className="p-4">
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            statusColors[invoice.status]
          )}
        >
          {invoice.status}
        </span>
      </td>
      <td className="p-4 text-right font-medium text-white">
        ${invoice.amount.toFixed(2)}
      </td>
      <td className="p-4 text-right">
        {invoice.invoice_pdf && (
          <a
            href={invoice.invoice_pdf}
            download
            className="inline-flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">PDF</span>
          </a>
        )}
      </td>
    </tr>
  );
}

/**
 * Cancel Confirmation Modal
 */
function CancelModal({
  onConfirm,
  onClose,
  isLoading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Cancel Subscription?
        </h3>
        <p className="mb-6 text-gray-400">
          Your subscription will remain active until the end of your current billing
          period. You can reactivate anytime.
        </p>

        <div className="mb-6 rounded-lg bg-blue-500/10 p-4">
          <p className="text-sm text-blue-400">
            💡 Consider downgrading to a lower plan instead of canceling to keep access
            to your watchlist and preferences.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-gray-800 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Canceling..." : "Cancel Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
