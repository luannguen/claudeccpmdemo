
/**
 * CRM Event Handlers - Public API
 * 
 * Domain: Customer, Referral
 */

export { registerCustomerHandlers, handleCustomerRegistered, handleCustomerFirstOrder, handleCustomerMilestone } from './CustomerEventHandler';
export { registerReferralHandlers, handleCommissionEarned, handleRankUpgraded, handleMemberApproved, handleMemberSuspended, handleCommissionPaid, handleCustomerClaimed } from './ReferralEventHandler';

/**
 * Register all CRM domain handlers (uses static imports from above)
 */
export const registerCRMHandlers = (registry) => {
  registerCustomerHandlers(registry);
  registerReferralHandlers(registry);
  
  // CRM domain handlers registered
};
