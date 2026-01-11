/**
 * Pre-Order Escrow Rules - Domain Logic
 * 
 * Pure business logic for escrow/wallet operations
 * KHÔNG import service/repository
 */

import { WALLET_STATUS } from '../types';

/**
 * Check if release conditions are met
 */
export function checkReleaseConditions(conditions) {
  if (!conditions) return false;
  
  return conditions.delivery_confirmed && 
    conditions.dispute_resolved && 
    (conditions.customer_accepted || conditions.inspection_period_passed);
}

/**
 * Calculate seller payout after commission
 */
export function calculateSellerPayout(totalHeld, commissionRate = 0) {
  const commission = totalHeld * (commissionRate / 100);
  const sellerPayout = totalHeld - commission;
  
  return {
    totalHeld,
    commission: Math.round(commission),
    sellerPayout: Math.round(sellerPayout),
    commissionRate
  };
}

/**
 * Calculate refund based on policy
 */
export function calculatePolicyRefund(originalAmount, policy, daysBeforeHarvest, cancelReason) {
  // Seller cancel = 100% refund
  if (cancelReason === 'seller_cancel') {
    return {
      refund_percentage: 100,
      refund_amount: originalAmount,
      penalty_amount: 0,
      tier: 'seller_cancel'
    };
  }

  const cancellationRules = policy?.cancellation_rules || {};
  const freeCancelDays = cancellationRules.free_cancel_before_days || 7;
  const cancelFeePercent = cancellationRules.cancel_fee_percentage || 20;

  if (daysBeforeHarvest >= freeCancelDays) {
    return {
      refund_percentage: 100,
      refund_amount: originalAmount,
      penalty_amount: 0,
      tier: 'tier_1'
    };
  } else if (daysBeforeHarvest >= 3) {
    const refundPercent = 100 - cancelFeePercent;
    return {
      refund_percentage: refundPercent,
      refund_amount: Math.round(originalAmount * refundPercent / 100),
      penalty_amount: Math.round(originalAmount * cancelFeePercent / 100),
      tier: 'tier_2'
    };
  } else if (daysBeforeHarvest >= 1) {
    return {
      refund_percentage: 50,
      refund_amount: Math.round(originalAmount * 50 / 100),
      penalty_amount: Math.round(originalAmount * 50 / 100),
      tier: 'tier_3'
    };
  } else {
    return {
      refund_percentage: 0,
      refund_amount: 0,
      penalty_amount: originalAmount,
      tier: 'tier_4'
    };
  }
}

/**
 * Validate refund amount
 */
export function validateRefundAmount(refundAmount, totalHeld) {
  if (refundAmount <= 0) {
    return { valid: false, error: 'Số tiền hoàn phải lớn hơn 0' };
  }
  
  if (refundAmount > totalHeld) {
    return { valid: false, error: 'Số tiền hoàn vượt quá số dư trong ví' };
  }
  
  return { valid: true };
}

/**
 * Determine new wallet status after refund
 */
export function getStatusAfterRefund(currentTotalHeld, refundAmount) {
  const newBalance = currentTotalHeld - refundAmount;
  return newBalance === 0 ? WALLET_STATUS.REFUNDED : WALLET_STATUS.PARTIAL_REFUNDED;
}

/**
 * Check if wallet can process refund
 */
export function canProcessRefund(wallet) {
  const blockedStatuses = [
    WALLET_STATUS.RELEASED_TO_SELLER,
    WALLET_STATUS.CANCELLED
  ];
  
  if (blockedStatuses.includes(wallet.status)) {
    return { 
      canRefund: false, 
      reason: 'Ví đã được release hoặc hủy, không thể hoàn tiền' 
    };
  }
  
  if (!wallet.total_held || wallet.total_held <= 0) {
    return { 
      canRefund: false, 
      reason: 'Không có số dư để hoàn tiền' 
    };
  }
  
  return { canRefund: true };
}

/**
 * Get default release conditions
 */
export function getDefaultReleaseConditions() {
  return {
    harvest_confirmed: false,
    delivery_confirmed: false,
    customer_accepted: false,
    dispute_resolved: true,
    inspection_period_passed: false
  };
}

/**
 * Calculate auto-release date (14 days from delivery)
 */
export function calculateAutoReleaseDate(deliveryDate) {
  const delivery = new Date(deliveryDate);
  return new Date(delivery.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
}