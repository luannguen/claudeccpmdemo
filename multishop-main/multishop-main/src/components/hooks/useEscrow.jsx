/**
 * useEscrow - Hook for escrow/wallet operations
 * Feature Logic Layer
 * 
 * Orchestrates escrow operations for UI
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  escrowCore,
  getWalletByOrderId,
  holdDeposit,
  holdFinalPayment,
  processRefund
} from '@/components/services/escrowCore';

/**
 * Hook to get wallet for an order
 */
export function useOrderWallet(orderId) {
  return useQuery({
    queryKey: ['wallet', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await getWalletByOrderId(orderId);
    },
    enabled: !!orderId
  });
}

/**
 * Hook to get wallet transactions
 */
export function useWalletTransactions(walletId) {
  return useQuery({
    queryKey: ['wallet-transactions', walletId],
    queryFn: async () => {
      if (!walletId) return [];
      return await base44.entities.WalletTransaction.filter(
        { wallet_id: walletId },
        '-created_date'
      );
    },
    enabled: !!walletId
  });
}

/**
 * Hook for escrow mutations
 */
export function useEscrowMutations() {
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: async ({ walletId, amount, paymentDetails }) => {
      return await holdDeposit(walletId, amount, paymentDetails);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const finalPaymentMutation = useMutation({
    mutationFn: async ({ walletId, amount, paymentDetails }) => {
      return await holdFinalPayment(walletId, amount, paymentDetails);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const refundMutation = useMutation({
    mutationFn: async ({ walletId, amount, refundType, details }) => {
      return await processRefund(walletId, amount, refundType, details);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: async ({ walletId, commissionRate }) => {
      return await escrowCore.releaseToSeller(walletId, commissionRate);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  return {
    holdDeposit: depositMutation,
    holdFinalPayment: finalPaymentMutation,
    processRefund: refundMutation,
    releaseToSeller: releaseMutation
  };
}

/**
 * Hook for refund requests list (admin)
 */
export function useRefundRequests(filters = {}) {
  return useQuery({
    queryKey: ['refund-requests', filters],
    queryFn: async () => {
      const requests = await base44.entities.RefundRequest.filter(
        filters,
        '-created_date'
      );
      return requests;
    }
  });
}

/**
 * Hook for pending refunds (admin)
 */
export function usePendingRefunds() {
  return useQuery({
    queryKey: ['pending-refunds'],
    queryFn: async () => {
      return await base44.entities.RefundRequest.filter(
        { status: 'pending_review' },
        '-created_date'
      );
    }
  });
}

export default {
  useOrderWallet,
  useWalletTransactions,
  useEscrowMutations,
  useRefundRequests,
  usePendingRefunds
};