/**
 * SaaS Module - Commission Calculator
 * 
 * Pure functions for commission calculations.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/commissionCalculator
 */

import { DEFAULT_COMMISSION_RATE } from '../types';

// ========== CORE CALCULATIONS ==========

/**
 * Calculate commission from order amount
 * @param {number} orderAmount - Total order amount
 * @param {number} commissionRate - Commission rate percentage
 * @returns {Object} { commission_amount, shop_revenue }
 */
export function calculateCommission(orderAmount, commissionRate) {
  if (orderAmount < 0) throw new Error('Order amount cannot be negative');
  if (commissionRate < 0 || commissionRate > 100) {
    throw new Error('Commission rate must be between 0 and 100');
  }
  
  const commissionAmount = Math.round(orderAmount * (commissionRate / 100));
  const shopRevenue = orderAmount - commissionAmount;
  
  return {
    commission_amount: commissionAmount,
    shop_revenue: shopRevenue
  };
}

/**
 * Get effective commission rate for tenant
 * Priority: custom_commission_rate > commission_rate > default
 * @param {Object} tenant - Tenant object
 * @returns {number} Effective commission rate
 */
export function getEffectiveCommissionRate(tenant) {
  if (!tenant) return DEFAULT_COMMISSION_RATE;
  
  return tenant.custom_commission_rate 
    ?? tenant.commission_rate 
    ?? DEFAULT_COMMISSION_RATE;
}

/**
 * Calculate commission with effective rate
 * @param {number} orderAmount - Order amount
 * @param {Object} tenant - Tenant object
 * @returns {Object} { commission_rate, commission_amount, shop_revenue }
 */
export function calculateOrderCommission(orderAmount, tenant) {
  const rate = getEffectiveCommissionRate(tenant);
  const calculation = calculateCommission(orderAmount, rate);
  
  return {
    commission_rate: rate,
    ...calculation
  };
}

// ========== AGGREGATION CALCULATIONS ==========

/**
 * Calculate total commission from list
 * @param {Array<Object>} commissions - Array of commission objects
 * @returns {number} Total commission amount
 */
export function calculateTotalCommission(commissions) {
  return commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
}

/**
 * Calculate commission summary by status
 * @param {Array<Object>} commissions - Array of commission objects
 * @returns {Object} { pending, approved, paid, total }
 */
export function calculateCommissionByStatus(commissions) {
  return {
    pending: commissions
      .filter(c => c.status === 'pending' || c.status === 'calculated')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    approved: commissions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    paid: commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    total: calculateTotalCommission(commissions)
  };
}

/**
 * Group commissions by shop
 * @param {Array<Object>} commissions - Array of commission objects
 * @returns {Object} Grouped by shop_id
 */
export function groupCommissionsByShop(commissions) {
  const grouped = {};
  
  commissions.forEach(c => {
    if (!grouped[c.shop_id]) {
      grouped[c.shop_id] = {
        shop_id: c.shop_id,
        shop_name: c.shop_name,
        total_orders: 0,
        total_revenue: 0,
        total_commission: 0,
        pending: 0,
        approved: 0,
        paid: 0
      };
    }
    
    grouped[c.shop_id].total_orders++;
    grouped[c.shop_id].total_revenue += c.order_amount || 0;
    grouped[c.shop_id].total_commission += c.commission_amount || 0;
    
    if (c.status === 'pending' || c.status === 'calculated') {
      grouped[c.shop_id].pending += c.commission_amount || 0;
    } else if (c.status === 'approved') {
      grouped[c.shop_id].approved += c.commission_amount || 0;
    } else if (c.status === 'paid') {
      grouped[c.shop_id].paid += c.commission_amount || 0;
    }
  });
  
  return grouped;
}

// ========== VALIDATION ==========

/**
 * Validate commission can be approved
 * @param {Object} commission - Commission object
 * @returns {boolean} Can approve
 */
export function canApproveCommission(commission) {
  return commission.status === 'calculated' || commission.status === 'pending';
}

/**
 * Validate commission can be paid
 * @param {Object} commission - Commission object
 * @returns {boolean} Can mark as paid
 */
export function canMarkCommissionPaid(commission) {
  return commission.status === 'approved';
}