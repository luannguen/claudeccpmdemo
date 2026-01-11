/**
 * useCommission.js
 * React hooks for commission management
 * 
 * Phase 1 - Task 1.4 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  CommissionService, 
  COMMISSION_STATUS 
} from '@/components/services/CommissionService';

// ========== QUERY KEYS ==========

export const COMMISSION_QUERY_KEYS = {
  all: ['commissions'],
  list: (filters) => ['commissions', 'list', filters],
  detail: (id) => ['commissions', 'detail', id],
  byShop: (shopId, period) => ['commissions', 'shop', shopId, period],
  summary: (shopId, period) => ['commissions', 'summary', shopId, period],
  analytics: (period) => ['commissions', 'analytics', period]
};

// ========== HOOKS ==========

/**
 * Hook để lấy danh sách commissions với filters
 */
export function useCommissionList(filters = {}, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.list(filters),
    queryFn: () => CommissionService.listCommissions(filters),
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Hook để lấy commission detail
 */
export function useCommissionDetail(commissionId, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.detail(commissionId),
    queryFn: async () => {
      const commissions = await base44.entities.Commission.filter({ id: commissionId });
      return commissions[0] || null;
    },
    enabled: !!commissionId,
    ...options
  });
}

/**
 * Hook để lấy commissions theo shop
 */
export function useShopCommissions(shopId, periodMonth = null, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.byShop(shopId, periodMonth),
    queryFn: () => CommissionService.getCommissionsByShop(shopId, periodMonth),
    enabled: !!shopId,
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Hook để lấy commission summary theo shop và period
 */
export function useCommissionSummary(shopId, periodMonth, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.summary(shopId, periodMonth),
    queryFn: () => CommissionService.getCommissionSummary(shopId, periodMonth),
    enabled: !!shopId && !!periodMonth,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook để lấy platform analytics
 */
export function usePlatformCommissionAnalytics(periodMonth = null, options = {}) {
  return useQuery({
    queryKey: COMMISSION_QUERY_KEYS.analytics(periodMonth),
    queryFn: () => CommissionService.getPlatformCommissionAnalytics(periodMonth),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook để process commission cho 1 order
 */
export function useProcessOrderCommission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId) => {
      // Call backend function
      const response = await base44.functions.invoke('calculateOrderCommission', {
        order_id: orderId
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Hook để approve commission
 */
export function useApproveCommission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionId, approvedBy }) => {
      return await CommissionService.approveCommission(commissionId, approvedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Hook để bulk approve commissions
 */
export function useBulkApproveCommissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionIds, approvedBy }) => {
      return await CommissionService.bulkApproveCommissions(commissionIds, approvedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Hook để mark commission as paid
 */
export function useMarkCommissionPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commissionId, paymentInfo }) => {
      return await CommissionService.markCommissionPaid(commissionId, paymentInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
    }
  });
}

/**
 * Hook tổng hợp cho admin quản lý commissions
 */
export function useAdminCommissions(filters = {}) {
  const queryClient = useQueryClient();
  
  const listQuery = useCommissionList(filters);
  const analyticsQuery = usePlatformCommissionAnalytics(filters.period_month);
  
  const processCommission = useProcessOrderCommission();
  const approveCommission = useApproveCommission();
  const bulkApprove = useBulkApproveCommissions();
  const markPaid = useMarkCommissionPaid();
  
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: COMMISSION_QUERY_KEYS.all });
  };
  
  return {
    // Data
    commissions: listQuery.data || [],
    analytics: analyticsQuery.data,
    isLoading: listQuery.isLoading || analyticsQuery.isLoading,
    error: listQuery.error || analyticsQuery.error,
    
    // Actions
    processCommission: processCommission.mutateAsync,
    approveCommission: approveCommission.mutateAsync,
    bulkApprove: bulkApprove.mutateAsync,
    markPaid: markPaid.mutateAsync,
    refetch,
    
    // Mutation states
    isProcessing: processCommission.isPending,
    isApproving: approveCommission.isPending || bulkApprove.isPending,
    isMarkingPaid: markPaid.isPending
  };
}

/**
 * Hook cho shop owner xem commission của shop mình
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

// ========== EXPORTS ==========

export { COMMISSION_STATUS };