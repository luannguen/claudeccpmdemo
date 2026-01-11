/**
 * Event Types - Event name constants cho notification system
 * 
 * Pattern: domain.action
 * VD: order.created, payment.confirmed, harvest.ready
 */

// ========== ORDER EVENTS ==========
export const OrderEvents = {
  CREATED: 'order.created',
  CONFIRMED: 'order.confirmed',
  PROCESSING: 'order.processing',
  SHIPPED: 'order.shipped',
  DELIVERED: 'order.delivered',
  CANCELLED: 'order.cancelled',
  RETURNED: 'order.returned'
};

// ========== PAYMENT EVENTS ==========
export const PaymentEvents = {
  VERIFICATION_NEEDED: 'payment.verification_needed',
  CONFIRMED: 'payment.confirmed',
  FAILED: 'payment.failed',
  DEPOSIT_RECEIVED: 'payment.deposit_received',
  DEPOSIT_REMINDER: 'payment.deposit_reminder',
  REFUNDED: 'payment.refunded'
};

// ========== PRE-ORDER EVENTS ==========
export const PreOrderEvents = {
  CREATED: 'preorder.created',
  LOT_SOLD_OUT: 'preorder.lot_sold_out',
  CANCELLATION_REQUESTED: 'preorder.cancellation_requested'
};

// ========== HARVEST EVENTS ==========
export const HarvestEvents = {
  REMINDER: 'harvest.reminder',           // 3-5 days before
  READY: 'harvest.ready',                 // Just harvested
  UPCOMING: 'harvest.upcoming',           // Admin alert
  FINAL_PAYMENT_REMINDER: 'harvest.final_payment_reminder'
};

// ========== PRICE EVENTS ==========
export const PriceEvents = {
  FOMO: 'price.fomo',                     // Price about to increase
  INCREASED: 'price.increased'            // Price just increased
};

// ========== INVENTORY EVENTS ==========
export const InventoryEvents = {
  LOW_STOCK: 'stock.low',
  OUT_OF_STOCK: 'stock.out',
  RESTOCKED: 'stock.restocked',
  ADJUSTED: 'stock.adjusted'
};

// ========== CUSTOMER EVENTS ==========
export const CustomerEvents = {
  REGISTERED: 'customer.registered',
  FIRST_ORDER: 'customer.first_order',
  MILESTONE: 'customer.milestone',
  PROFILE_UPDATED: 'customer.profile_updated'
};

// ========== SOCIAL EVENTS ==========
export const SocialEvents = {
  POST_LIKED: 'social.post_liked',
  POST_COMMENTED: 'social.post_commented',
  USER_MENTIONED: 'social.user_mentioned',
  USER_FOLLOWED: 'social.user_followed',
  COMMENT_REPLIED: 'social.comment_replied'
};

// ========== REVIEW EVENTS ==========
export const ReviewEvents = {
  CREATED: 'review.created',
  APPROVED: 'review.approved',
  REJECTED: 'review.rejected',
  RESPONSE_ADDED: 'review.response_added'
};

// ========== REFERRAL EVENTS ==========
export const ReferralEvents = {
  MEMBER_REGISTERED: 'referral.member_registered',
  MEMBER_APPROVED: 'referral.member_approved',
  MEMBER_SUSPENDED: 'referral.member_suspended',
  COMMISSION_EARNED: 'referral.commission_earned',
  COMMISSION_PAID: 'referral.commission_paid',
  RANK_UPGRADED: 'referral.rank_upgraded',
  CUSTOMER_CLAIMED: 'referral.customer_claimed'
};

// ========== TENANT EVENTS ==========
export const TenantEvents = {
  SHOP_CREATED: 'tenant.shop_created',
  SHOP_APPROVED: 'tenant.shop_approved',
  SHOP_SUSPENDED: 'tenant.shop_suspended',
  NEW_SHOP_ORDER: 'tenant.new_shop_order'
};

