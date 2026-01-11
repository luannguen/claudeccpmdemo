/**
 * usePreOrderAdvanced - Advanced preorder hooks
 * Feature Logic Layer
 * 
 * Includes:
 * - Auto compensation
 * - Fraud detection
 * - Analytics
 * - Proof pack
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AutoCompensationEngine } from '@/components/services/AutoCompensationEngine';
import { FraudDetectionService } from '@/components/services/FraudDetectionService';
import { PreOrderAnalyticsService } from '@/components/services/PreOrderAnalyticsService';
import { OrderProofPackService } from '@/components/services/OrderProofPackService';

// ========== AUTO COMPENSATION ==========

/**
 * Hook for pending compensations (admin)
 */
export function usePendingCompensations() {
  return useQuery({
    queryKey: ['pending-compensations'],
    queryFn: async () => {
      return await AutoCompensationEngine.getPendingCompensations();
    }
  });
}

/**
 * Hook for compensation mutations
 */
export function useCompensationMutations() {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async ({ compensationId, approverEmail }) => {
      return await AutoCompensationEngine.approveCompensation(compensationId, approverEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ compensationId, approverEmail, reason }) => {
      return await AutoCompensationEngine.rejectCompensation(compensationId, approverEmail, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-compensations'] });
    }
  });

  return {
    approve: approveMutation,
    reject: rejectMutation
  };
}

// ========== FRAUD DETECTION ==========

/**
 * Hook to get customer risk profile
 */
export function useCustomerRiskProfile(customerEmail) {
  return useQuery({
    queryKey: ['risk-profile', customerEmail],
    queryFn: async () => {
      if (!customerEmail) return null;
      return await FraudDetectionService.getOrCreateRiskProfile(customerEmail);
    },
    enabled: !!customerEmail
  });
}

/**
 * Hook for high-risk customers (admin)
 */
export function useHighRiskCustomers() {
  return useQuery({
    queryKey: ['high-risk-customers'],
    queryFn: async () => {
      const profiles = await base44.entities.CustomerRiskProfile.filter(
        { risk_level: { $in: ['high', 'critical'] } },
        '-risk_score'
      );
      return profiles;
    }
  });
}

/**
 * Hook to validate order before checkout
 */
export function useOrderValidation() {
  return useMutation({
    mutationFn: async ({ customerEmail, orderData, lotId }) => {
      return await FraudDetectionService.validateOrder(customerEmail, orderData, lotId);
    }
  });
}

/**
 * Hook for fraud management mutations
 */
export function useFraudMutations() {
  const queryClient = useQueryClient();

  const blacklistMutation = useMutation({
    mutationFn: async ({ customerEmail, reason, adminEmail }) => {
      return await FraudDetectionService.blacklistCustomer(customerEmail, reason, adminEmail);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
      queryClient.invalidateQueries({ queryKey: ['high-risk-customers'] });
    }
  });

  const removeBlacklistMutation = useMutation({
    mutationFn: async ({ customerEmail, adminEmail, reason }) => {
      return await FraudDetectionService.removeBlacklist(customerEmail, adminEmail, reason);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risk-profile', variables.customerEmail] });
      queryClient.invalidateQueries({ queryKey: ['high-risk-customers'] });
    }
  });

  return {
    blacklist: blacklistMutation,
    removeBlacklist: removeBlacklistMutation
  };
}

// ========== ANALYTICS ==========

/**
 * Hook for preorder dashboard summary
 */
export function usePreOrderDashboard(filters = {}) {
  return useQuery({
    queryKey: ['preorder-dashboard', filters],
    queryFn: async () => {
      return await PreOrderAnalyticsService.getDashboardSummary(filters);
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook for lot demand forecast
 */
export function useDemandForecast(lotId) {
  return useQuery({
    queryKey: ['demand-forecast', lotId],
    queryFn: async () => {
      if (!lotId) return null;
      return await PreOrderAnalyticsService.calculateDemandForecast(lotId);
    },
    enabled: !!lotId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

/**
 * Hook for analytics history
 */
export function useAnalyticsHistory(filters = {}) {
  return useQuery({
    queryKey: ['analytics-history', filters],
    queryFn: async () => {
      return await base44.entities.PreOrderAnalytics.filter(
        filters,
        '-computed_at',
        30
      );
    }
  });
}

// ========== PROOF PACK ==========

/**
 * Hook to get order proof pack
 */
export function useOrderProofPack(orderId) {
  return useQuery({
    queryKey: ['proof-pack', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await OrderProofPackService.getProofPackByOrderId(orderId);
    },
    enabled: !!orderId
  });
}

/**
 * Hook for proof pack mutations
 */
export function useProofPackMutations() {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (orderId) => {
      return await OrderProofPackService.generateProofPack(orderId);
    },
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['proof-pack', orderId] });
    }
  });

  const exportMutation = useMutation({
    mutationFn: async (filters) => {
      return await OrderProofPackService.exportReconciliationData(filters);
    }
  });

  return {
    generate: generateMutation,
    export: exportMutation
  };
}

// ========== CAMPAIGNS ==========

/**
 * Hook for preorder campaigns
 */
export function usePreOrderCampaigns(status = null) {
  return useQuery({
    queryKey: ['preorder-campaigns', status],
    queryFn: async () => {
      const filter = status ? { status } : {};
      return await base44.entities.PreOrderCampaign.filter(filter, '-created_date');
    }
  });
}

/**
 * Hook for active campaign for a lot
 */
export function useActiveCampaignForLot(lotId) {
  return useQuery({
    queryKey: ['lot-campaign', lotId],
    queryFn: async () => {
      if (!lotId) return null;
      const campaigns = await base44.entities.PreOrderCampaign.filter({
        lot_ids: lotId,
        status: 'active'
      });
      return campaigns[0] || null;
    },
    enabled: !!lotId
  });
}

export default {
  // Compensation
  usePendingCompensations,
  useCompensationMutations,
  
  // Fraud
  useCustomerRiskProfile,
  useHighRiskCustomers,
  useOrderValidation,
  useFraudMutations,
  
  // Analytics
  usePreOrderDashboard,
  useDemandForecast,
  useAnalyticsHistory,
  
  // Proof Pack
  useOrderProofPack,
  useProofPackMutations,
  
  // Campaigns
  usePreOrderCampaigns,
  useActiveCampaignForLot
};