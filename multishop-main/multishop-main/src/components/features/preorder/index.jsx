/**
 * 🌾 Pre-Order Module - Public API
 * 
 * Feature-based module for Pre-Order system
 * 
 * Structure:
 * - ui/       : UI Components
 * - domain/   : Business Logic
 * - data/     : Repositories
 * - types/    : DTOs & Types
 * - hooks/    : Feature Hooks
 */

// ========== TYPES ==========
export * from './types';

// ========== DOMAIN ==========
export * from './domain';

// ========== DATA REPOSITORIES ==========
export {
  lotRepository,
  preOrderProductRepository,
  cancellationRepository,
  walletRepository,
  transactionRepository,
  compensationRepository,
  disputeRepository
} from './data';

// ========== HOOKS ==========
export {
  // Lot hooks
  usePreOrders,
  useProductLots,
  useProducts,
  useActiveLots,
  useLotFilters,
  useLotDetail,
  useRelatedLots,
  
  // Lot utility functions (re-exported from hooks for convenience)
  getDaysUntilHarvest,
  getDiscountPercent,
  getPriceIncreasePercentage,
  getAvailablePercentage,
  getSoldPercentage,
  getLotGallery,
  
  // Cancellation hooks
  useCanCancelOrder,
  useRefundCalculation,
  useCancelPreOrder,
  useProcessRefund,
  usePendingRefundCancellations,
  useCancellationsList,
  
  // Escrow hooks
  useOrderWallet,
  useWalletTransactions,
  useEscrowMutations,
  useRefundRequests,
  usePendingRefunds,
  usePendingReleaseWallets,
  
  // Compensation hooks
  usePendingCompensations,
  useOrderCompensations,
  useCompensationMutations,
  
  // Dispute hooks
  useOrderDisputes,
  useDisputeDetail,
  useOpenDisputes,
  useDisputesList,
  useDisputeMutations,
  DISPUTE_TYPES,
  RESOLUTION_TYPES,
  
  // Cart hooks
  useAddToCart,
  useWishlist,
  useQuantitySelector,
  
  // Admin PreOrders hooks
  usePreOrdersData,
  useAdminPreOrderLots,
  usePreOrderDetail,
  useFilteredPreOrders,
  usePreOrderStats,
  useDeletePreOrder,
  usePreOrderFilters,
  usePreOrderFormModal,
  preOrderStatusOptions,
  getPreOrderStatusColor,
  getPreOrderStatusText,
  
  // Admin Lots hooks
  useProductLotsData,
  useFilteredLots,
  useLotsStats,
  useDeleteLot,
  useAdminLotFilters,
  useLotFormModal,
  lotStatusOptions,
  getLotStatusColor,
  getLotStatusText,
  getAdminDaysUntilHarvest,
  getAdminSoldPercentage,
  
  // Campaign hooks
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  useLotCampaigns,
  useCampaignDetail,
  useGroupBuyProgress,
  useEarlyBirdTier,
  useFlashSale,
  useBestCampaignDiscount,
  useAdminCampaigns,
  useCampaignMutations,
  
  // Risk management hooks
  useCustomerRiskProfile,
  useValidateOrder,
  useRiskMutations,
  
  // Analytics hooks
  useFunnelMetrics,
  useRevenueMetrics,
  useCancellationMetrics,
  useDeliveryMetrics,
  useDisputeMetrics,
  useDemandForecast,
  useDashboardSummary,
  useSaveAnalyticsSnapshot,
  
  // Proof pack hooks
  useOrderProofPack,
  useProofPackMutations,
  useExportReconciliation,
  useExportCSV
} from './hooks';

// ========== CONSTANTS (for backward compatibility) ==========
export { WALLET_STATUS, TRANSACTION_TYPE, REFUND_TYPE } from './types';

// ========== UI COMPONENTS ==========
// UI components remain in components/preorder/*
// Import them directly when needed, e.g.:
// import DisputeForm from '@/components/preorder/dispute/DisputeForm';