/**
 * Bridge Modules - Cross-module integrations
 * 
 * Bridge modules connect features without creating circular dependencies.
 * They only import repositories and core modules, never full services.
 * 
 * @module features/bridges
 */

export { default as checkoutReferralBridge } from './checkoutReferralBridge';
export { default as checkoutLoyaltyBridge } from './checkoutLoyaltyBridge';

// Re-export specific functions for convenience
export { applyReferralToOrder, handleOrderReturnRefund } from './checkoutReferralBridge';
export { applyLoyaltyToOrder, redeemLoyaltyPoints, finalizeLoyaltyRedemption } from './checkoutLoyaltyBridge';