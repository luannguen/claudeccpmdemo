/**
 * 📧 Email Module - Event Payload Schemas
 * 
 * Định nghĩa event types và payload schemas cho email automation.
 * Events này được publish từ modules khác → Email module subscribe.
 */

/**
 * @typedef {Object} OrderPlacedEvent
 * @property {string} orderId - Order ID
 * @property {string} orderNumber - Order number for display
 * @property {string} customerEmail - Customer email
 * @property {string} customerName - Customer name
 * @property {string} customerPhone - Customer phone
 * @property {number} totalAmount - Total order amount
 * @property {Array} items - Order items
 * @property {string} shippingAddress - Shipping address
 * @property {string} paymentMethod - Payment method
 * @property {Date|string} createdDate - Order creation date
 */

/**
 * @typedef {Object} OrderStatusChangedEvent
 * @property {string} orderId - Order ID
 * @property {string} orderNumber - Order number
 * @property {string} customerEmail - Customer email
 * @property {string} customerName - Customer name
 * @property {string} oldStatus - Previous status
 * @property {string} newStatus - New status
 * @property {Object} order - Full order object (for email details)
 */

/**
 * @typedef {Object} PaymentConfirmedEvent
 * @property {string} orderId - Order ID
 * @property {string} orderNumber - Order number
 * @property {string} customerEmail - Customer email
 * @property {string} customerName - Customer name
 * @property {number} amount - Payment amount
 * @property {string} paymentMethod - Payment method
 * @property {Object} order - Full order object
 */

/**
 * @typedef {Object} PaymentFailedEvent
 * @property {string} orderId - Order ID
 * @property {string} orderNumber - Order number
 * @property {string} customerEmail - Customer email
 * @property {string} customerName - Customer name
 * @property {number} amount - Payment amount
 * @property {string} reason - Failure reason
 * @property {Object} order - Full order object
 */

/**
 * @typedef {Object} CartAbandonedEvent
 * @property {string} cartId - Cart ID
 * @property {string} userEmail - User email
 * @property {Array} items - Cart items
 * @property {number} subtotal - Cart subtotal
 * @property {Date|string} lastActivity - Last activity timestamp
 */

/**
 * @typedef {Object} HarvestReadyEvent
 * @property {string} lotId - Product lot ID
 * @property {string} lotName - Lot name
 * @property {string} productName - Product name
 * @property {Array<{orderId: string, customerEmail: string, customerName: string}>} affectedOrders
 */

/**
 * @typedef {Object} UserRegisteredEvent
 * @property {string} userId - User ID
 * @property {string} email - User email
 * @property {string} fullName - User full name
 * @property {Date|string} registeredDate - Registration date
 */

/**
 * @typedef {Object} ReferralCommissionEarnedEvent
 * @property {string} memberId - Referral member ID
 * @property {string} memberEmail - Member email
 * @property {string} memberName - Member name
 * @property {number} commissionAmount - Commission earned
 * @property {string} referredCustomer - Name of referred customer
 * @property {string} orderId - Related order ID
 */

/**
 * Email event types registry
 * 
 * ✅ Updated v2.6.0 - Added Security, Refund, PreOrder Advanced, Loyalty, SaaS events
 */
export const EMAIL_EVENT_TYPES = {
  // ========== ORDER EVENTS ==========
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  
  // ========== PAYMENT EVENTS ==========
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  DEPOSIT_RECEIVED: 'DEPOSIT_RECEIVED',
  
  // ========== REFUND EVENTS (NEW) ==========
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  REFUND_APPROVED: 'REFUND_APPROVED',
  REFUND_SUCCEEDED: 'REFUND_SUCCEEDED',
  
  // ========== CART EVENTS ==========
  CART_ABANDONED: 'CART_ABANDONED',
  
  // ========== PREORDER EVENTS ==========
  HARVEST_READY: 'HARVEST_READY',
  HARVEST_REMINDER: 'HARVEST_REMINDER',
  PRICE_CHANGED: 'PRICE_CHANGED',
  LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  PREORDER_DELAYED: 'PREORDER_DELAYED',
  PREORDER_CANCELLED: 'PREORDER_CANCELLED',
  DEPOSIT_EXPIRED: 'DEPOSIT_EXPIRED',
  
  // ========== USER EVENTS ==========
  USER_REGISTERED: 'USER_REGISTERED',
  
  // ========== SECURITY EVENTS (NEW) ==========
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  NEW_DEVICE_LOGIN: 'NEW_DEVICE_LOGIN',
  
  // ========== LOYALTY EVENTS (NEW) ==========
  POINTS_EXPIRING_SOON: 'POINTS_EXPIRING_SOON',
  TIER_UPGRADED: 'TIER_UPGRADED',
  
  // ========== REFERRAL EVENTS ==========
  REFERRAL_COMMISSION_EARNED: 'REFERRAL_COMMISSION_EARNED',
  REFERRAL_RANK_UP: 'REFERRAL_RANK_UP',
  
  // ========== SAAS EVENTS (NEW) ==========
  MEMBER_INVITED: 'MEMBER_INVITED',
  SUBSCRIPTION_PAYMENT_FAILED: 'SUBSCRIPTION_PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRY_WARNING: 'SUBSCRIPTION_EXPIRY_WARNING',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  
  // ========== REVIEW EVENTS (NEW) ==========
  REVIEW_RESPONSE_ADDED: 'REVIEW_RESPONSE_ADDED'
};

/**
 * Event to email type mapping
 * 
 * ✅ Updated v2.6.0 - Added new email types
 */
export const EVENT_EMAIL_TYPE_MAP = {
  // Order
  ORDER_PLACED: 'order_confirmation',
  ORDER_SHIPPED: 'shipping_notification',
  ORDER_DELIVERED: 'delivery_confirmation',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Payment
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Refund (NEW)
  REFUND_REQUESTED: 'refund_requested',
  REFUND_APPROVED: 'refund_approved',
  REFUND_SUCCEEDED: 'refund_succeeded',
  
  // Cart
  CART_ABANDONED: 'cart_recovery',
  
  // PreOrder
  HARVEST_READY: 'harvest_ready',
  HARVEST_REMINDER: 'harvest_reminder',
  DEPOSIT_RECEIVED: 'deposit_reminder',
  PREORDER_DELAYED: 'preorder_delayed',
  PREORDER_CANCELLED: 'preorder_cancelled',
  DEPOSIT_EXPIRED: 'deposit_expired',
  
  // User
  USER_REGISTERED: 'welcome_email',
  
  // Security (NEW)
  PASSWORD_CHANGED: 'security_password_changed',
  PASSWORD_RESET_REQUESTED: 'security_password_reset',
  NEW_DEVICE_LOGIN: 'security_new_device',
  
  // Loyalty (NEW)
  POINTS_EXPIRING_SOON: 'loyalty_points_expiring',
  TIER_UPGRADED: 'loyalty_tier_upgraded',
  
  // Referral
  REFERRAL_COMMISSION_EARNED: 'referral_commission',
  REFERRAL_RANK_UP: 'referral_welcome',
  
  // SaaS (NEW)
  MEMBER_INVITED: 'saas_member_invited',
  SUBSCRIPTION_PAYMENT_FAILED: 'saas_payment_failed',
  SUBSCRIPTION_EXPIRY_WARNING: 'saas_expiry_warning',
  INVOICE_GENERATED: 'saas_invoice',
  
  // Review (NEW)
  REVIEW_RESPONSE_ADDED: 'review_response'
};

export default {
  EMAIL_EVENT_TYPES,
  EVENT_EMAIL_TYPE_MAP
};