'use client';

/**
 * =============================================================================
 * Billing History Component
 * =============================================================================
 * Displays user's invoice history with pagination and download links.
 */

import * as React from 'react';
import { Receipt, Download, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string | null;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due: number;
  amount_paid: number;
  currency: string;
  description: string | null;
  plan_name: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  created_at: string | null;
  paid_at: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

interface BillingHistoryProps {
  className?: string;
}

export function BillingHistory({ className = '' }: BillingHistoryProps) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  const limit = 5;

  const fetchInvoices = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/subscriptions/invoices?limit=${limit}&offset=${page * limit}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to load invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices);
      setHasMore(data.has_more);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing history');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles: Record<Invoice['status'], string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      open: 'bg-yellow-500/20 text-yellow-400',
      paid: 'bg-green-500/20 text-green-400',
      void: 'bg-red-500/20 text-red-400',
      uncollectible: 'bg-red-500/20 text-red-400',
    };

    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 ${className}`}>
        {error}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className={`rounded-xl border border-gray-700 bg-gray-800 p-6 text-center ${className}`}>
        <Receipt className="mx-auto h-12 w-12 text-gray-500" />
        <p className="mt-4 text-gray-400">No billing history yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Your invoices will appear here after your first payment
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <Receipt className="h-5 w-5" />
          Billing History
        </h3>
        <span className="text-sm text-gray-400">
          {total} invoice{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Invoice List */}
      <div className="divide-y divide-gray-700">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between px-6 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-medium text-white">
                  {invoice.plan_name || 'Subscription Payment'}
                </p>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {invoice.invoice_number && `#${invoice.invoice_number} · `}
                {formatDate(invoice.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                    title="View Invoice"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(hasMore || page > 0) && (
        <div className="flex items-center justify-between border-t border-gray-700 px-6 py-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || isLoading}
            className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default BillingHistory;
