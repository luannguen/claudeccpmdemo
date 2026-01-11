/**
 * SaaS Module - Usage Repository
 * 
 * Data access layer for usage tracking operations.
 * Uses tenantRepository for data access.
 * 
 * @module features/saas/data/usageRepository
 */

import { 
  getTenantById, 
  updateTenantUsage as updateUsage,
  incrementUsage as incrementTenantUsage,
  decrementUsage as decrementTenantUsage 
} from './tenantRepository';
import { checkResourceLimit, calculateOverallUsage } from '../domain/usageLimits';

// ========== USAGE QUERIES ==========

/**
 * Get usage summary for tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Usage summary
 */
export async function getUsageSummary(tenantId) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const resources = {
    products: checkResourceLimit(tenant, 'products', 0),
    orders: checkResourceLimit(tenant, 'orders_per_month', 0),
    customers: checkResourceLimit(tenant, 'customers', 0),
    storage: checkResourceLimit(tenant, 'storage_mb', 0),
    users: checkResourceLimit(tenant, 'users', 0)
  };
  
  return {
    tenant_id: tenantId,
    plan_name: tenant.subscription_plan || 'free',
    resources,
    overall_percentage: calculateOverallUsage(tenant)
  };
}

// ========== USAGE UPDATES ==========

/**
 * Update tenant usage
 * @param {string} tenantId - Tenant ID
 * @param {Object} usageUpdates - Usage updates
 * @returns {Promise<Object>} Updated tenant
 */
export async function updateTenantUsage(tenantId, usageUpdates) {
  return await updateUsage(tenantId, usageUpdates);
}

/**
 * Increment usage counter
 * @param {string} tenantId - Tenant ID
 * @param {string} resource - Resource type
 * @param {number} amount - Amount to increment
 * @returns {Promise<Object>} Updated tenant
 */
export async function incrementUsage(tenantId, resource, amount = 1) {
  return await incrementTenantUsage(tenantId, resource, amount);
}

/**
 * Decrement usage counter
 * @param {string} tenantId - Tenant ID
 * @param {string} resource - Resource type
 * @param {number} amount - Amount to decrement
 * @returns {Promise<Object>} Updated tenant
 */
export async function decrementUsage(tenantId, resource, amount = 1) {
  return await decrementTenantUsage(tenantId, resource, amount);
}

/**
 * Set usage counter directly
 * @param {string} tenantId - Tenant ID
 * @param {string} resource - Resource type
 * @param {number} value - New value
 * @returns {Promise<Object>} Updated tenant
 */
export async function setUsage(tenantId, resource, value) {
  const usageKey = `${resource}_count`;
  return await updateUsage(tenantId, { [usageKey]: value });
}

/**
 * Reset monthly usage counters
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Updated tenant
 */
export async function resetMonthlyUsage(tenantId) {
  return await updateUsage(tenantId, {
    orders_per_month_count: 0,
    monthly_reset_date: new Date().toISOString()
  });
}

// ========== EXPORT ==========

export const usageRepository = {
  getUsageSummary,
  updateTenantUsage,
  incrementUsage,
  decrementUsage,
  setUsage,
  resetMonthlyUsage
};