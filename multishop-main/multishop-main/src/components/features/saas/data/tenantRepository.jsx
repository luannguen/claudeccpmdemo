/**
 * SaaS Module - Tenant Repository
 * 
 * Data access layer for Tenant entity.
 * ONLY API calls, NO business logic.
 * 
 * @module features/saas/data/tenantRepository
 */

import { base44 } from '@/api/base44Client';

// ========== TENANT CRUD ==========

/**
 * Get tenant by ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Tenant or null
 */
export async function getTenantById(tenantId) {
  const tenants = await base44.entities.Tenant.filter({ id: tenantId });
  return tenants[0] || null;
}

/**
 * Get tenant by slug
 * @param {string} slug - Tenant slug
 * @returns {Promise<Object|null>} Tenant or null
 */
export async function getTenantBySlug(slug) {
  const tenants = await base44.entities.Tenant.filter({ slug });
  return tenants[0] || null;
}

/**
 * List all tenants with optional filters
 * @param {Object} filters - Filter object
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Tenants
 */
export async function listTenants(filters = {}, limit = 500) {
  return await base44.entities.Tenant.filter(filters, '-created_date', limit);
}

/**
 * List active tenants only
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Active tenants
 */
export async function listActiveTenants(limit = 500) {
  return await base44.entities.Tenant.filter({ status: 'active' }, '-created_date', limit);
}

/**
 * Create new tenant
 * @param {Object} tenantData - Tenant data
 * @returns {Promise<Object>} Created tenant
 */
export async function createTenant(tenantData) {
  return await base44.entities.Tenant.create(tenantData);
}

/**
 * Update tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated tenant
 */
export async function updateTenant(tenantId, updateData) {
  return await base44.entities.Tenant.update(tenantId, updateData);
}

/**
 * Delete tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<void>}
 */
export async function deleteTenant(tenantId) {
  return await base44.entities.Tenant.delete(tenantId);
}

// ========== TENANT STATUS ==========

/**
 * Suspend tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} reason - Suspension reason
 * @returns {Promise<Object>} Updated tenant
 */
export async function suspendTenant(tenantId, reason = '') {
  return await updateTenant(tenantId, {
    status: 'suspended',
    subscription_status: 'suspended',
    suspension_reason: reason,
    suspended_at: new Date().toISOString()
  });
}

/**
 * Activate tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Updated tenant
 */
export async function activateTenant(tenantId) {
  return await updateTenant(tenantId, {
    status: 'active',
    subscription_status: 'active',
    suspension_reason: null,
    suspended_at: null
  });
}

// ========== USAGE UPDATES ==========

/**
 * Update tenant usage counters
 * @param {string} tenantId - Tenant ID
 * @param {Object} usageUpdates - Usage updates
 * @returns {Promise<Object>} Updated tenant
 */
export async function updateTenantUsage(tenantId, usageUpdates) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const currentUsage = tenant.usage || {};
  
  return await updateTenant(tenantId, {
    usage: {
      ...currentUsage,
      ...usageUpdates,
      last_updated: new Date().toISOString()
    }
  });
}

/**
 * Increment usage counter
 * @param {string} tenantId - Tenant ID
 * @param {string} resource - Resource type
 * @param {number} amount - Amount to increment
 * @returns {Promise<Object>} Updated tenant
 */
export async function incrementUsage(tenantId, resource, amount = 1) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const usageKey = `${resource}_count`;
  const currentValue = tenant.usage?.[usageKey] || 0;
  
  return await updateTenantUsage(tenantId, {
    [usageKey]: currentValue + amount
  });
}

/**
 * Decrement usage counter
 * @param {string} tenantId - Tenant ID
 * @param {string} resource - Resource type
 * @param {number} amount - Amount to decrement
 * @returns {Promise<Object>} Updated tenant
 */
export async function decrementUsage(tenantId, resource, amount = 1) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const usageKey = `${resource}_count`;
  const currentValue = tenant.usage?.[usageKey] || 0;
  const newValue = Math.max(0, currentValue - amount);
  
  return await updateTenantUsage(tenantId, {
    [usageKey]: newValue
  });
}

// ========== COMMISSION UPDATES ==========

/**
 * Update tenant pending commission
 * @param {string} tenantId - Tenant ID
 * @param {number} amount - Amount to add/subtract
 * @returns {Promise<Object>} Updated tenant
 */
export async function updatePendingCommission(tenantId, amount) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  
  const newPending = (tenant.pending_commission || 0) + amount;
  
  return await updateTenant(tenantId, {
    pending_commission: newPending
  });
}

// ========== EXPORT ==========

export const tenantRepository = {
  getTenantById,
  getTenantBySlug,
  listTenants,
  listActiveTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  suspendTenant,
  activateTenant,
  updateTenantUsage,
  incrementUsage,
  decrementUsage,
  updatePendingCommission
};