/**
 * =============================================================================
 * Subscriptions API Service
 * =============================================================================
 * Enhanced subscription management with Stripe integration
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  stripe_price_id: string;
  price_cents: number;
  currency: string;
  interval: 'month' | 'year';
  trial_days?: number;
  is_active: boolean;
  features: string[];
  description?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface UsageStats {
  subscription_id: string;
  billing_period_start: string;
  billing_period_end: string;
  total_watch_time_minutes: number;
  total_downloads: number;
  concurrent_streams_peak: number;
  device_count: number;
}

export interface SubscriptionPreview {
  plan_id: string;
  proration_amount: number;
  next_invoice_amount: number;
  next_invoice_date: string;
  immediate_charge: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionsService = {
  /**
   * Get all available subscription plans
   */
  async listPlans(): Promise<{ plans: Plan[] }> {
    return (await fetchJson<{ plans: Plan[] }>(`${API_BASE}/api/v1/subscriptions/plans`))!;
  },

  /**
   * Get current user's active subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      return (await fetchJson<Subscription>(`${API_BASE}/api/v1/subscriptions/me`)) || null;
    } catch (error: any) {
      if (error?.status === 404) {
        return null; // No active subscription
      }
      throw error;
    }
  },

  /**
   * Create new subscription (checkout)
   */
  async createSubscription(planId: string, paymentMethodId?: string): Promise<{
    subscription: Subscription;
    client_secret?: string;
  }> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        payment_method_id: paymentMethodId,
      }),
    });
  },

  /**
   * Update subscription (change plan)
   */
  async updateSubscription(planId: string, prorationBehavior?: 'create_prorations' | 'none'): Promise<Subscription> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me`, {
      method: 'PUT',
      body: JSON.stringify({
        plan_id: planId,
        proration_behavior: prorationBehavior || 'create_prorations',
      }),
    });
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(cancelAtPeriodEnd = true): Promise<Subscription> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me`, {
      method: 'DELETE',
      body: JSON.stringify({
        cancel_at_period_end: cancelAtPeriodEnd,
      }),
    });
  },

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(): Promise<Subscription> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * Preview subscription change
   */
  async previewSubscriptionChange(planId: string): Promise<SubscriptionPreview> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me/preview-change?plan_id=${planId}`);
  },

  /**
   * Get subscription invoices
   */
  async listInvoices(options?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{
    invoices: Invoice[];
    total_count: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.status) params.append('status', options.status);

    const query = params.toString() ? `?${params.toString()}` : '';

    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me/invoices${query}`);
  },

  /**
   * Get usage statistics for current billing period
   */
  async getUsageStats(): Promise<UsageStats> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/me/usage`);
  },

  /**
   * List payment methods
   */
  async listPaymentMethods(): Promise<{ payment_methods: PaymentMethod[] }> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/payment-methods`);
  },

  /**
   * Add new payment method
   */
  async addPaymentMethod(paymentMethodId: string, setAsDefault = false): Promise<PaymentMethod> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/payment-methods`, {
      method: 'POST',
      body: JSON.stringify({
        payment_method_id: paymentMethodId,
        set_as_default: setAsDefault,
      }),
    });
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/payment-methods/${paymentMethodId}/default`, {
      method: 'POST',
    });
  },

  /**
   * Remove payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Create Stripe setup intent for adding payment method
   */
  async createSetupIntent(): Promise<{ client_secret: string }> {
    return fetchJson<any>(`${API_BASE}/api/v1/subscriptions/setup-intent`, {
      method: 'POST',
    });
  },
};
