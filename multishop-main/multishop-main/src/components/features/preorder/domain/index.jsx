/**
 * Pre-Order Domain - Public API
 */

// Fraud Detector
export * from './fraudDetector';

// Analytics Calculator
export * from './analyticsCalculator';

// Proof Pack Generator
export * from './proofPackGenerator';

// Cancellation Rules
export {
  CANCELLATION_POLICY,
  CANCEL_REASONS,
  calculateDaysBeforeHarvest,
  determinePolicyTier,
  calculateRefund,
  canCancelOrder,
  getEarliestHarvestDate,
  formatRefundMessage
} from './cancellationRules';

// Compensation Rules
export {
  COMPENSATION_RULES,
  calculateDelayDays,
  findDelayCompensationRule,
  calculateShortage,
  findShortageCompensationRule,
  calculateCompensationValue,
  generateVoucherCode,
  getVoucherExpiry
} from './compensationRules';

// Escrow Rules
export {
  checkReleaseConditions,
  calculateSellerPayout,
  calculatePolicyRefund,
  validateRefundAmount,
  getStatusAfterRefund,
  canProcessRefund,
  getDefaultReleaseConditions,
  calculateAutoReleaseDate
} from './escrowRules';

// Pricing Rules
export {
  getDaysUntilHarvest,
  getPriceIncreasePercent,
  getDiscountPercent,
  getAvailablePercent,
  getSoldPercent,
  calculateDeposit,
  calculateRemainingPayment,
  isLowStock,
  isNearHarvest,
  getUrgencyLevel,
  formatPrice,
  formatWeight,
  getLotGallery
} from './pricingRules';

// Validators
export {
  validateLotPurchase,
  validateCancellationRequest,
  validateRefundRequest,
  validateDepositPayment,
  validateLotData,
  validateDisputeSubmission
} from './validators';