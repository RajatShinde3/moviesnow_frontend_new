/**
 * =============================================================================
 * SubscriptionManager Component
 * =============================================================================
 * Complete subscription management with plan changes, invoices, and usage stats
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  CreditCard,
  FileText,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Download,
  RefreshCw,
  Crown,
} from 'lucide-react';
import {
  useCurrentSubscription,
  usePlans,
  useInvoices,
  useUsageStats,
  useCancelSubscription,
  useReactivateSubscription,
  useUpdateSubscription,
  usePreviewSubscriptionChange,
} from '@/lib/api/hooks/useSubscriptions';
import { Plan } from '@/lib/api/services/subscriptions';

export default function SubscriptionManager() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');

  const { data: subscription, isLoading: subLoading } = useCurrentSubscription();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    page: 1,
    per_page: 10,
    status: invoiceFilter === 'all' ? undefined : invoiceFilter,
  });
  const { data: usageStats } = useUsageStats({ enabled: !!subscription });

  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();
  const updateMutation = useUpdateSubscription();
  const previewMutation = usePreviewSubscriptionChange();

  const plans = plansData?.plans || [];
  const invoices = invoicesData?.invoices || [];

  const handlePlanChange = async (planId: string) => {
    if (!subscription) return;

    setSelectedPlanId(planId);

    // Preview the change first
    const preview = await previewMutation.mutateAsync(planId);

    if (window.confirm(
      `Change to this plan?\n\n` +
      `Immediate charge: $${(preview.immediate_charge / 100).toFixed(2)}\n` +
      `Next invoice: $${(preview.next_invoice_amount / 100).toFixed(2)} on ${format(new Date(preview.next_invoice_date), 'MMM d, yyyy')}`
    )) {
      updateMutation.mutate({ planId });
    }

    setSelectedPlanId(null);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will have access until the end of your billing period.')) {
      cancelMutation.mutate(true);
      setShowCancelDialog(false);
    }
  };

  const handleReactivate = () => {
    reactivateMutation.mutate();
  };

  if (subLoading || plansLoading) {
    return <SubscriptionManagerSkeleton />;
  }

  const hasActiveSubscription = subscription && ['active', 'trialing'].includes(subscription.status);

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {hasActiveSubscription ? 'Premium Member' : 'Free Account'}
              </h2>
              {subscription && (
                <div className="mt-2 space-y-1">
                  <p className="text-gray-400">
                    Plan: <span className="text-white font-semibold">{subscription.plan?.name || 'Unknown'}</span>
                  </p>
                  <p className="text-gray-400">
                    Status:{' '}
                    <span className={`font-semibold ${
                      subscription.status === 'active' ? 'text-green-400' :
                      subscription.status === 'trialing' ? 'text-blue-400' :
                      subscription.status === 'canceled' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </p>
                  {subscription.status === 'trialing' && subscription.trial_end && (
                    <p className="text-sm text-blue-400">
                      Trial ends {format(new Date(subscription.trial_end), 'MMM d, yyyy')}
                    </p>
                  )}
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 text-yellow-400 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Cancels on {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {subscription?.cancel_at_period_end ? (
              <button
                onClick={handleReactivate}
                disabled={reactivateMutation.isPending}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {reactivateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Reactivate
              </button>
            ) : hasActiveSubscription ? (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors border border-red-500/30"
              >
                Cancel Subscription
              </button>
            ) : (
              <a
                href="/subscribe"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>

        {/* Billing Period */}
        {subscription && !subscription.cancel_at_period_end && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Current billing period</span>
              </div>
              <span className="text-white font-medium">
                {format(new Date(subscription.current_period_start), 'MMM d')} -{' '}
                {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      {usageStats && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Usage This Month</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <UsageCard
              label="Watch Time"
              value={Math.floor(usageStats.total_watch_time_minutes / 60)}
              unit="hours"
              icon="⏱️"
            />
            <UsageCard
              label="Downloads"
              value={usageStats.total_downloads}
              unit="files"
              icon="📥"
            />
            <UsageCard
              label="Peak Streams"
              value={usageStats.concurrent_streams_peak}
              unit="concurrent"
              icon="📺"
            />
            <UsageCard
              label="Devices"
              value={usageStats.device_count}
              unit="active"
              icon="📱"
            />
          </div>
        </div>
      )}

      {/* Available Plans */}
      {hasActiveSubscription && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Change Plan</h3>

          <div className="grid grid-cols-3 gap-4">
            {plans.filter(p => p.is_active).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === subscription?.plan_id}
                isSelected={plan.id === selectedPlanId}
                onSelect={() => handlePlanChange(plan.id)}
                isLoading={updateMutation.isPending && selectedPlanId === plan.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Billing History</h3>
          </div>

          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="open">Open</option>
            <option value="void">Void</option>
          </select>
        </div>

        {invoicesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No invoices found</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    invoice.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {invoice.status === 'paid' ? <Check className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>

                  <div>
                    <p className="text-white font-medium">
                      ${(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    invoice.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>

                  {invoice.invoice_pdf && (
                    <a
                      href={invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Cancel Subscription?</h3>
            </div>

            <p className="text-gray-400 mb-6">
              Your premium access will continue until {subscription && format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}.
              After that, you'll lose access to premium features.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface UsageCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
}

function UsageCard({ label, value, unit, icon }: UsageCardProps) {
  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{unit}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isLoading: boolean;
}

function PlanCard({ plan, isCurrent, isSelected, onSelect, isLoading }: PlanCardProps) {
  return (
    <div className={`p-6 rounded-xl border-2 transition-all ${
      isCurrent
        ? 'bg-purple-500/10 border-purple-500'
        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
    }`}>
      <h4 className="text-lg font-bold text-white mb-2">{plan.name}</h4>
      <p className="text-3xl font-black text-white mb-1">
        ${(plan.price_cents / 100).toFixed(2)}
      </p>
      <p className="text-sm text-gray-400 mb-4">per {plan.interval}</p>

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-2 mb-4">
          {plan.features.slice(0, 3).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <Check className="h-4 w-4 text-green-400" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {isCurrent ? (
        <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-center font-medium">
          Current Plan
        </div>
      ) : (
        <button
          onClick={onSelect}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Changing...' : 'Switch to This Plan'}
        </button>
      )}
    </div>
  );
}

function SubscriptionManagerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-800 rounded-2xl" />
      <div className="h-32 bg-gray-800 rounded-xl" />
      <div className="h-64 bg-gray-800 rounded-xl" />
    </div>
  );
}
