/**
 * useEscrow - Hook for escrow/wallet operations
 * 
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  walletRepository, 
  transactionRepository 
} from '../data';
import { 
  checkReleaseConditions, 
  calculateSellerPayout,
  canProcessRefund,
  getStatusAfterRefund
} from '../domain';

/**
 * Hook to get wallet for an order
 */
export function useOrderWallet(orderId) {
  return useQuery({
    queryKey: ['wallet', orderId],
    queryFn: () => walletRepository.getWalletByOrderId(orderId),
    enabled: !!orderId
  });
}

/**
 * Hook to get wallet transactions
 */
export function useWalletTransactions(walletId) {
  return useQuery({
    queryKey: ['wallet-transactions', walletId],
    queryFn: () => transactionRepository.getWalletTransactions(walletId),
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
      const wallet = await walletRepository.getWalletById(walletId);
      if (!wallet) throw new Error('Wallet not found');

      const newDepositHeld = (wallet.deposit_held || 0) + amount;
      const newTotalHeld = newDepositHeld + (wallet.final_payment_held || 0);

      await walletRepository.updateWallet(walletId, {
        deposit_held: newDepositHeld,
        deposit_held_date: new Date().toISOString(),
        total_held: newTotalHeld,
        status: 'deposit_held'
      });

      await transactionRepository.createDepositTransaction(wallet, amount, paymentDetails);

      return { success: true, newBalance: newTotalHeld };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const finalPaymentMutation = useMutation({
    mutationFn: async ({ walletId, amount, paymentDetails }) => {
      const wallet = await walletRepository.getWalletById(walletId);
      if (!wallet) throw new Error('Wallet not found');

      const newFinalHeld = (wallet.final_payment_held || 0) + amount;
      const newTotalHeld = (wallet.deposit_held || 0) + newFinalHeld;

      await walletRepository.updateWallet(walletId, {
        final_payment_held: newFinalHeld,
        final_payment_date: new Date().toISOString(),
        total_held: newTotalHeld,
        status: 'fully_held'
      });

      await transactionRepository.createTransaction({
        wallet_id: walletId,
        order_id: wallet.order_id,
        order_number: wallet.order_number,
        transaction_type: 'final_payment_in',
        amount: amount,
        balance_before: wallet.total_held || 0,
        balance_after: newTotalHeld,
        payment_method: paymentDetails?.payment_method,
        payment_transaction_id: paymentDetails?.transaction_id,
        status: 'completed',
        initiated_by: 'customer',
        reason: 'Thanh toán phần còn lại'
      });

      return { success: true, newBalance: newTotalHeld };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const refundMutation = useMutation({
    mutationFn: async ({ walletId, amount, refundType, details }) => {
      const wallet = await walletRepository.getWalletById(walletId);
      if (!wallet) throw new Error('Wallet not found');

      const { canRefund, reason } = canProcessRefund(wallet);
      if (!canRefund) throw new Error(reason);

      if (amount > wallet.total_held) {
        throw new Error('Refund amount exceeds held balance');
      }

      const newTotalHeld = wallet.total_held - amount;
      const newRefunded = (wallet.refunded_amount || 0) + amount;
      const newStatus = getStatusAfterRefund(wallet.total_held, amount);

      await walletRepository.updateWallet(walletId, {
        total_held: newTotalHeld,
        refunded_amount: newRefunded,
        status: newStatus
      });

      await transactionRepository.createRefundTransaction(wallet, amount, refundType, details);

      return {
        success: true,
        refund_amount: amount,
        remaining_balance: newTotalHeld,
        is_full_refund: newTotalHeld === 0
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: async ({ walletId, commissionRate }) => {
      const wallet = await walletRepository.getWalletById(walletId);
      if (!wallet) throw new Error('Wallet not found');

      const conditions = wallet.release_conditions || {};
      if (!checkReleaseConditions(conditions)) {
        return { 
          success: false, 
          error: 'Release conditions not met',
          conditions 
        };
      }

      const { sellerPayout, commission } = calculateSellerPayout(wallet.total_held, commissionRate);

      await walletRepository.updateWallet(walletId, {
        seller_payout_amount: sellerPayout,
        seller_payout_date: new Date().toISOString(),
        platform_commission: commission,
        total_held: 0,
        status: 'released_to_seller'
      });

      await transactionRepository.createSellerPayoutTransaction(wallet, sellerPayout, commission);

      return { success: true, sellerPayout, commission };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.walletId] });
    }
  });

  const updateConditionMutation = useMutation({
    mutationFn: async ({ walletId, condition, value }) => {
      return await walletRepository.updateReleaseCondition(walletId, condition, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    }
  });

  return {
    holdDeposit: depositMutation,
    holdFinalPayment: finalPaymentMutation,
    processRefund: refundMutation,
    releaseToSeller: releaseMutation,
    updateCondition: updateConditionMutation
  };
}

/**
 * Hook for refund requests list (admin)
 */
export function useRefundRequests(filters = {}) {
  return useQuery({
    queryKey: ['refund-requests', filters],
    queryFn: async () => {
      const { base44 } = await import('@/api/base44Client');
      return await base44.entities.RefundRequest.filter(
        filters,
        '-created_date'
      );
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
      const { base44 } = await import('@/api/base44Client');
      return await base44.entities.RefundRequest.filter(
        { status: 'pending_review' },
        '-created_date'
      );
    }
  });
}

/**
 * Hook for pending release wallets
 */
export function usePendingReleaseWallets() {
  return useQuery({
    queryKey: ['pending-release-wallets'],
    queryFn: () => walletRepository.getPendingReleaseWallets()
  });
}