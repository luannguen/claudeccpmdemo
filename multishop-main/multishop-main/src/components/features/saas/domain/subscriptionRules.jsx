/**
 * SaaS Module - Subscription Rules
 * 
 * Pure functions for subscription lifecycle logic.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/subscriptionRules
 */

import { SUBSCRIPTION_STATUS, GRACE_PERIOD_DAYS } from '../types';

// ========== RENEWAL CHECKS ==========

/**
 * Check if subscription should be renewed
 * @param {Object} subscription - Subscription object
 * @param {Object} invoice - Latest invoice object
 * @returns {boolean} Should renew
 */
export function shouldRenewSubscription(subscription, invoice) {
  if (!subscription || !invoice) return false;
  
  // Only renew if invoice is paid
  if (invoice.status !== 'paid') return false;
  
  // Check if subscription is at end of period
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  
  return now >= periodEnd;
}

/**
 * Check if subscription should be suspended
 * @param {Object} subscription - Subscription object
 * @param {Object} invoice - Latest invoice object
 * @returns {Object} { should_suspend, reason, days_overdue }
 */
export function shouldSuspendSubscription(subscription, invoice) {
  if (!subscription || !invoice) {
    return { should_suspend: false, reason: null, days_overdue: 0 };
  }
  
  // Don't suspend if already suspended or cancelled
  if (subscription.status === SUBSCRIPTION_STATUS.SUSPENDED || 
      subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
    return { should_suspend: false, reason: 'already_suspended', days_overdue: 0 };
  }
  
  // Check if invoice is overdue
  if (invoice.status !== 'overdue' && invoice.status !== 'sent') {
    return { should_suspend: false, reason: null, days_overdue: 0 };
  }
  
  const now = new Date();
  const dueDate = new Date(invoice.due_date);
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  // Suspend after grace period
  if (daysOverdue > GRACE_PERIOD_DAYS.SUSPENSION) {
    return {
      should_suspend: true,
      reason: 'payment_overdue',
      days_overdue: daysOverdue
    };
  }
  
  return { should_suspend: false, reason: null, days_overdue: daysOverdue };
}

// ========== TRIAL CHECKS ==========

/**
 * Check if trial is expired
 * @param {Object} subscription - Subscription object
 * @returns {boolean} Trial expired
 */
export function isTrialExpired(subscription) {
  if (subscription.status !== SUBSCRIPTION_STATUS.TRIAL) return false;
  if (!subscription.trial_ends_at) return false;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trial_ends_at);
  
  return now > trialEnd;
}

/**
 * Get days remaining in trial
 * @param {Object} subscription - Subscription object
 * @returns {number} Days remaining (negative if expired)
 */
export function getDaysRemainingInTrial(subscription) {
  if (!subscription.trial_ends_at) return 0;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trial_ends_at);
  const diff = trialEnd - now;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ========== PERIOD CALCULATIONS ==========

/**
 * Get days remaining in current period
 * @param {Object} subscription - Subscription object
 * @returns {number} Days remaining
 */
export function getDaysRemainingInPeriod(subscription) {
  if (!subscription.current_period_end) return 0;
  
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const diff = periodEnd - now;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if subscription is expiring soon
 * @param {Object} subscription - Subscription object
 * @param {number} daysThreshold - Days threshold (default 7)
 * @returns {boolean} Is expiring soon
 */
export function isExpiringSoon(subscription, daysThreshold = 7) {
  const daysRemaining = getDaysRemainingInPeriod(subscription);
  return daysRemaining <= daysThreshold && daysRemaining > 0;
}

// ========== STATUS CHECKS ==========

/**
 * Get subscription health status
 * @param {Object} subscription - Subscription object
 * @param {Object} invoice - Latest invoice
 * @returns {string} 'healthy' | 'warning' | 'critical'
 */
export function getSubscriptionHealth(subscription, invoice) {
  if (!subscription) return 'critical';
  
  // Trial expired
  if (isTrialExpired(subscription)) return 'critical';
  
  // Suspended
  if (subscription.status === SUBSCRIPTION_STATUS.SUSPENDED) return 'critical';
  
  // Payment overdue
  if (invoice?.status === 'overdue') return 'critical';
  
  // Expiring soon
  if (isExpiringSoon(subscription, 7)) return 'warning';
  
  // All good
  return 'healthy';
}