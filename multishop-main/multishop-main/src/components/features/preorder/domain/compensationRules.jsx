/**
 * Pre-Order Compensation Rules - Domain Logic
 * 
 * Pure business logic for auto-compensation
 * KHÔNG import service/repository
 */

// ========== COMPENSATION RULES ==========

export const COMPENSATION_RULES = {
  // Delay compensation - theo số ngày trễ
  delay_7_days: {
    trigger: (delayDays) => delayDays >= 7 && delayDays < 14,
    compensation_type: 'voucher',
    compensation_value: 5,
    compensation_unit: 'percent',
    description: 'Voucher giảm 5% do giao trễ 7+ ngày'
  },
  delay_14_days: {
    trigger: (delayDays) => delayDays >= 14 && delayDays < 21,
    compensation_type: 'voucher',
    compensation_value: 10,
    compensation_unit: 'percent',
    description: 'Voucher giảm 10% do giao trễ 14+ ngày'
  },
  delay_21_days: {
    trigger: (delayDays) => delayDays >= 21 && delayDays < 30,
    compensation_type: 'discount_current_order',
    compensation_value: 15,
    compensation_unit: 'percent',
    description: 'Giảm 15% đơn hiện tại do giao trễ 21+ ngày'
  },
  delay_30_days: {
    trigger: (delayDays) => delayDays >= 30,
    compensation_type: 'partial_refund',
    compensation_value: 20,
    compensation_unit: 'percent',
    description: 'Hoàn 20% do giao trễ 30+ ngày (hoặc full refund nếu khách yêu cầu)'
  },

  // Shortage compensation
  shortage_minor: {
    trigger: (shortagePercent) => shortagePercent > 0 && shortagePercent <= 10,
    compensation_type: 'points',
    compensation_value: 200,
    compensation_unit: 'points',
    description: 'Cộng 200 điểm do thiếu hàng nhẹ'
  },
  shortage_moderate: {
    trigger: (shortagePercent) => shortagePercent > 10 && shortagePercent <= 30,
    compensation_type: 'partial_refund',
    compensation_value: null, // Calculate based on shortage
    compensation_unit: 'vnd',
    description: 'Hoàn tiền phần thiếu'
  },
  shortage_severe: {
    trigger: (shortagePercent) => shortagePercent > 30,
    compensation_type: 'partial_refund',
    compensation_value: null,
    compensation_unit: 'vnd',
    description: 'Hoàn tiền phần thiếu + bonus 5%'
  }
};

/**
 * Calculate delay days from harvest date
 */
export function calculateDelayDays(harvestDate) {
  if (!harvestDate) return 0;
  const harvest = new Date(harvestDate);
  const today = new Date();
  return Math.floor((today - harvest) / (1000 * 60 * 60 * 24));
}

/**
 * Find applicable delay compensation rule
 * @param {number} delayDays 
 * @param {Array} existingCompensations - Already applied compensations
 */
export function findDelayCompensationRule(delayDays, existingCompensations = []) {
  if (delayDays <= 0) return null;

  for (const [name, rule] of Object.entries(COMPENSATION_RULES)) {
    if (name.startsWith('delay_') && rule.trigger(delayDays)) {
      // Check if this tier already applied
      const alreadyApplied = existingCompensations.some(c => 
        c.trigger_details?.rule_id === name
      );
      
      if (!alreadyApplied) {
        return { name, rule };
      }
    }
  }
  
  return null;
}

/**
 * Calculate shortage percentage
 */
export function calculateShortage(orderedQty, receivedQty) {
  if (!orderedQty) return 0;
  const shortage = orderedQty - receivedQty;
  return (shortage / orderedQty) * 100;
}

/**
 * Find applicable shortage compensation rule
 */
export function findShortageCompensationRule(shortagePercent) {
  if (shortagePercent <= 0) return null;

  for (const [name, rule] of Object.entries(COMPENSATION_RULES)) {
    if (name.startsWith('shortage_') && rule.trigger(shortagePercent)) {
      return { name, rule };
    }
  }
  
  return null;
}

/**
 * Calculate compensation value
 */
export function calculateCompensationValue(rule, orderAmount, shortageValue = 0) {
  if (rule.compensation_unit === 'percent') {
    return Math.round(orderAmount * (rule.compensation_value / 100));
  }
  
  if (rule.compensation_value === null) {
    // For shortage - return actual shortage value
    return shortageValue;
  }
  
  return rule.compensation_value;
}

/**
 * Generate voucher code
 */
export function generateVoucherCode(orderId) {
  return `COMP${orderId.slice(-4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Get voucher expiry date (30 days from now)
 */
export function getVoucherExpiry() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}