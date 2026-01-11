/**
 * Notification Types - Enums and Constants
 */

// ========== CLIENT NOTIFICATION TYPES ==========
export const ClientNotificationTypes = {
  // Order
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPING: 'order_shipping',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Payment
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  DEPOSIT_RECEIVED: 'deposit_received',
  FINAL_PAYMENT_REMINDER: 'final_payment_reminder',
  
  // Pre-Order
  HARVEST_REMINDER: 'harvest_reminder',
  HARVEST_READY: 'harvest_ready',
  
  // Social
  LIKE: 'like',
  COMMENT: 'comment',
  MENTION: 'mention',
  FOLLOW: 'follow',
  REPLY: 'reply',
  
  // System
  ACHIEVEMENT: 'achievement',
  PROMO: 'promo',
  SYSTEM: 'system'
};

// ========== ADMIN NOTIFICATION TYPES ==========
export const AdminNotificationTypes = {
  // Order
  NEW_ORDER: 'new_order',
  ORDER_STATUS_CHANGE: 'order_status_change',
  
  // Payment
  PAYMENT_VERIFICATION_NEEDED: 'payment_verification_needed',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  DEPOSIT_RECEIVED: 'deposit_received',
  FINAL_PAYMENT_PENDING: 'final_payment_pending',
  
  // Inventory
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  
  // Pre-Order
  HARVEST_UPCOMING: 'harvest_upcoming',
  HARVEST_READY: 'harvest_ready',
  
  // Customer
  NEW_CUSTOMER: 'new_customer',
  NEW_REVIEW: 'new_review',
  
  // System
  SYSTEM_ALERT: 'system_alert'
};

// ========== TENANT NOTIFICATION TYPES (NEW) ==========
export const TenantNotificationTypes = {
  // Shop Orders
  NEW_SHOP_ORDER: 'new_shop_order',
  SHOP_ORDER_CANCELLED: 'shop_order_cancelled',
  
  // Commission & Billing
  COMMISSION_UPDATE: 'commission_update',
  COMMISSION_PAYOUT: 'commission_payout',
  INVOICE_GENERATED: 'invoice_generated',
  PAYMENT_DUE: 'payment_due',
  
  // Subscription
  SUBSCRIPTION_EXPIRY_WARNING: 'subscription_expiry_warning',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  TRIAL_ENDING: 'trial_ending',
  
  // Usage Limits
  USAGE_LIMIT_WARNING: 'usage_limit_warning',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
  
  // Approval
  APPROVAL_PENDING: 'approval_pending',
  APPROVAL_APPROVED: 'approval_approved',
  APPROVAL_REJECTED: 'approval_rejected',
  
  // System
  TENANT_SYSTEM_ALERT: 'tenant_system_alert'
};

// ========== UNIFIED TYPE MAP ==========
export const NotificationTypesByActor = {
  client: ClientNotificationTypes,
  admin: AdminNotificationTypes,
  tenant: TenantNotificationTypes
};

// ========== TYPE CONFIGS (for UI) ==========
export const NotificationTypeConfig = {
  // Client
  [ClientNotificationTypes.ORDER_CONFIRMED]: {
    label: 'Đơn hàng xác nhận',
    icon: 'CheckCircle',
    color: 'green'
  },
  [ClientNotificationTypes.ORDER_SHIPPING]: {
    label: 'Đang giao hàng',
    icon: 'Package',
    color: 'blue'
  },
  [ClientNotificationTypes.PAYMENT_SUCCESS]: {
    label: 'Thanh toán thành công',
    icon: 'CreditCard',
    color: 'green'
  },
  
  // Admin
  [AdminNotificationTypes.NEW_ORDER]: {
    label: 'Đơn hàng mới',
    icon: 'ShoppingCart',
    color: 'blue'
  },
  [AdminNotificationTypes.PAYMENT_VERIFICATION_NEEDED]: {
    label: 'Cần xác minh TT',
    icon: 'CreditCard',
    color: 'orange'
  },
  [AdminNotificationTypes.LOW_STOCK]: {
    label: 'Sắp hết hàng',
    icon: 'TrendingDown',
    color: 'orange'
  },
  
  // Tenant
  [TenantNotificationTypes.NEW_SHOP_ORDER]: {
    label: 'Đơn mới từ shop',
    icon: 'Store',
    color: 'blue'
  },
  [TenantNotificationTypes.COMMISSION_PAYOUT]: {
    label: 'Nhận hoa hồng',
    icon: 'DollarSign',
    color: 'green'
  },
  [TenantNotificationTypes.USAGE_LIMIT_WARNING]: {
    label: 'Sắp đạt giới hạn',
    icon: 'AlertTriangle',
    color: 'orange'
  }
};