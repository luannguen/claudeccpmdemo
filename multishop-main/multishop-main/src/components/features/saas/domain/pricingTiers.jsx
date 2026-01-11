/**
 * SaaS Module - Pricing Tiers
 * 
 * Pure functions for plan pricing and comparison.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/pricingTiers
 */

import { PLAN_NAMES, PLAN_PRICES, PLAN_LIMITS, BILLING_CYCLE } from '../types';

// ========== PRICE CALCULATIONS ==========

/**
 * Get price for plan and billing cycle
 * @param {string} planName - Plan name
 * @param {string} billingCycle - Billing cycle
 * @returns {number} Price in VND
 */
export function getPlanPrice(planName, billingCycle = BILLING_CYCLE.MONTHLY) {
  const prices = PLAN_PRICES[planName] || PLAN_PRICES[PLAN_NAMES.FREE];
  return prices[billingCycle] || 0;
}

/**
 * Calculate discount for longer billing cycles
 * @param {string} planName - Plan name
 * @returns {Object} { monthly, quarterly, yearly, quarterly_discount, yearly_discount }
 */
export function calculateBillingDiscounts(planName) {
  const monthly = getPlanPrice(planName, BILLING_CYCLE.MONTHLY);
  const quarterly = getPlanPrice(planName, BILLING_CYCLE.QUARTERLY);
  const yearly = getPlanPrice(planName, BILLING_CYCLE.YEARLY);
  
  const quarterlyEquivalent = monthly * 3;
  const yearlyEquivalent = monthly * 12;
  
  const quarterlyDiscount = quarterlyEquivalent > 0 
    ? Math.round(((quarterlyEquivalent - quarterly) / quarterlyEquivalent) * 100)
    : 0;
  
  const yearlyDiscount = yearlyEquivalent > 0
    ? Math.round(((yearlyEquivalent - yearly) / yearlyEquivalent) * 100)
    : 0;
  
  return {
    monthly,
    quarterly,
    yearly,
    quarterly_discount: quarterlyDiscount,
    yearly_discount: yearlyDiscount
  };
}

// ========== PLAN COMPARISON ==========

/**
 * Get recommended plan based on usage needs
 * @param {Object} needs - { products, orders, customers, users, features }
 * @returns {string} Recommended plan name
 */
export function getRecommendedPlan(needs) {
  const plans = [PLAN_NAMES.FREE, PLAN_NAMES.STARTER, PLAN_NAMES.PRO, PLAN_NAMES.ENTERPRISE];
  
  for (const plan of plans) {
    const limits = PLAN_LIMITS[plan];
    
    // Check if plan satisfies needs
    const satisfiesProducts = limits.max_products === -1 || needs.products <= limits.max_products;
    const satisfiesOrders = limits.max_orders_per_month === -1 || needs.orders <= limits.max_orders_per_month;
    const satisfiesCustomers = limits.max_customers === -1 || needs.customers <= limits.max_customers;
    const satisfiesUsers = limits.max_users === -1 || needs.users <= limits.max_users;
    
    // Check required features
    const hasRequiredFeatures = needs.features?.every(f => limits.features?.includes(f)) ?? true;
    
    if (satisfiesProducts && satisfiesOrders && satisfiesCustomers && 
        satisfiesUsers && hasRequiredFeatures) {
      return plan;
    }
  }
  
  return PLAN_NAMES.ENTERPRISE;
}

/**
 * Compare all plans side by side
 * @returns {Array<Object>} Plan comparison data
 */
export function getAllPlansComparison() {
  return Object.keys(PLAN_NAMES).map(key => {
    const planName = PLAN_NAMES[key];
    const limits = PLAN_LIMITS[planName];
    const prices = calculateBillingDiscounts(planName);
    
    return {
      name: planName,
      display_name: planName.charAt(0).toUpperCase() + planName.slice(1),
      limits,
      prices,
      features: limits.features || [],
      is_popular: planName === PLAN_NAMES.PRO
    };
  });
}

/**
 * Calculate savings for yearly vs monthly
 * @param {string} planName - Plan name
 * @returns {Object} { monthly_cost, yearly_cost, savings, savings_percentage }
 */
export function calculateYearlySavings(planName) {
  const monthlyPrice = getPlanPrice(planName, BILLING_CYCLE.MONTHLY);
  const yearlyPrice = getPlanPrice(planName, BILLING_CYCLE.YEARLY);
  
  const monthlyCost = monthlyPrice * 12;
  const savings = monthlyCost - yearlyPrice;
  const savingsPercentage = monthlyCost > 0 
    ? Math.round((savings / monthlyCost) * 100)
    : 0;
  
  return {
    monthly_cost: monthlyCost,
    yearly_cost: yearlyPrice,
    savings,
    savings_percentage: savingsPercentage
  };
}

// ========== FEATURE CHECKS ==========

/**
 * Get feature differences between plans
 * @param {string} currentPlan - Current plan
 * @param {string} targetPlan - Target plan
 * @returns {Object} { added_features, removed_features }
 */
export function getFeatureDifferences(currentPlan, targetPlan) {
  const currentLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS[PLAN_NAMES.FREE];
  const targetLimits = PLAN_LIMITS[targetPlan] || PLAN_LIMITS[PLAN_NAMES.FREE];
  
  const currentFeatures = currentLimits.features || [];
  const targetFeatures = targetLimits.features || [];
  
  return {
    added_features: targetFeatures.filter(f => !currentFeatures.includes(f)),
    removed_features: currentFeatures.filter(f => !targetFeatures.includes(f))
  };
}