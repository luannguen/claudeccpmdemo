/**
 * Event Handlers - Master Index
 * 
 * 6 Domains:
 * - Commerce: Order, Payment, Inventory
 * - Farming: PreOrder, Harvest, Price
 * - Social: Social, Review, Community
 * - CRM: Customer, Referral
 * - SaaS: Tenant, Subscription, Billing, Usage
 * - System: System, Security
 */

// Static imports
export { registerCommerceHandlers } from './commerce';
export { registerFarmingHandlers } from './farming';
export { registerSocialDomainHandlers } from './social';
export { registerCRMHandlers } from './crm';
export { registerSaaSHandlers } from './saas';
export { registerSystemDomainHandlers } from './system';

// Re-export individual handlers for direct use
export * from './commerce';
export * from './farming';
export * from './social';
export * from './crm';
export * from './saas';
export * from './system';

// Import for registerAllHandlers
import { registerCommerceHandlers } from './commerce';
import { registerFarmingHandlers } from './farming';
import { registerSocialDomainHandlers } from './social';
import { registerCRMHandlers } from './crm';
import { registerSaaSHandlers } from './saas';
import { registerSystemDomainHandlers } from './system';

/**
 * Register ALL event handlers
 */
export const registerAllHandlers = (registry) => {
  if (!registry) return;
  
  try { registerCommerceHandlers(registry); } catch {}
  try { registerFarmingHandlers(registry); } catch {}
  try { registerSocialDomainHandlers(registry); } catch {}
  try { registerCRMHandlers(registry); } catch {}
  try { registerSaaSHandlers(registry); } catch {}
  try { registerSystemDomainHandlers(registry); } catch {}
};