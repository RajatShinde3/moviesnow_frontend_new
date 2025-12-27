/**
 * =============================================================================
 * PaymentMethodsManager Component
 * =============================================================================
 * Manage payment methods with Stripe integration
 */

'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, Shield } from 'lucide-react';
import {
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useRemovePaymentMethod,
} from '@/lib/api/hooks/useSubscriptions';
import { PaymentMethod } from '@/lib/api/services/subscriptions';

interface PaymentMethodsManagerProps {
  onAddPaymentMethod?: () => void;
}

export default function PaymentMethodsManager({ onAddPaymentMethod }: PaymentMethodsManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = usePaymentMethods();
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const removeMutation = useRemovePaymentMethod();

  const paymentMethods = data?.payment_methods || [];

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setDeletingId(id);
      removeMutation.mutate(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'from-blue-500 to-blue-600';
      case 'mastercard':
        return 'from-red-500 to-orange-500';
      case 'amex':
        return 'from-blue-400 to-blue-500';
      case 'discover':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (isLoading) {
    return <PaymentMethodsSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Payment Methods</h3>
            <p className="text-sm text-gray-400">
              {paymentMethods.length} {paymentMethods.length === 1 ? 'card' : 'cards'} on file
            </p>
          </div>
        </div>

        <button
          onClick={onAddPaymentMethod}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="p-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 text-center">
          <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No payment methods added yet</p>
          <button
            onClick={onAddPaymentMethod}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Add Your First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={() => handleSetDefault(method.id)}
              onRemove={() => handleRemove(method.id)}
              isDeleting={deletingId === method.id}
              isSettingDefault={setDefaultMutation.isPending}
              getCardBrandIcon={getCardBrandIcon}
              getCardBrandColor={getCardBrandColor}
            />
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30">
        <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-400 font-medium mb-1">Secure Payment Processing</p>
          <p className="text-gray-400">
            All payment information is encrypted and securely processed by Stripe. We never store your full card details.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: () => void;
  onRemove: () => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
  getCardBrandIcon: (brand: string) => string;
  getCardBrandColor: (brand: string) => string;
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
  isDeleting,
  isSettingDefault,
  getCardBrandIcon,
  getCardBrandColor,
}: PaymentMethodCardProps) {
  const card = method.card;

  if (!card) return null;

  const isExpired = new Date(`${card.exp_year}-${card.exp_month}-01`) < new Date();

  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all ${
      method.is_default
        ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500'
        : isExpired
        ? 'bg-red-500/5 border-red-500/30'
        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
    }`}>
      {/* Default Badge */}
      {method.is_default && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Check className="h-3 w-3" />
          DEFAULT
        </div>
      )}

      {/* Expired Badge */}
      {isExpired && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
          EXPIRED
        </div>
      )}

      {/* Card Visual */}
      <div className={`h-32 bg-gradient-to-br ${getCardBrandColor(card.brand)} rounded-lg p-4 mb-4 relative overflow-hidden`}>
        {/* Card Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Card Content */}
        <div className="relative h-full flex flex-col justify-between">
          <div className="text-3xl">{getCardBrandIcon(card.brand)}</div>
          <div>
            <p className="text-white text-xl font-mono tracking-wider">
              •••• •••• •••• {card.last4}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/80 text-sm uppercase font-semibold">
                {card.brand}
              </span>
              <span className="text-white/80 text-sm font-mono">
                {String(card.exp_month).padStart(2, '0')}/{String(card.exp_year).slice(-2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!method.is_default && (
          <button
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors border border-blue-500/30 disabled:opacity-50"
          >
            {isSettingDefault ? 'Setting...' : 'Set as Default'}
          </button>
        )}

        <button
          onClick={onRemove}
          disabled={isDeleting || method.is_default}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          title={method.is_default ? 'Cannot remove default payment method' : 'Remove card'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {method.is_default && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Remove default status by setting another card as default
        </p>
      )}
    </div>
  );
}

function PaymentMethodsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-800 rounded-lg" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-800 rounded" />
            <div className="h-4 w-24 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-10 w-28 bg-gray-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-gray-800 rounded-xl">
            <div className="h-32 bg-gray-700 rounded-lg mb-4" />
            <div className="h-10 bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
