/**
 * =============================================================================
 * useSubscriptions Hooks
 * =============================================================================
 * React Query hooks for subscription management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService, Subscription } from '../services/subscriptions';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  invoices: () => [...subscriptionKeys.all, 'invoices'] as const,
  invoicesList: (filters?: any) => [...subscriptionKeys.invoices(), filters] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
  paymentMethods: () => [...subscriptionKeys.all, 'payment-methods'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch all subscription plans
 */
export function usePlans(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionsService.listPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch current subscription
 */
export function useCurrentSubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionsService.getCurrentSubscription(),
    staleTime: 60 * 1000, // 1 minute
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to create new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, paymentMethodId }: { planId: string; paymentMethodId?: string }) =>
      subscriptionsService.createSubscription(planId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      toast.success('Subscription created successfully!', {
        description: 'Welcome to premium! Enjoy ad-free streaming.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create subscription', {
        description: error?.message || 'Please check your payment method and try again',
      });
    },
  });
}

/**
 * Hook to update subscription (change plan)
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, prorationBehavior }: {
      planId: string;
      prorationBehavior?: 'create_prorations' | 'none';
    }) => subscriptionsService.updateSubscription(planId, prorationBehavior),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.invoices() });
      toast.success('Subscription updated successfully!', {
        description: 'Your plan has been changed.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update subscription', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, boolean>({
    mutationFn: (cancelAtPeriodEnd = true) =>
      subscriptionsService.cancelSubscription(cancelAtPeriodEnd),
    onSuccess: (_, cancelAtPeriodEnd) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      if (cancelAtPeriodEnd) {
        toast.success('Subscription will be canceled', {
          description: "You'll have access until the end of your billing period",
        });
      } else {
        toast.success('Subscription canceled immediately', {
          description: 'Your premium access has ended',
        });
      }
    },
    onError: (error: any) => {
      toast.error('Failed to cancel subscription', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to reactivate canceled subscription
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsService.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      toast.success('Subscription reactivated!', {
        description: 'Welcome back! Your premium access is restored.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to reactivate subscription', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to preview subscription change
 */
export function usePreviewSubscriptionChange() {
  return useMutation({
    mutationFn: (planId: string) => subscriptionsService.previewSubscriptionChange(planId),
    onError: (error: any) => {
      toast.error('Failed to preview change', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to fetch invoices
 */
export function useInvoices(options?: {
  page?: number;
  per_page?: number;
  status?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: subscriptionKeys.invoicesList(options),
    queryFn: () => subscriptionsService.listInvoices(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch usage statistics
 */
export function useUsageStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: () => subscriptionsService.getUsageStats(),
    staleTime: 60 * 1000, // 1 minute
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch payment methods
 */
export function usePaymentMethods(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.paymentMethods(),
    queryFn: () => subscriptionsService.listPaymentMethods(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to add payment method
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentMethodId, setAsDefault }: {
      paymentMethodId: string;
      setAsDefault?: boolean;
    }) => subscriptionsService.addPaymentMethod(paymentMethodId, setAsDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() });
      toast.success('Payment method added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add payment method', {
        description: error?.message || 'Please check your card details and try again',
      });
    },
  });
}

/**
 * Hook to set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      subscriptionsService.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() });
      toast.success('Default payment method updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update default payment method', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to remove payment method
 */
export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      subscriptionsService.removePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() });
      toast.success('Payment method removed');
    },
    onError: (error: any) => {
      toast.error('Failed to remove payment method', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to create setup intent for adding payment method
 */
export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: () => subscriptionsService.createSetupIntent(),
    onError: (error: any) => {
      toast.error('Failed to initialize payment setup', {
        description: error?.message || 'Please try again',
      });
    },
  });
}
