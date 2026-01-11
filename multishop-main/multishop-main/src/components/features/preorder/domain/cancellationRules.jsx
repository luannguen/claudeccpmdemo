/**
 * Pre-Order Cancellation Rules - Domain Logic
 * 
 * Pure business logic for cancellation policy
 * KHÔNG import service/repository
 */

// ========== CANCELLATION POLICY TIERS ==========

export const CANCELLATION_POLICY = {
  tier_1: {
    days_before_harvest: 14,
    refund_percentage: 100,
    label: '14+ ngày trước thu hoạch',
    description: 'Hoàn 100% tiền cọc'
  },
  tier_2: {
    days_before_harvest: 7,
    refund_percentage: 80,
    label: '7-14 ngày trước thu hoạch',
    description: 'Hoàn 80% tiền cọc, giữ lại 20% phí xử lý'
  },
  tier_3: {
    days_before_harvest: 3,
    refund_percentage: 50,
    label: '3-7 ngày trước thu hoạch',
    description: 'Hoàn 50% tiền cọc'
  },
  tier_4: {
    days_before_harvest: 0,
    refund_percentage: 0,
    label: 'Dưới 3 ngày trước thu hoạch',
    description: 'Không hoàn tiền cọc - Đã quá gần ngày thu hoạch'
  }
};

export const CANCEL_REASONS = [
  { id: 'changed_mind', label: 'Tôi đổi ý, không muốn mua nữa' },
  { id: 'financial_issue', label: 'Có vấn đề tài chính' },
  { id: 'found_alternative', label: 'Tìm được nguồn cung cấp khác' },
  { id: 'harvest_date_too_late', label: 'Ngày thu hoạch quá xa' },
  { id: 'quality_concern', label: 'Lo ngại về chất lượng sản phẩm' },
  { id: 'price_concern', label: 'Giá tăng nhiều so với dự kiến' },
  { id: 'duplicate_order', label: 'Đặt trùng đơn hàng' },
  { id: 'other', label: 'Lý do khác' }
];

/**
 * Calculate days before harvest
 */
export function calculateDaysBeforeHarvest(harvestDate) {
  if (!harvestDate) return 0;
  const now = new Date();
  const harvest = new Date(harvestDate);
  return Math.ceil((harvest - now) / (1000 * 60 * 60 * 24));
}

/**
 * Determine policy tier based on days before harvest
 */
export function determinePolicyTier(daysBeforeHarvest) {
  if (daysBeforeHarvest >= 14) return 'tier_1';
  if (daysBeforeHarvest >= 7) return 'tier_2';
  if (daysBeforeHarvest >= 3) return 'tier_3';
  return 'tier_4';
}

/**
 * Calculate refund based on policy
 * @param {number} depositAmount 
 * @param {string} harvestDate 
 * @returns {Object} RefundCalculation
 */
export function calculateRefund(depositAmount, harvestDate) {
  const daysBeforeHarvest = calculateDaysBeforeHarvest(harvestDate);
  const policyTier = determinePolicyTier(daysBeforeHarvest);
  const policy = CANCELLATION_POLICY[policyTier];
  
  const refundPercentage = policy.refund_percentage;
  const refundAmount = Math.round(depositAmount * refundPercentage / 100);
  const penaltyAmount = depositAmount - refundAmount;
  
  return {
    daysBeforeHarvest,
    policyTier,
    policy,
    depositAmount,
    refundPercentage,
    refundAmount,
    penaltyAmount,
    canCancel: true,
    policyApplied: refundPercentage === 100 ? 'full_refund' : 
                   refundPercentage > 0 ? 'partial_refund' : 'no_refund'
  };
}

/**
 * Check if order can be cancelled
 * @param {Object} order 
 * @param {string} harvestDate 
 */
export function canCancelOrder(order, harvestDate) {
  const nonCancellableStatuses = ['cancelled', 'delivered', 'shipping', 'returned_refunded'];
  
  if (nonCancellableStatuses.includes(order.order_status)) {
    return {
      canCancel: false,
      reason: 'Đơn hàng không thể hủy với trạng thái hiện tại'
    };
  }
  
  if (order.has_preorder_items && harvestDate) {
    const now = new Date();
    const harvest = new Date(harvestDate);
    
    if (harvest < now) {
      return {
        canCancel: false,
        reason: 'Đã qua ngày thu hoạch, không thể hủy đơn'
      };
    }
  }
  
  return { canCancel: true, reason: null };
}

/**
 * Get earliest harvest date from order items
 */
export function getEarliestHarvestDate(order) {
  if (!order?.items) return null;
  
  const preorderItems = order.items.filter(i => i.is_preorder && i.estimated_harvest_date);
  if (preorderItems.length === 0) return null;
  
  const dates = preorderItems.map(i => new Date(i.estimated_harvest_date));
  return new Date(Math.min(...dates)).toISOString();
}

/**
 * Format refund message for display
 */
export function formatRefundMessage(refundCalc) {
  if (refundCalc.refundAmount > 0) {
    return `Bạn sẽ được hoàn ${refundCalc.refundAmount.toLocaleString('vi-VN')}đ (${refundCalc.refundPercentage}%).`;
  }
  return 'Theo chính sách, tiền cọc không được hoàn lại do đã quá gần ngày thu hoạch.';
}