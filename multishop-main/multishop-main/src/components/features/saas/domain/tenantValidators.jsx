/**
 * SaaS Module - Tenant Validators
 * 
 * Pure validation functions for tenant operations.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/tenantValidators
 */

import { BUSINESS_TYPES, INDUSTRIES, TENANT_STATUS } from '../types';

// ========== SLUG VALIDATION ==========

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateSlug(slug) {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }
  
  if (slug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters' };
  }
  
  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be less than 50 characters' };
  }
  
  // Only lowercase letters, numbers, hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  
  // Cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with hyphen' };
  }
  
  // Reserved slugs
  const reserved = ['admin', 'api', 'shop', 'www', 'app', 'test', 'demo'];
  if (reserved.includes(slug)) {
    return { valid: false, error: 'Slug is reserved' };
  }
  
  return { valid: true };
}

// ========== TENANT DATA VALIDATION ==========

/**
 * Validate tenant data for creation
 * @param {Object} data - Tenant data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateTenantData(data) {
  const errors = {};
  
  // Required fields
  if (!data.organization_name) {
    errors.organization_name = 'Organization name is required';
  }
  
  if (!data.slug) {
    errors.slug = 'Slug is required';
  } else {
    const slugValidation = validateSlug(data.slug);
    if (!slugValidation.valid) {
      errors.slug = slugValidation.error;
    }
  }
  
  if (!data.owner_email) {
    errors.owner_email = 'Owner email is required';
  } else if (!isValidEmail(data.owner_email)) {
    errors.owner_email = 'Invalid email format';
  }
  
  if (!data.owner_name) {
    errors.owner_name = 'Owner name is required';
  }
  
  // Validate business type
  if (data.business_type && !Object.values(BUSINESS_TYPES).includes(data.business_type)) {
    errors.business_type = 'Invalid business type';
  }
  
  // Validate industry
  if (data.industry && !Object.values(INDUSTRIES).includes(data.industry)) {
    errors.industry = 'Invalid industry';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========== TENANT ACCESS VALIDATION ==========

/**
 * Validate that operation is within tenant scope
 * @param {string} currentTenantId - Current tenant ID
 * @param {string} resourceTenantId - Resource's tenant ID
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateTenantAccess(currentTenantId, resourceTenantId) {
  if (!currentTenantId) {
    return { valid: false, error: 'No tenant context' };
  }
  
  if (resourceTenantId && resourceTenantId !== currentTenantId) {
    return { valid: false, error: 'Cross-tenant access denied' };
  }
  
  return { valid: true };
}

/**
 * Check if tenant is active
 * @param {Object} tenant - Tenant object
 * @returns {boolean} Is active
 */
export function isTenantActive(tenant) {
  return tenant?.status === TENANT_STATUS.ACTIVE;
}

/**
 * Check if tenant can process orders
 * @param {Object} tenant - Tenant object
 * @returns {Object} { can_process: boolean, reason?: string }
 */
export function canProcessOrders(tenant) {
  if (!tenant) {
    return { can_process: false, reason: 'Tenant not found' };
  }
  
  if (tenant.status !== TENANT_STATUS.ACTIVE) {
    return { can_process: false, reason: 'Tenant is not active' };
  }
  
  if (tenant.subscription_status === 'suspended' || 
      tenant.subscription_status === 'expired') {
    return { can_process: false, reason: 'Subscription inactive' };
  }
  
  return { can_process: true };
}