
/**
 * 🏢 SaaS Module - Public API
 * 
 * Multi-tenant SaaS platform features:
 * - Tenant management
 * - Billing & invoicing
 * - Commission processing
 * - Usage metering & enforcement
 * - Subscription lifecycle
 * - Marketplace features
 * 
 * @module features/saas
 */

// ========== TYPES & CONSTANTS ==========
export {
  // Commission
  COMMISSION_STATUS,
  DEFAULT_COMMISSION_RATE,
  
  // Invoice
  INVOICE_STATUS,
  
  // Billing
  BILLING_CYCLE,
  
  // Subscription
  SUBSCRIPTION_STATUS,
  
  // Tenant
  TENANT_STATUS,
  BUSINESS_TYPES,
  INDUSTRIES,
  PAYMENT_MODELS,
  
  // Plans
  PLAN_NAMES,
  PLAN_LIMITS,
  PLAN_PRICES,
  
  // Reminders & Grace Periods
  REMINDER_DAYS,
  GRACE_PERIOD_DAYS,
  
  // Resources & Features
  RESOURCE_TYPES,
  FEATURE_NAMES
} from './types';

// ========== DOMAIN ==========
export * from './domain';

// ========== DATA REPOSITORIES ==========
export {
  tenantRepository,
  subscriptionRepository,
  invoiceRepository,
  commissionRepository,
  usageRepository
} from './data';

// ========== HOOKS ==========
export * from './hooks';

// ========== UI COMPONENTS ==========
export * from './ui';
