/**
 * SaaS Module - Usage Limits Hooks
 * 
 * React hooks for usage enforcement and limit checks.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useUsageLimits
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usageRepository, tenantRepository } from '../data';
import { 
  checkResourceLimit,
  hasFeature,
  getUpgradeSuggestion,
  calculateOverallUsage
} from '../domain/usageLimits';
import { RESOURCE_TYPES } from '../types';

// ========== QUERY KEYS ==========

export const USAGE_QUERY_KEYS = {
  all: ['usage'],
  summary: (tenantId) => ['usage', 'summary', tenantId],
  resource: (tenantId, resource) => ['usage', 'resource', tenantId, resource]
};

// ========== QUERY HOOKS ==========

/**
 * Get usage summary for tenant
 */
export function useUsageSummary(tenantId, options = {}) {
  return useQuery({
    queryKey: USAGE_QUERY_KEYS.summary(tenantId),
    queryFn: () => usageRepository.getUsageSummary(tenantId),
    enabled: !!tenantId,
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Check specific resource limit
 */
export function useResourceLimit(tenantId, resource, options = {}) {
  return useQuery({
    queryKey: USAGE_QUERY_KEYS.resource(tenantId, resource),
    queryFn: async () => {
      const tenant = await tenantRepository.getTenantById(tenantId);
      if (!tenant) throw new Error('Tenant not found');
      
      return checkResourceLimit(tenant, resource, 0);
    },
    enabled: !!tenantId && !!resource,
    staleTime: 30 * 1000,
    ...options
  });
}

// ========== SPECIFIC RESOURCE HOOKS ==========

/**
 * Check product limit
 */
export function useProductLimit(tenantId) {
  return useResourceLimit(tenantId, RESOURCE_TYPES.PRODUCTS);
}

/**
 * Check order limit
 */
export function useOrderLimit(tenantId) {
  return useResourceLimit(tenantId, RESOURCE_TYPES.ORDERS);
}

/**
 * Check customer limit
 */
export function useCustomerLimit(tenantId) {
  return useResourceLimit(tenantId, RESOURCE_TYPES.CUSTOMERS);
}

/**
 * Check if can create product
 */
export function useCanCreateProduct(tenantId) {
  const { data: limitCheck, isLoading } = useProductLimit(tenantId);
  
  return {
    canCreate: limitCheck?.canProceed ?? false,
    usage: limitCheck?.usage ?? 0,
    limit: limitCheck?.limit ?? 0,
    isNearLimit: limitCheck?.isNearLimit ?? false,
    isLoading
  };
}

/**
 * Check if can process order
 */
export function useCanProcessOrder(tenantId) {
  const { data: limitCheck, isLoading } = useOrderLimit(tenantId);
  
  return {
    canProcess: limitCheck?.canProceed ?? false,
    usage: limitCheck?.usage ?? 0,
    limit: limitCheck?.limit ?? 0,
    isNearLimit: limitCheck?.isNearLimit ?? false,
    isLoading
  };
}

// ========== MUTATION HOOKS ==========

/**
 * Increment usage mutation
 */
export function useIncrementUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, resource, amount }) => {
      return await usageRepository.incrementUsage(tenantId, resource, amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: USAGE_QUERY_KEYS.summary(variables.tenantId) 
      });
    }
  });
}

/**
 * Decrement usage mutation
 */
export function useDecrementUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, resource, amount }) => {
      return await usageRepository.decrementUsage(tenantId, resource, amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: USAGE_QUERY_KEYS.summary(variables.tenantId) 
      });
    }
  });
}

// ========== COMBINED HOOK ==========

/**
 * Combined usage management hook for admins
 */
export function useUsageManagement(tenantId) {
  const summaryQuery = useUsageSummary(tenantId);
  const incrementMutation = useIncrementUsage();
  const decrementMutation = useDecrementUsage();
  
  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    
    // Actions
    increment: incrementMutation.mutateAsync,
    decrement: decrementMutation.mutateAsync,
    
    // States
    isUpdating: incrementMutation.isPending || decrementMutation.isPending,
    
    refetch: () => summaryQuery.refetch()
  };
}