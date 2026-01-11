/**
 * Preorder Escrow Module - Public API
 * 
 * Module quản lý:
 * - PaymentWallet: Ví giữ tiền (deposit, final payment)
 * - RefundEngine: Auto-refund theo policy
 * - DisputeService: Xử lý sự cố
 * - AutoCompensation: Bồi thường tự động
 * - FraudDetection: Chống gian lận
 */

// Services
export { escrowCore, WALLET_STATUS, TRANSACTION_TYPE, REFUND_TYPE } from '@/components/services/escrowCore';
export { RefundEngine, REASON_CODE } from '@/components/services/RefundEngine';
export { DisputeService, DISPUTE_TYPE, DISPUTE_STATUS, RESOLUTION_TYPE } from '@/components/services/DisputeService';
export { AutoCompensationEngine } from '@/components/services/AutoCompensationEngine';
export { FraudDetectionService, RISK_FLAGS, RISK_LEVEL, TRUST_TIER } from '@/components/services/FraudDetectionService';
export { PreOrderAnalyticsService } from '@/components/services/PreOrderAnalyticsService';
export { OrderProofPackService } from '@/components/services/OrderProofPackService';

// Re-export main functions for convenience
export { 
  createWallet,
  holdDeposit,
  holdFinalPayment,
  releaseToSeller,
  processRefund,
  getWalletByOrderId
} from '@/components/services/escrowCore';

export {
  createRefundRequest,
  processApprovedRefund,
  processCustomerCancellation
} from '@/components/services/RefundEngine';

export {
  createDispute,
  proposeResolutions,
  selectResolution
} from '@/components/services/DisputeService';

export {
  checkDelayCompensation,
  checkShortageCompensation,
  applyCompensation
} from '@/components/services/AutoCompensationEngine';

export {
  validateOrder,
  getOrCreateRiskProfile,
  calculateRiskScore
} from '@/components/services/FraudDetectionService';

export {
  getDashboardSummary,
  calculateDemandForecast
} from '@/components/services/PreOrderAnalyticsService';

export {
  generateProofPack,
  exportReconciliationData
} from '@/components/services/OrderProofPackService';