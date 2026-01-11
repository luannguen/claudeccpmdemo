/**
 * FraudDetectionService - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  RISK_FLAGS,
  RISK_LEVEL,
  TRUST_TIER,
  FRAUD_THRESHOLDS as THRESHOLDS,
  validateOrderAgainstRules
} from '@/components/features/preorder';
import {
  getOrCreateRiskProfile,
  updateProfileOnOrder as updateRiskProfileOnOrder,
  updateProfileOnCancel as updateRiskProfileOnCancel,
  recordDevice as recordDeviceFingerprint,
  recalculateRisk as calculateRiskScore,
  blacklistCustomer,
  removeBlacklist,
  getLotOrderCount
} from '@/components/features/preorder';

// Re-export constants
export { RISK_FLAGS, RISK_LEVEL, TRUST_TIER, THRESHOLDS };

// Legacy function wrappers
export async function validateOrder(customerEmail, orderData, lotId = null) {
  const profile = await getOrCreateRiskProfile(customerEmail);
  const lotCount = lotId ? await getLotOrderCount(customerEmail, lotId) : 0;
  return validateOrderAgainstRules(profile, orderData, lotCount);
}

export const FraudDetectionService = {
  RISK_FLAGS,
  RISK_LEVEL,
  TRUST_TIER,
  THRESHOLDS,
  getOrCreateRiskProfile,
  updateRiskProfileOnOrder,
  updateRiskProfileOnCancel,
  recordDeviceFingerprint,
  calculateRiskScore,
  validateOrder,
  blacklistCustomer,
  removeBlacklist
};

export default FraudDetectionService;