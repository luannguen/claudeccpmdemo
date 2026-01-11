/**
 * UsageMeteringService.js
 * Service quản lý usage metering và limit enforcement
 * 
 * Phase 4 - Task 4.1 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { base44 } from '@/api/base44Client';

// ========== PLAN LIMITS ==========

export const PLAN_LIMITS = {
  free: {
    max_products: 50,
    max_orders_per_month: 100,
    max_customers: 200,
    max_storage_mb: 100,
    max_users: 1,
    features: ['basic_reports', 'email_support']
  },
  starter: {
    max_products: 200,
    max_orders_per_month: 500,
    max_customers: 1000,
    max_storage_mb: 500,
    max_users: 3,
    features: ['basic_reports', 'email_support', 'priority_support', 'custom_domain']
  },
  pro: {
    max_products: 1000,
    max_orders_per_month: 2000,
    max_customers: 5000,
    max_storage_mb: 2000,
    max_users: 10,
    features: ['advanced_reports', 'priority_support', 'custom_domain', 'api_access', 'white_label']
  },
  enterprise: {
    max_products: -1, // unlimited
    max_orders_per_month: -1,
    max_customers: -1,
    max_storage_mb: -1,
    max_users: -1,
    features: ['advanced_reports', 'priority_support', 'custom_domain', 'api_access', 'white_label', 'dedicated_support', 'sla']
  }
};

// ========== USAGE CHECK FUNCTIONS ==========

/**
 * Check if tenant can perform action within limits
 * @param {Object} tenant - Tenant object with usage and subscription info
 * @param {string} resource - Resource type: 'products', 'orders', 'customers', 'storage', 'users'
 * @param {number} increment - How much to add (default 1)
 */
export function checkLimit(tenant, resource, increment = 1) {
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
      isUnlimited: true
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
 * Check if feature is available for plan
 */
export function hasFeature(tenant, featureName) {
  const planName = tenant.subscription_plan || 'free';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  return limits.features?.includes(featureName) || false;
}

/**
 * Get all limits for a plan
 */
export function getPlanLimits(planName) {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}

/**
 * Get usage summary for tenant
 */
export async function getUsageSummary(tenantId) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const planName = tenant.subscription_plan || 'free';
  const limits = PLAN_LIMITS[planName];
  const usage = tenant.usage || {};
  
  return {
    tenant_id: tenantId,
    plan_name: planName,
    resources: {
      products: {
        ...checkLimit(tenant, 'products', 0),
        resource: 'products'
      },
      orders: {
        ...checkLimit(tenant, 'orders_per_month', 0),
        resource: 'orders_per_month'
      },
      customers: {
        ...checkLimit(tenant, 'customers', 0),
        resource: 'customers'
      },
      storage: {
        ...checkLimit(tenant, 'storage_mb', 0),
        resource: 'storage_mb'
      },
      users: {
        ...checkLimit(tenant, 'users', 0),
        resource: 'users'
      }
    },
    features: limits.features,
    overall_percentage: calculateOverallUsage(tenant, limits)
  };
}

/**
 * Calculate overall usage percentage
 */
function calculateOverallUsage(tenant, limits) {
  const resources = ['products', 'orders_per_month', 'customers'];
  let totalPercentage = 0;
  let countedResources = 0;
  
  resources.forEach(resource => {
    const limit = limits[`max_${resource}`];
    if (limit > 0) {
      const usage = tenant.usage?.[`${resource}_count`] || 0;
      totalPercentage += (usage / limit) * 100;
      countedResources++;
    }
  });
  
  return countedResources > 0 ? totalPercentage / countedResources : 0;
}

// ========== USAGE UPDATE FUNCTIONS ==========

/**
 * Increment usage counter
 */
export async function incrementUsage(tenantId, resource, amount = 1) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const usageKey = `${resource}_count`;
  const currentUsage = tenant.usage || {};
  const newCount = (currentUsage[usageKey] || 0) + amount;
  
  return await base44.entities.Tenant.update(tenantId, {
    usage: {
      ...currentUsage,
      [usageKey]: newCount,
      last_updated: new Date().toISOString()
    }
  });
}

/**
 * Decrement usage counter
 */
export async function decrementUsage(tenantId, resource, amount = 1) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const usageKey = `${resource}_count`;
  const currentUsage = tenant.usage || {};
  const newCount = Math.max(0, (currentUsage[usageKey] || 0) - amount);
  
  return await base44.entities.Tenant.update(tenantId, {
    usage: {
      ...currentUsage,
      [usageKey]: newCount,
      last_updated: new Date().toISOString()
    }
  });
}

/**
 * Set usage counter directly
 */
export async function setUsage(tenantId, resource, value) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const usageKey = `${resource}_count`;
  const currentUsage = tenant.usage || {};
  
  return await base44.entities.Tenant.update(tenantId, {
    usage: {
      ...currentUsage,
      [usageKey]: value,
      last_updated: new Date().toISOString()
    }
  });
}

/**
 * Reset monthly usage (orders)
 */
export async function resetMonthlyUsage(tenantId) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  const tenant = tenants[0];
  
  if (!tenant) return null;
  
  const currentUsage = tenant.usage || {};
  
  return await base44.entities.Tenant.update(tenantId, {
    usage: {
      ...currentUsage,
      orders_per_month_count: 0,
      monthly_reset_date: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
  });
}

// ========== UPGRADE SUGGESTION ==========

/**
 * Get upgrade suggestion based on usage
 */
export function getUpgradeSuggestion(tenant) {
  const planName = tenant.subscription_plan || 'free';
  const limits = PLAN_LIMITS[planName];
  
  // Check which resources are near limit
  const nearLimitResources = [];
  
  ['products', 'orders_per_month', 'customers', 'storage_mb', 'users'].forEach(resource => {
    const check = checkLimit(tenant, resource, 0);
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
    reasons: nearLimitResources,
    price_difference: (PLAN_LIMITS[nextPlan]?.price || 0) - (PLAN_LIMITS[planName]?.price || 0)
  };
}

// ========== EXPORTS ==========

export const UsageMeteringService = {
  PLAN_LIMITS,
  checkLimit,
  hasFeature,
  getPlanLimits,
  getUsageSummary,
  incrementUsage,
  decrementUsage,
  setUsage,
  resetMonthlyUsage,
  getUpgradeSuggestion
};

export default UsageMeteringService;