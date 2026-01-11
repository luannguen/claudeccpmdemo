/**
 * SaaS Module - Usage Limits
 * 
 * Pure functions for usage limit checks and enforcement.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/usageLimits
 */

import { PLAN_LIMITS, RESOURCE_TYPES } from '../types';

// ========== LIMIT CHECKS ==========

/**
 * Check if tenant can perform action within resource limits
 * @param {Object} tenant - Tenant object with usage and limits
 * @param {string} resource - Resource type (products, orders_per_month, etc.)
 * @param {number} increment - Amount to add (default 1)
 * @returns {Object} LimitCheckResult
 */
export function checkResourceLimit(tenant, resource, increment = 1) {
  const planName = tenant.subscription_plan || 'free';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  
  const limitKey = `max_${resource}`;
  const usageKey = `${resource}_count`;
  
  const limit = limits[limitKey];
  const currentUsage = tenant.usage?.[usageKey] || 0;
  const newUsage = currentUsage + increment;
  
  // -1 means unlimited
  if (limit === -1) {
    return {
      canProceed: true,
      usage: currentUsage,
      limit: 'unlimited',
      percentage: 0,
      remaining: Infinity,
      isUnlimited: true,
      isNearLimit: false,
      isAtLimit: false
    };
  }
  
  const percentage = (currentUsage / limit) * 100;
  const remaining = Math.max(0, limit - currentUsage);
  const canProceed = newUsage <= limit;
  
  return {
    canProceed,
    usage: currentUsage,
    limit,
    percentage,
    remaining,
    isNearLimit: percentage >= 80,
    isAtLimit: percentage >= 100,
    isUnlimited: false
  };
}

/**
 * Check multiple resources at once
 * @param {Object} tenant - Tenant object
 * @param {Array<string>} resources - Array of resource types
 * @returns {Object} Results by resource
 */
export function checkMultipleResources(tenant, resources) {
  const results = {};
  resources.forEach(resource => {
    results[resource] = checkResourceLimit(tenant, resource, 0);
  });
  return results;
}

// ========== FEATURE CHECKS ==========

/**
 * Check if feature is available for plan
 * @param {Object} tenant - Tenant object
 * @param {string} featureName - Feature name
 * @returns {boolean} Feature available
 */
export function hasFeature(tenant, featureName) {
  const planName = tenant.subscription_plan || 'free';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  return limits.features?.includes(featureName) || false;
}

/**
 * Get all features for plan
 * @param {string} planName - Plan name
 * @returns {Array<string>} Available features
 */
export function getPlanFeatures(planName) {
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  return limits.features || [];
}

// ========== PLAN LIMITS ==========

/**
 * Get all limits for a plan
 * @param {string} planName - Plan name
 * @returns {Object} Plan limits
 */
export function getPlanLimits(planName) {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}

// ========== OVERALL USAGE CALCULATIONS ==========

/**
 * Calculate overall usage percentage across resources
 * @param {Object} tenant - Tenant object
 * @returns {number} Overall usage percentage (0-100)
 */
export function calculateOverallUsage(tenant) {
  const planLimits = getPlanLimits(tenant.subscription_plan || 'free');
  const resources = [RESOURCE_TYPES.PRODUCTS, RESOURCE_TYPES.ORDERS, RESOURCE_TYPES.CUSTOMERS];
  
  let totalPercentage = 0;
  let countedResources = 0;
  
  resources.forEach(resource => {
    const limit = planLimits[`max_${resource}`];
    if (limit > 0) {
      const usage = tenant.usage?.[`${resource}_count`] || 0;
      totalPercentage += (usage / limit) * 100;
      countedResources++;
    }
  });
  
  return countedResources > 0 ? totalPercentage / countedResources : 0;
}

// ========== UPGRADE SUGGESTIONS ==========

/**
 * Get upgrade suggestion based on usage
 * @param {Object} tenant - Tenant object
 * @returns {Object|null} Upgrade suggestion or null
 */
export function getUpgradeSuggestion(tenant) {
  const planName = tenant.subscription_plan || 'free';
  
  // Check which resources are near limit
  const nearLimitResources = [];
  
  Object.values(RESOURCE_TYPES).forEach(resource => {
    const check = checkResourceLimit(tenant, resource, 0);
    if (check.isNearLimit && !check.isUnlimited) {
      nearLimitResources.push({
        resource,
        percentage: check.percentage,
        remaining: check.remaining
      });
    }
  });
  
  if (nearLimitResources.length === 0) return null;
  
  // Find next plan
  const planOrder = ['free', 'starter', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(planName);
  const nextPlan = currentIndex < planOrder.length - 1 ? planOrder[currentIndex + 1] : null;
  
  if (!nextPlan) return null;
  
  return {
    current_plan: planName,
    suggested_plan: nextPlan,
    reasons: nearLimitResources
  };
}

/**
 * Compare two plans
 * @param {string} plan1 - First plan name
 * @param {string} plan2 - Second plan name
 * @returns {Object} Comparison result
 */
export function comparePlans(plan1, plan2) {
  const limits1 = getPlanLimits(plan1);
  const limits2 = getPlanLimits(plan2);
  
  const differences = {};
  
  Object.keys(limits1).forEach(key => {
    if (key.startsWith('max_')) {
      differences[key] = {
        plan1: limits1[key],
        plan2: limits2[key],
        improvement: limits2[key] === -1 
          ? 'unlimited' 
          : limits2[key] - limits1[key]
      };
    }
  });
  
  return {
    plan1,
    plan2,
    differences,
    features_added: limits2.features?.filter(f => !limits1.features?.includes(f)) || []
  };
}