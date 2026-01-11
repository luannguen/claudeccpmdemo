/**
 * SaaS Module - Subscription Hooks
 * 
 * React hooks for subscription lifecycle management.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useSubscription
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionRepository, tenantRepository } from '../data';
import { 
  shouldRenewSubscription,
  shouldSuspendSubscription,
  isTrialExpired,
  getDaysRemainingInTrial,
  getDaysRemainingInPeriod,
  getSubscriptionHealth
} from '../domain/subscriptionRules';
import { calculateNextPeriodEnd } from '../domain/billingRules';

// ========== QUERY KEYS ==========

export const SUBSCRIPTION_QUERY_KEYS = {
  all: ['subscriptions'],
  detail: (id) => ['subscription', id],
  byTenant: (tenantId) => ['subscription', 'tenant', tenantId],
  expiring: () => ['subscriptions', 'expiring']
};

// ========== QUERY HOOKS ==========

/**
 * Get subscription by tenant
 */
export function useSubscriptionByTenant(tenantId, options = {}) {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.byTenant(tenantId),
    queryFn: () => subscriptionRepository.getSubscriptionByTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get subscription detail with enhanced data
 */
export function useSubscriptionDetail(subscriptionId, options = {}) {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.detail(subscriptionId),
    queryFn: async () => {
      const subscription = await subscriptionRepository.getSubscriptionById(subscriptionId);
      if (!subscription) return null;
      
      // Add computed fields using domain functions
      return {
        ...subscription,
        is_trial_expired: isTrialExpired(subscription),
        days_remaining_trial: getDaysRemainingInTrial(subscription),
        days_remaining_period: getDaysRemainingInPeriod(subscription)
      };
    },
    enabled: !!subscriptionId,
    ...options
  });
}

/**
 * Get expiring subscriptions
 */
export function useExpiringSubscriptions(daysThreshold = 7, options = {}) {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.expiring(),
    queryFn: async () => {
      const now = new Date();
      const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
      return await subscriptionRepository.getExpiringSubscriptions(threshold);
    },
    staleTime: 60 * 1000,
    ...options
  });
}

// ========== MUTATION HOOKS ==========

/**
 * Create subscription mutation
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriptionData) => {
      return await subscriptionRepository.createSubscription(subscriptionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    }
  });
}

/**
 * Renew subscription mutation
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriptionId) => {
      const subscription = await subscriptionRepository.getSubscriptionById(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      
      // Calculate next period end using domain
      const nextPeriodEnd = calculateNextPeriodEnd(
        subscription.current_period_end,
        subscription.billing_cycle
      );
      
      return await subscriptionRepository.renewSubscription(subscriptionId, nextPeriodEnd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    }
  });
}

/**
 * Suspend subscription mutation
 */
export function useSuspendSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, reason }) => {
      const subscription = await subscriptionRepository.suspendSubscription(subscriptionId, reason);
      
      // Update tenant status
      if (subscription.tenant_id) {
        await tenantRepository.suspendTenant(subscription.tenant_id, reason);
      }
      
      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });
}

/**
 * Cancel subscription mutation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriptionId) => {
      return await subscriptionRepository.cancelSubscription(subscriptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    }
  });
}