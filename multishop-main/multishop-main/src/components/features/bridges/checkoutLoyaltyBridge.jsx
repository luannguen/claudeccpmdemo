/**
 * Checkout ↔ Loyalty Bridge
 * Bridge Module - Connects checkout and loyalty without circular dependency
 * 
 * KHÔNG import CheckoutService hay LoyaltyService
 * Chỉ import repositories và core modules
 * 
 * @module features/bridges/checkoutLoyaltyBridge
 */

import { orderRepository } from '@/components/features/checkout/data';
import { base44 } from '@/api/base44Client';
import loyaltyCore from '@/components/services/loyaltyCore';

/**
 * Apply loyalty points after order completion
 * @param {Object} order - Created order
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Object>} { success: boolean, pointsAwarded?: number }
 */
export async function applyLoyaltyToOrder(order, customerEmail) {
  try {
    // Get customer's loyalty account
    const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: customerEmail });
    
    if (accounts.length === 0) {
      // Create new loyalty account
      const newAccount = await base44.entities.LoyaltyAccount.create({
        user_email: customerEmail,
        current_points: 0,
        lifetime_points: 0,
        current_tier: 'basic',
        total_spent: 0
      });
      accounts.push(newAccount);
    }
    
    const account = accounts[0];
    
    // Calculate points to award
    const pointsToAward = loyaltyCore.calculatePointsFromOrder(order, account.current_tier);
    
    // Update loyalty account
    await base44.entities.LoyaltyAccount.update(account.id, {
      current_points: (account.current_points || 0) + pointsToAward,
      lifetime_points: (account.lifetime_points || 0) + pointsToAward,
      total_spent: (account.total_spent || 0) + order.total_amount
    });
    
    // Check tier upgrade
    await loyaltyCore.checkAndUpgradeTier(account.id);
    
    console.log(`✅ Loyalty points awarded: ${pointsToAward} points to ${customerEmail}`);
    return { success: true, pointsAwarded: pointsToAward };
    
  } catch (err) {
    console.error('Error applying loyalty:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Redeem loyalty points for discount
 * @param {string} customerEmail
 * @param {number} pointsToRedeem
 * @returns {Promise<Object>} { success: boolean, discountAmount?: number }
 */
export async function redeemLoyaltyPoints(customerEmail, pointsToRedeem) {
  try {
    const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: customerEmail });
    if (accounts.length === 0) {
      return { success: false, message: 'No loyalty account found' };
    }
    
    const account = accounts[0];
    
    if (account.current_points < pointsToRedeem) {
      return { success: false, message: 'Insufficient points' };
    }
    
    // Calculate discount (e.g., 100 points = 10,000 VND)
    const discountAmount = loyaltyCore.convertPointsToDiscount(pointsToRedeem);
    
    // Deduct points (will be finalized after order completion)
    return { success: true, discountAmount, pointsToDeduct: pointsToRedeem };
    
  } catch (err) {
    console.error('Error redeeming points:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Finalize loyalty points deduction after successful order
 * @param {string} customerEmail
 * @param {number} pointsToDeduct
 */
export async function finalizeLoyaltyRedemption(customerEmail, pointsToDeduct) {
  try {
    const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: customerEmail });
    if (accounts.length === 0) return { success: false };
    
    const account = accounts[0];
    
    await base44.entities.LoyaltyAccount.update(account.id, {
      current_points: Math.max(0, (account.current_points || 0) - pointsToDeduct)
    });
    
    return { success: true };
  } catch (err) {
    console.error('Error finalizing loyalty redemption:', err);
    return { success: false };
  }
}

export default {
  applyLoyaltyToOrder,
  redeemLoyaltyPoints,
  finalizeLoyaltyRedemption
};