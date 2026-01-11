/**
 * useUsageLimits.js
 * React hooks for usage limit checking and enforcement
 * 
 * Phase 4 - Task 4.3 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenantScope } from './useTenantScope';
import { 
  UsageMeteringService, 
  PLAN_LIMITS,
  checkLimit as checkLimitFn,
  hasFeature as hasFeatureFn,
  getUsageSummary,
  incrementUsage,
  decrementUsage
} from '@/components/services/UsageMeteringService';

// ========== QUERY KEYS ==========

export const USAGE_QUERY_KEYS = {
  summary: (tenantId) => ['usage-summary', tenantId],
  limit: (tenantId, resource) => ['usage-limit', tenantId, resource]
};

// ========== MAIN HOOKS ==========

/**
 * Hook to get full usage summary
 */
export function useUsageSummary(options = {}) {
  const { tenantId, tenant } = useTenantScope();
  
  return useQuery({
    queryKey: USAGE_QUERY_KEYS.summary(tenantId),
    queryFn: () => getUsageSummary(tenantId),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook to check a specific resource limit
 */
export function useResourceLimit(resource) {
  const { tenant } = useTenantScope();
  
  return useMemo(() => {
    if (!tenant) {
      return {
        canCreate: false,
        usage: 0,
        limit: 0,
        percentage: 0,
        remaining: 0,
        isNearLimit: false,
        isAtLimit: true,
        isUnlimited: false,
        isLoading: true
      };
    }
    
    const check = checkLimitFn(tenant, resource, 1);
    
    return {
      canCreate: check.canProceed,
      usage: check.usage,
      limit: check.limit,
      percentage: check.percentage,
      remaining: check.remaining,
      isNearLimit: check.isNearLimit,
      isAtLimit: check.isAtLimit,
      isUnlimited: check.isUnlimited,
      isLoading: false
    };
  }, [tenant, resource]);
}

/**
 * Hook to check if feature is available
 */
export function useFeatureAccess(featureName) {
  const { tenant } = useTenantScope();
  
  return useMemo(() => {
    if (!tenant) return { hasAccess: false, isLoading: true };
    
    return {
      hasAccess: hasFeatureFn(tenant, featureName),
      isLoading: false,
      planName: tenant.subscription_plan || 'free'
    };
  }, [tenant, featureName]);
}

/**
 * Hook to increment usage
 */
export function useIncrementUsage() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantScope();
  
  return useMutation({
    mutationFn: async ({ resource, amount = 1 }) => {
      return await incrementUsage(tenantId, resource, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEYS.summary(tenantId) });
    }
  });
}

/**
 * Hook to decrement usage
 */
export function useDecrementUsage() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantScope();
  
  return useMutation({
    mutationFn: async ({ resource, amount = 1 }) => {
      return await decrementUsage(tenantId, resource, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEYS.summary(tenantId) });
    }
  });
}

// ========== SPECIFIC RESOURCE HOOKS ==========

/**
 * Hook for product limit
 */
export function useProductLimit() {
  return useResourceLimit('products');
}

/**
 * Hook for order limit (monthly)
 */
export function useOrderLimit() {
  return useResourceLimit('orders_per_month');
}

/**
 * Hook for customer limit
 */
export function useCustomerLimit() {
  return useResourceLimit('customers');
}

/**
 * Hook for storage limit
 */
export function useStorageLimit() {
  return useResourceLimit('storage_mb');
}

/**
 * Hook for user limit
 */
export function useUserLimit() {
  return useResourceLimit('users');
}

// ========== COMBINED ADMIN HOOK ==========

/**
 * Combined hook for admin usage management
 */
export function useUsageManagement() {
  const { tenantId, tenant } = useTenantScope();
  const summaryQuery = useUsageSummary();
  const incrementMutation = useIncrementUsage();
  const decrementMutation = useDecrementUsage();
  
  const productLimit = useProductLimit();
  const orderLimit = useOrderLimit();
  const customerLimit = useCustomerLimit();
  
  // Get upgrade suggestion
  const upgradeSuggestion = useMemo(() => {
    if (!tenant) return null;
    return UsageMeteringService.getUpgradeSuggestion(tenant);
  }, [tenant]);
  
  // Check if any resource is near limit
  const hasWarnings = useMemo(() => {
    return productLimit.isNearLimit || orderLimit.isNearLimit || customerLimit.isNearLimit;
  }, [productLimit, orderLimit, customerLimit]);
  
  // Check if any resource is at limit
  const hasBlocks = useMemo(() => {
    return productLimit.isAtLimit || orderLimit.isAtLimit || customerLimit.isAtLimit;
  }, [productLimit, orderLimit, customerLimit]);
  
  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    
    // Individual limits
    limits: {
      products: productLimit,
      orders: orderLimit,
      customers: customerLimit
    },
    
    // Status flags
    hasWarnings,
    hasBlocks,
    
    // Actions
    incrementUsage: incrementMutation.mutateAsync,
    decrementUsage: decrementMutation.mutateAsync,
    
    // Upgrade info
    upgradeSuggestion,
    currentPlan: tenant?.subscription_plan || 'free',
    planLimits: PLAN_LIMITS[tenant?.subscription_plan || 'free'],
    
    refetch: summaryQuery.refetch
  };
}

// ========== ENFORCEMENT HELPERS ==========

/**
 * Helper to enforce limit before action
 * Returns a function that wraps the action with limit check
 */
export function useEnforcedAction(resource, action) {
  const limit = useResourceLimit(resource);
  
  return useCallback(async (...args) => {
    if (!limit.canCreate) {
      throw new Error(`Đã đạt giới hạn ${resource}. Vui lòng nâng cấp gói để tiếp tục.`);
    }
    return await action(...args);
  }, [limit.canCreate, resource, action]);
}

/**
 * Hook to check before creating product
 */
export function useCanCreateProduct() {
  const { canCreate, isNearLimit, remaining } = useProductLimit();
  
  return {
    canCreate,
    isNearLimit,
    remaining,
    errorMessage: !canCreate ? 'Đã đạt giới hạn sản phẩm. Vui lòng nâng cấp gói.' : null,
    warningMessage: isNearLimit ? `Còn ${remaining} sản phẩm có thể tạo.` : null
  };
}

/**
 * Hook to check before processing order
 */
export function useCanProcessOrder() {
  const { canCreate, isNearLimit, remaining } = useOrderLimit();
  
  return {
    canProcess: canCreate,
    isNearLimit,
    remaining,
    errorMessage: !canCreate ? 'Đã đạt giới hạn đơn hàng tháng này. Vui lòng nâng cấp gói.' : null,
    warningMessage: isNearLimit ? `Còn ${remaining} đơn hàng có thể xử lý trong tháng.` : null
  };
}

// ========== EXPORTS ==========

export { PLAN_LIMITS };