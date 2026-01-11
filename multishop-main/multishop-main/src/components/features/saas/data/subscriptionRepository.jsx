/**
 * SaaS Module - Subscription Repository
 * 
 * Data access layer for Subscription entity.
 * ONLY API calls, NO business logic.
 * 
 * @module features/saas/data/subscriptionRepository
 */

import { base44 } from '@/api/base44Client';

// ========== SUBSCRIPTION CRUD ==========

/**
 * Get subscription by ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object|null>} Subscription or null
 */
export async function getSubscriptionById(subscriptionId) {
  const subscriptions = await base44.entities.Subscription.filter({ id: subscriptionId });
  return subscriptions[0] || null;
}

/**
 * Get subscription by tenant ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} Subscription or null
 */
export async function getSubscriptionByTenant(tenantId) {
  const subscriptions = await base44.entities.Subscription.filter({ tenant_id: tenantId });
  return subscriptions[0] || null;
}

/**
 * List all subscriptions with filters
 * @param {Object} filters - Filter object
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Subscriptions
 */
export async function listSubscriptions(filters = {}, limit = 500) {
  return await base44.entities.Subscription.filter(filters, '-created_date', limit);
}

/**
 * Create new subscription
 * @param {Object} subscriptionData - Subscription data
 * @returns {Promise<Object>} Created subscription
 */
export async function createSubscription(subscriptionData) {
  return await base44.entities.Subscription.create(subscriptionData);
}

/**
 * Update subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated subscription
 */
export async function updateSubscription(subscriptionId, updateData) {
  return await base44.entities.Subscription.update(subscriptionId, updateData);
}

// ========== SUBSCRIPTION OPERATIONS ==========

/**
 * Renew subscription for next period
 * @param {string} subscriptionId - Subscription ID
 * @param {Date} newPeriodEnd - New period end date
 * @returns {Promise<Object>} Updated subscription
 */
export async function renewSubscription(subscriptionId, newPeriodEnd) {
  const subscription = await getSubscriptionById(subscriptionId);
  if (!subscription) throw new Error('Subscription not found');
  
  return await updateSubscription(subscriptionId, {
    status: 'active',
    current_period_start: subscription.current_period_end,
    current_period_end: newPeriodEnd.toISOString().split('T')[0],
    last_payment_date: new Date().toISOString()
  });
}

/**
 * Suspend subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} reason - Suspension reason
 * @returns {Promise<Object>} Updated subscription
 */
export async function suspendSubscription(subscriptionId, reason = '') {
  return await updateSubscription(subscriptionId, {
    status: 'suspended',
    suspended_date: new Date().toISOString(),
    suspension_reason: reason
  });
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Updated subscription
 */
export async function cancelSubscription(subscriptionId) {
  return await updateSubscription(subscriptionId, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  });
}

// ========== QUERIES ==========

/**
 * Get subscriptions expiring soon
 * @param {Date} thresholdDate - Threshold date
 * @returns {Promise<Array>} Expiring subscriptions
 */
export async function getExpiringSubscriptions(thresholdDate) {
  const allSubs = await base44.entities.Subscription.list('-current_period_end', 500);
  
  return allSubs.filter(sub => 
    sub.status === 'active' && 
    new Date(sub.current_period_end) <= thresholdDate
  );
}

/**
 * Get subscriptions by status
 * @param {string} status - Subscription status
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Subscriptions
 */
export async function getSubscriptionsByStatus(status, limit = 100) {
  return await base44.entities.Subscription.filter({ status }, '-created_date', limit);
}

// ========== EXPORT ==========

export const subscriptionRepository = {
  getSubscriptionById,
  getSubscriptionByTenant,
  listSubscriptions,
  createSubscription,
  updateSubscription,
  renewSubscription,
  suspendSubscription,
  cancelSubscription,
  getExpiringSubscriptions,
  getSubscriptionsByStatus
};