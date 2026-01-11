/**
 * useEscrow - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  useOrderWallet,
  useWalletTransactions,
  useEscrowMutations,
  useRefundRequests,
  usePendingRefunds,
  usePendingReleaseWallets
} from '@/components/features/preorder';

// Re-export everything
export {
  useOrderWallet,
  useWalletTransactions,
  useEscrowMutations,
  useRefundRequests,
  usePendingRefunds,
  usePendingReleaseWallets
};

export default {
  useOrderWallet,
  useWalletTransactions,
  useEscrowMutations,
  useRefundRequests,
  usePendingRefunds
};