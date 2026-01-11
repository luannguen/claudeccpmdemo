/**
 * SaaS Module - Commission Hooks
 * 
 * React hooks for commission management.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useCommission
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { commissionRepository, tenantRepository } from '../data';
import { 
  calculateOrderCommission,
  getEffectiveCommissionRate,
  calculateCommissionByStatus,
  groupCommissionsByShop,
  canApproveCommission,
  canMarkCommissionPaid
} from '../domain/commissionCalculator';
import { COMMISSION_STATUS } from '../types';

// ========== QUERY KEYS ==========

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions'],
  list: (filters) => ['commissions', 'list', filters],
  detail: (id) => ['commission', id],
  byShop: (shopId, period) => ['commissions', 'shop', shopId, period],
  summary: (shopId, period) => ['commissions', 'summary', shopId, period],
  analytics: (period) => ['commissions', 'analytics', period]
};

// ========== QUERY HOOKS ==========

/**
 * Get commission list with filters
 */
export function useCommissionList(filters = {}, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.list(filters),
    queryFn: () => commissionRepository.listCommissions(filters),
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Get shop commissions
 */
export function useShopCommissions(shopId, periodMonth = null, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.byShop(shopId, periodMonth),
    queryFn: () => commissionRepository.getCommissionsByShop(shopId, periodMonth),
    enabled: !!shopId,
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Get commission summary for shop
 */
export function useCommissionSummary(shopId, periodMonth, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.summary(shopId, periodMonth),
    queryFn: async () => {
      const commissions = await commissionRepository.getCommissionsByShop(shopId, periodMonth);
      const statusBreakdown = calculateCommissionByStatus(commissions);
      
      return {
        period: periodMonth,
        shop_id: shopId,
        total_orders: commissions.length,
        total_order_amount: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
        ...statusBreakdown
      };
    },
    enabled: !!shopId && !!periodMonth,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get platform commission analytics
 */
export function usePlatformCommissionAnalytics(periodMonth = null, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.analytics(periodMonth),
    queryFn: async () => {
      const filter = periodMonth ? { period_month: periodMonth } : {};
      const commissions = await commissionRepository.listCommissions(filter, 1000);
      
      // Group by shop using domain function
      const byShop = groupCommissionsByShop(commissions);
      const shopsList = Object.values(byShop).sort((a, b) => b.total_commission - a.total_commission);
      
      // Calculate totals using domain functions
      const statusBreakdown = calculateCommissionByStatus(commissions);
      
      return {
        period: periodMonth || 'all',
        total_commissions: commissions.length,
        total_revenue: commissions.reduce((sum, c) => sum + (c.order_amount || 0), 0),
        total_commission_amount: statusBreakdown.total,
        total_pending: statusBreakdown.pending,
        total_approved: statusBreakdown.approved,
        total_paid: statusBreakdown.paid,
        shops_count: shopsList.length,
        by_shop: shopsList
      };
    },
    staleTime: 60 * 1000,
    ...options
  });
}

// ========== MUTATION HOOKS ==========

/**
 * Process commission for order
 */
export function useProcessOrderCommission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await base44.functions.invoke('calculateOrderCommission', {
        order_id: orderId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Approve commission
 */
export function useApproveCommission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionId, approvedBy }) => {
      const commission = await commissionRepository.getCommissionById(commissionId);
      
      // Validate using domain
      if (!canApproveCommission(commission)) {
        throw new Error('Commission cannot be approved in current status');
      }
      
      return await commissionRepository.approveCommission(commissionId, approvedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Bulk approve commissions
 */
export function useBulkApproveCommissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionIds, approvedBy }) => {
      return await commissionRepository.bulkApproveCommissions(commissionIds, approvedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Mark commission as paid
 */
export function useMarkCommissionPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionId, paymentInfo }) => {
      const commission = await commissionRepository.getCommissionById(commissionId);
      
      // Validate using domain
      if (!canMarkCommissionPaid(commission)) {
        throw new Error('Commission must be approved before marking as paid');
      }
      
      return await commissionRepository.markCommissionPaid(commissionId, paymentInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

// ========== COMBINED HOOKS ==========

/**
 * Combined admin commissions hook
 */
export function useAdminCommissions(filters = {}) {
  const listQuery = useCommissionList(filters);
  const analyticsQuery = usePlatformCommissionAnalytics(filters.period_month);
  
  const processCommission = useProcessOrderCommission();
  const approveCommission = useApproveCommission();
  const bulkApprove = useBulkApproveCommissions();
  const markPaid = useMarkCommissionPaid();
  
  const queryClient = useQueryClient();
  
  return {
    commissions: listQuery.data || [],
    analytics: analyticsQuery.data,
    isLoading: listQuery.isLoading || analyticsQuery.isLoading,
    error: listQuery.error || analyticsQuery.error,
    
    // Actions
    processCommission: processCommission.mutateAsync,
    approveCommission: approveCommission.mutateAsync,
    bulkApprove: bulkApprove.mutateAsync,
    markPaid: markPaid.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all }),
    
    // States
    isProcessing: processCommission.isPending,
    isApproving: approveCommission.isPending || bulkApprove.isPending,
    isMarkingPaid: markPaid.isPending
  };
}

/**
 * Combined shop commissions hook
 */
export function useMyShopCommissions(shopId, periodMonth = null) {
  const commissionsQuery = useShopCommissions(shopId, periodMonth);
  const summaryQuery = useCommissionSummary(shopId, periodMonth);
  
  return {
    commissions: commissionsQuery.data || [],
    summary: summaryQuery.data,
    isLoading: commissionsQuery.isLoading || summaryQuery.isLoading,
    error: commissionsQuery.error || summaryQuery.error,
    refetch: () => {
      commissionsQuery.refetch();
      summaryQuery.refetch();
    }
  };
}