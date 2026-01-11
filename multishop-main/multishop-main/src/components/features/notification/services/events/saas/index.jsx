
/**
 * SaaS Event Handlers - Public API
 * 
 * Domain: Tenant, Subscription, Billing, Usage
 */

export { registerTenantHandlers, handleNewShopOrder, handleShopCreated, handleShopApproved, handleShopSuspended } from './TenantEventHandler';
export { registerSubscriptionHandlers, handleExpiryWarning, handleSubscriptionExpired, handleSubscriptionRenewed, handleTrialEnding } from './SubscriptionEventHandler';
export { registerUsageHandlers, handleUsageLimitWarning, handleUsageLimitReached } from './UsageEventHandler';

/**
 * Register all SaaS domain handlers (uses static imports from above)
 */
export const registerSaaSHandlers = (registry) => {
  registerTenantHandlers(registry);
  registerSubscriptionHandlers(registry);
  registerUsageHandlers(registry);
  
  // SaaS domain handlers registered
};