// ========== SUBSCRIPTION EVENTS ==========
export const SubscriptionEvents = {
  CREATED: 'subscription.created',
  RENEWED: 'subscription.renewed',
  EXPIRY_WARNING: 'subscription.expiry_warning',
  EXPIRED: 'subscription.expired',
  CANCELLED: 'subscription.cancelled',
  TRIAL_ENDING: 'subscription.trial_ending'
};

// ========== BILLING EVENTS ==========
export const BillingEvents = {
  INVOICE_GENERATED: 'billing.invoice_generated',
  INVOICE_OVERDUE: 'billing.invoice_overdue',
  PAYMENT_RECEIVED: 'billing.payment_received',
  COMMISSION_PAYOUT: 'billing.commission_payout'
};

// ========== USAGE EVENTS ==========
export const UsageEvents = {
  LIMIT_WARNING: 'usage.limit_warning',
  LIMIT_REACHED: 'usage.limit_reached'
};

// ========== COMMUNITY EVENTS ==========
export const CommunityEvents = {
  BOOK_PUBLISHED: 'community.book_published',
  CHAPTER_ADDED: 'community.chapter_added',
  CONTRIBUTOR_INVITED: 'community.contributor_invited',
  DISCUSSION_REPLIED: 'community.discussion_replied',
  COLLECTION_UPDATED: 'community.collection_updated'
};

// ========== SYSTEM EVENTS ==========
export const SystemEvents = {
  MAINTENANCE: 'system.maintenance',
  ALERT: 'system.alert',
  FEATURE_ANNOUNCEMENT: 'system.feature_announcement'
};

// ========== SECURITY EVENTS ==========
export const SecurityEvents = {
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  FRAUD_DETECTED: 'security.fraud_detected',
  PASSWORD_CHANGED: 'security.password_changed',
  NEW_DEVICE_LOGIN: 'security.new_device_login'
};

// ========== UNIFIED MAP ==========
export const AllEvents = {
  ...OrderEvents,
  ...PaymentEvents,
  ...PreOrderEvents,
  ...HarvestEvents,
  ...PriceEvents,
  ...InventoryEvents,
  ...CustomerEvents,
  ...SocialEvents,
  ...ReviewEvents,
  ...ReferralEvents,
  ...TenantEvents,
  ...SubscriptionEvents,
  ...BillingEvents,
  ...UsageEvents,
  ...CommunityEvents,
  ...SystemEvents,
  ...SecurityEvents
};

// ========== EVENT CATEGORIES ==========
export const EventCategories = {
  COMMERCE: 'commerce',     // Order, Payment, Inventory
  FARMING: 'farming',       // PreOrder, Harvest, Price
  SOCIAL: 'social',         // Social, Review, Community
  CRM: 'crm',              // Customer, Referral
  SAAS: 'saas',            // Tenant, Subscription, Billing, Usage
  SYSTEM: 'system'         // System, Security
};

// ========== EVENT → CATEGORY MAPPING ==========
export const getEventCategory = (eventName) => {
  if (eventName.startsWith('order.') || eventName.startsWith('payment.') || eventName.startsWith('stock.')) {
    return EventCategories.COMMERCE;
  }
  if (eventName.startsWith('preorder.') || eventName.startsWith('harvest.') || eventName.startsWith('price.')) {
    return EventCategories.FARMING;
  }
  if (eventName.startsWith('social.') || eventName.startsWith('review.') || eventName.startsWith('community.')) {
    return EventCategories.SOCIAL;
  }
  if (eventName.startsWith('customer.') || eventName.startsWith('referral.')) {
    return EventCategories.CRM;
  }
  if (eventName.startsWith('tenant.') || eventName.startsWith('subscription.') || eventName.startsWith('billing.') || eventName.startsWith('usage.')) {
    return EventCategories.SAAS;
  }
  if (eventName.startsWith('system.') || eventName.startsWith('security.')) {
    return EventCategories.SYSTEM;
  }
  return null;
};