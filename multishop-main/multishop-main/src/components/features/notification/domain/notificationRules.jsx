/**
 * Notification Rules - Business rules for notification creation
 */

import { NotificationPriority } from '../types';

/**
 * Can create notification for actor?
 */
export const canCreateNotification = ({ actor, creator, type }) => {
  // Admin can create any notification
  if (creator?.role === 'admin' || creator?.role === 'super_admin') {
    return true;
  }
  
  // Client can only create client notifications
  if (actor === 'client' && creator) {
    return true;
  }
  
  // Tenant owner can create tenant notifications
  if (actor === 'tenant' && creator?.role === 'owner') {
    return true;
  }
  
  // System can create any
  if (creator === 'system') {
    return true;
  }
  
  return false;
};

/**
 * Determine priority based on notification type
 */
export const inferPriority = (type, metadata = {}) => {
  // Urgent types
  const urgentTypes = [
    'payment_verification_needed',
    'out_of_stock',
    'usage_limit_reached'
  ];
  
  if (urgentTypes.includes(type)) {
    return NotificationPriority.URGENT;
  }
  
  // High priority types
  const highTypes = [
    'new_order',
    'new_shop_order',
    'payment_failed',
    'low_stock',
    'harvest_ready',
    'subscription_expiry_warning'
  ];
  
  if (highTypes.includes(type)) {
    return NotificationPriority.HIGH;
  }
  
  // Low priority types
  const lowTypes = [
    'new_customer',
    'achievement',
    'system'
  ];
  
  if (lowTypes.includes(type)) {
    return NotificationPriority.LOW;
  }
  
  // Default: normal
  return NotificationPriority.NORMAL;
};

/**
 * Should require action?
 */
export const shouldRequireAction = (type) => {
  const actionRequiredTypes = [
    'new_order',
    'new_shop_order',
    'payment_verification_needed',
    'low_stock',
    'harvest_upcoming',
    'approval_pending',
    'usage_limit_reached'
  ];
  
  return actionRequiredTypes.includes(type);
};

/**
 * Validate notification data
 */
export const validateNotificationData = (data) => {
  const errors = [];
  
  if (!data.type) errors.push('Type is required');
  if (!data.title) errors.push('Title is required');
  if (!data.message) errors.push('Message is required');
  
  if (data.priority && !Object.values(NotificationPriority).includes(data.priority)) {
    errors.push('Invalid priority');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const notificationRules = {
  canCreateNotification,
  inferPriority,
  shouldRequireAction,
  validateNotificationData
};

export default notificationRules;