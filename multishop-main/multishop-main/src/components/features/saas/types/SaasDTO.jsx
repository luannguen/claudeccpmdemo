/**
 * SaaS Module - Type Definitions & Constants
 * 
 * All DTOs, constants, and type definitions for the SaaS module.
 * 
 * @module features/saas/types
 */

// ========== COMMISSION CONSTANTS ==========

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

export const DEFAULT_COMMISSION_RATE = 3; // 3%

// ========== INVOICE CONSTANTS ==========

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// ========== BILLING CYCLE ==========

export const BILLING_CYCLE = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// ========== SUBSCRIPTION STATUS ==========

export const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

// ========== TENANT STATUS ==========

export const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

// ========== BUSINESS TYPES ==========

export const BUSINESS_TYPES = {
  FARM: 'farm',
  COOPERATIVE: 'cooperative',
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer',
  RESTAURANT: 'restaurant'
};

// ========== INDUSTRIES ==========

export const INDUSTRIES = {
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  LIVESTOCK: 'livestock',
  SEAFOOD: 'seafood',
  MIXED: 'mixed'
};

// ========== PAYMENT MODELS ==========

export const PAYMENT_MODELS = {
  COMMISSION: 'commission',
  SUBSCRIPTION: 'subscription',
  HYBRID: 'hybrid'
};

// ========== PLAN NAMES ==========

export const PLAN_NAMES = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// ========== PLAN LIMITS ==========

export const PLAN_LIMITS = {
  [PLAN_NAMES.FREE]: {
    max_products: 50,
    max_orders_per_month: 100,
    max_customers: 200,
    max_storage_mb: 100,
    max_users: 1,
    features: ['basic_reports', 'email_support']
  },
  [PLAN_NAMES.STARTER]: {
    max_products: 200,
    max_orders_per_month: 500,
    max_customers: 1000,
    max_storage_mb: 500,
    max_users: 3,
    features: ['basic_reports', 'email_support', 'priority_support', 'custom_domain']
  },
  [PLAN_NAMES.PRO]: {
    max_products: 1000,
    max_orders_per_month: 2000,
    max_customers: 5000,
    max_storage_mb: 2000,
    max_users: 10,
    features: ['advanced_reports', 'priority_support', 'custom_domain', 'api_access', 'white_label']
  },
  [PLAN_NAMES.ENTERPRISE]: {
    max_products: -1, // unlimited
    max_orders_per_month: -1,
    max_customers: -1,
    max_storage_mb: -1,
    max_users: -1,
    features: ['advanced_reports', 'priority_support', 'custom_domain', 'api_access', 'white_label', 'dedicated_support', 'sla']
  }
};

// ========== PLAN PRICES (VND) ==========

export const PLAN_PRICES = {
  [PLAN_NAMES.FREE]: {
    monthly: 0,
    quarterly: 0,
    yearly: 0
  },
  [PLAN_NAMES.STARTER]: {
    monthly: 199000,
    quarterly: 499000,
    yearly: 1990000
  },
  [PLAN_NAMES.PRO]: {
    monthly: 499000,
    quarterly: 1290000,
    yearly: 4990000
  },
  [PLAN_NAMES.ENTERPRISE]: {
    monthly: 1500000,
    quarterly: 4200000,
    yearly: 15000000
  }
};

// ========== REMINDER DAYS ==========

export const REMINDER_DAYS = [7, 3, 1];

// ========== GRACE PERIODS ==========

export const GRACE_PERIOD_DAYS = {
  OVERDUE_WARNING: 3,
  SUSPENSION: 7
};

// ========== RESOURCE TYPES ==========

export const RESOURCE_TYPES = {
  PRODUCTS: 'products',
  ORDERS: 'orders_per_month',
  CUSTOMERS: 'customers',
  STORAGE: 'storage_mb',
  USERS: 'users'
};

// ========== FEATURE NAMES ==========

export const FEATURE_NAMES = {
  BASIC_REPORTS: 'basic_reports',
  ADVANCED_REPORTS: 'advanced_reports',
  EMAIL_SUPPORT: 'email_support',
  PRIORITY_SUPPORT: 'priority_support',
  DEDICATED_SUPPORT: 'dedicated_support',
  CUSTOM_DOMAIN: 'custom_domain',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  SLA: 'sla'
};

/**
 * @typedef {Object} TenantDTO
 * @property {string} id
 * @property {string} organization_name
 * @property {string} slug
 * @property {string} owner_email
 * @property {string} owner_name
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} business_type
 * @property {string} industry
 * @property {string} subscription_plan
 * @property {string} subscription_status
 * @property {number} commission_rate
 * @property {number} [custom_commission_rate]
 * @property {Object} usage
 * @property {Object} limits
 * @property {string} status
 */

/**
 * @typedef {Object} SubscriptionDTO
 * @property {string} id
 * @property {string} tenant_id
 * @property {string} plan_name
 * @property {string} billing_cycle
 * @property {number} price
 * @property {string} status
 * @property {string} [trial_ends_at]
 * @property {string} current_period_start
 * @property {string} current_period_end
 * @property {Object} features
 */

/**
 * @typedef {Object} InvoiceDTO
 * @property {string} id
 * @property {string} tenant_id
 * @property {string} subscription_id
 * @property {string} invoice_number
 * @property {string} invoice_date
 * @property {string} due_date
 * @property {number} subtotal
 * @property {number} tax_amount
 * @property {number} total_amount
 * @property {string} status
 * @property {string} [paid_date]
 */

/**
 * @typedef {Object} CommissionDTO
 * @property {string} id
 * @property {string} order_id
 * @property {string} shop_id
 * @property {number} order_amount
 * @property {number} commission_rate
 * @property {number} commission_amount
 * @property {number} shop_revenue
 * @property {string} status
 * @property {string} period_month
 */

/**
 * @typedef {Object} UsageSummaryDTO
 * @property {string} tenant_id
 * @property {string} plan_name
 * @property {Object} resources
 * @property {string[]} features
 * @property {number} overall_percentage
 */

/**
 * @typedef {Object} LimitCheckResult
 * @property {boolean} canProceed
 * @property {number} usage
 * @property {number|string} limit
 * @property {number} percentage
 * @property {number} remaining
 * @property {boolean} isNearLimit
 * @property {boolean} isAtLimit
 * @property {boolean} isUnlimited
 */

/**
 * @typedef {Object} UpgradeSuggestion
 * @property {string} current_plan
 * @property {string} suggested_plan
 * @property {Array<{resource: string, percentage: number, remaining: number}>} reasons
 * @property {number} price_difference
 */

/**
 * @typedef {Object} BillingAnalytics
 * @property {string} period
 * @property {number} total_invoices
 * @property {number} total_revenue
 * @property {number} total_pending
 * @property {number} total_overdue
 * @property {number} paid_count
 * @property {number} pending_count
 * @property {number} overdue_count
 * @property {number} collection_rate
 */

/**
 * @typedef {Object} CommissionAnalytics
 * @property {string} period
 * @property {number} total_commissions
 * @property {number} total_revenue
 * @property {number} total_commission_amount
 * @property {number} total_pending
 * @property {number} total_approved
 * @property {number} total_paid
 * @property {number} shops_count
 * @property {Array<Object>} by_shop
 */

/**
 * @typedef {Object} CommissionCalculation
 * @property {number} commission_rate
 * @property {number} commission_amount
 * @property {number} shop_revenue
 */