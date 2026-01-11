/**
 * Commission Calculator
 * Domain Layer - Pure business logic for commission calculation
 * 
 * @module features/referral/domain/commissionCalculator
 */

import { DEFAULT_COMMISSION_TIERS } from '../types';

/**
 * Get commission tier based on monthly revenue
 * @param {number} monthlyRevenue
 * @param {Array} tiers - Commission tier config
 * @returns {{ rate: number, label: string, tier: Object }}
 */
export function getCommissionTier(monthlyRevenue, tiers = DEFAULT_COMMISSION_TIERS) {
  for (const tier of tiers) {
    const maxRevenue = tier.max_revenue || Infinity;
    if (monthlyRevenue >= tier.min_revenue && monthlyRevenue < maxRevenue) {
      return { rate: tier.rate, label: tier.label, tier };
    }
  }
  
  // Default to last tier
  const lastTier = tiers[tiers.length - 1];
  return { rate: lastTier.rate, label: lastTier.label, tier: lastTier };
}

/**
 * Calculate commission amount
 * @param {number} orderAmount
 * @param {number} rate - Percentage rate (1-100)
 * @param {number} [rankBonus] - Additional bonus from rank
 * @returns {number} Commission amount (rounded)
 */
export function calculateCommissionAmount(orderAmount, rate, rankBonus = 0) {
  const totalRate = rate + rankBonus;
  return Math.round(orderAmount * totalRate / 100);
}

/**
 * Calculate total rate considering custom rate
 * @param {number} tierRate - Rate from tier
 * @param {number} rankBonus - Bonus from seeder rank
 * @param {number|null} customRate - Admin-set custom rate (takes priority)
 * @returns {number}
 */
export function calculateTotalRate(tierRate, rankBonus = 0, customRate = null) {
  if (customRate !== null && customRate !== undefined) {
    return customRate;
  }
  return tierRate + rankBonus;
}

/**
 * Calculate full commission for an order
 * @param {Object} params
 * @param {number} params.orderAmount - Order total
 * @param {number} params.currentMonthRevenue - Revenue so far this month
 * @param {Array} params.tiers - Commission tiers
 * @param {number} [params.rankBonus] - Rank bonus
 * @param {number|null} [params.customRate] - Custom rate override
 * @returns {import('../types/ReferralDTO').CommissionResult}
 */
export function calculateOrderCommission({
  orderAmount,
  currentMonthRevenue = 0,
  tiers = DEFAULT_COMMISSION_TIERS,
  rankBonus = 0,
  customRate = null
}) {
  // Custom rate takes priority
  if (customRate !== null && customRate !== undefined) {
    const commissionAmount = calculateCommissionAmount(orderAmount, customRate, 0);
    return {
      commission_rate: customRate,
      commission_tier: 'Custom Rate',
      commission_amount: commissionAmount,
      order_amount: orderAmount,
      current_month_revenue: currentMonthRevenue,
      is_custom_rate: true
    };
  }
  
  // Calculate with tiers
  const newTotalRevenue = currentMonthRevenue + orderAmount;
  const { rate, label } = getCommissionTier(newTotalRevenue, tiers);
  const totalRate = rate + rankBonus;
  const commissionAmount = calculateCommissionAmount(orderAmount, rate, rankBonus);
  
  return {
    commission_rate: totalRate,
    commission_tier: label,
    commission_amount: commissionAmount,
    order_amount: orderAmount,
    current_month_revenue: newTotalRevenue,
    is_custom_rate: false
  };
}

/**
 * Calculate projected commission for display
 * @param {number} orderAmount
 * @param {Object} member - Referral member
 * @param {Object} settings - Referral settings
 * @returns {{ minCommission: number, maxCommission: number, currentRate: number }}
 */
export function calculateProjectedCommission(orderAmount, member, settings) {
  const tiers = settings?.commission_tiers || DEFAULT_COMMISSION_TIERS;
  const rankBonus = member?.seeder_rank_bonus || 0;
  
  // Custom rate
  if (member?.custom_rate_enabled && member?.custom_commission_rate != null) {
    const amount = calculateCommissionAmount(orderAmount, member.custom_commission_rate, 0);
    return {
      minCommission: amount,
      maxCommission: amount,
      currentRate: member.custom_commission_rate
    };
  }
  
  // Calculate min (lowest tier) and max (highest tier + rank)
  const minRate = tiers[0]?.rate || 1;
  const maxRate = tiers[tiers.length - 1]?.rate || 3;
  
  const currentMonthRevenue = member?.current_month_revenue || 0;
  const { rate: currentRate } = getCommissionTier(currentMonthRevenue, tiers);
  
  return {
    minCommission: calculateCommissionAmount(orderAmount, minRate, 0),
    maxCommission: calculateCommissionAmount(orderAmount, maxRate, rankBonus),
    currentRate: currentRate + rankBonus
  };
}

export default {
  getCommissionTier,
  calculateCommissionAmount,
  calculateTotalRate,
  calculateOrderCommission,
  calculateProjectedCommission
};