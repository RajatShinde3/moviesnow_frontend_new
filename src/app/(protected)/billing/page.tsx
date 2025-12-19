'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface Subscription {
  is_premium: boolean;
  status: string;
  tier: string;
  plan_slug?: string;
  expires_at?: string;
  started_at?: string;
  cancelled_at?: string;
  can_upgrade: boolean;
  can_reactivate: boolean;
  has_used_trial: boolean;
}

interface PaymentMethod {
  has_payment_method: boolean;
  payment_method?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  plan_name: string;
  plan_slug: string;
  price: number;
  currency: string;
  interval: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  pdf_url?: string;
}

export default function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  // Fetch subscription status
  const { data: subscription, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/v1/subscriptions/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });

  // Fetch payment method
  const { data: paymentMethod } = useQuery<PaymentMethod>({
    queryKey: ['payment-method'],
    queryFn: async () => {
      const res = await fetch('/api/v1/subscriptions/payment-method', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch payment method');
      return res.json();
    },
    enabled: subscription?.is_premium,
  });

  // Fetch invoices
  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/v1/subscriptions/invoices', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
    enabled: subscription?.is_premium,
  });

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/subscriptions/cancel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to cancel');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      setShowCancelDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  // Reactivate subscription
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/subscriptions/reactivate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to reactivate');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Subscription reactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reactivate subscription');
    },
  });

  // Update payment method
  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/subscriptions/update-payment-method', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to open billing portal');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to open billing portal');
    },
  });

  if (subLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!subscription?.is_premium) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">No Active Subscription</h1>
          <p className="text-gray-400 mb-8">
            Subscribe to premium to access exclusive features
          </p>
          <button
            onClick={() => router.push('/subscribe')}
            className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            Cancelled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>

        {/* Current Subscription Card */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{paymentMethod?.plan_name || 'Premium'}</h2>
                {getStatusBadge(subscription.status)}
              </div>
              <p className="text-gray-400">
                ${paymentMethod?.price.toFixed(2)}/{paymentMethod?.interval || 'month'}
              </p>
            </div>
            {subscription.status === 'active' && (
              <button
                onClick={() => router.push('/subscribe')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Change Plan
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {subscription.started_at && (
              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Started</span>
                </div>
                <p className="font-medium">
                  {new Date(subscription.started_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {subscription.expires_at && (
              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {subscription.status === 'cancelled' ? 'Access Until' : 'Renews On'}
                  </span>
                </div>
                <p className="font-medium">
                  {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {subscription.can_reactivate && (
              <button
                onClick={() => reactivateMutation.mutate()}
                disabled={reactivateMutation.isPending}
                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {reactivateMutation.isPending ? 'Processing...' : 'Reactivate'}
              </button>
            )}
            {subscription.status === 'active' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="border border-red-500 text-red-500 hover:bg-red-500/10 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Payment Method Card */}
        {paymentMethod?.has_payment_method && (
          <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Payment Method</h3>
              <button
                onClick={() => updatePaymentMutation.mutate()}
                disabled={updatePaymentMutation.isPending}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {updatePaymentMutation.isPending ? 'Loading...' : 'Update'}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {paymentMethod.payment_method?.brand} •••• {paymentMethod.payment_method?.last4}
                </p>
                <p className="text-sm text-gray-400">
                  Expires {paymentMethod.payment_method?.exp_month}/{paymentMethod.payment_method?.exp_year}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        {invoices && invoices.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold mb-6">Billing History</h3>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        ${(invoice.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        invoice.status === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      )}
                    >
                      {invoice.status}
                    </span>
                    {invoice.pdf_url && (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Cancel Subscription?</h3>
            <p className="text-gray-400 mb-6">
              You'll keep access until {subscription.expires_at && new Date(subscription.expires_at).toLocaleDateString()}.
              Your payment method won't be charged again.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
