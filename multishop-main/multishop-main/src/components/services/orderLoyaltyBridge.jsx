/**
 * Order ↔ Loyalty Bridge
 * 
 * Logic kết nối Order và Loyalty - tránh circular dependency
 */

import { base44 } from '@/api/base44Client';
import loyaltyService from './LoyaltyService';

/**
 * Xử lý loyalty khi order hoàn thành
 */
export async function processLoyaltyOnOrderComplete(orderId) {
  try {
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length === 0) return { success: false, error: 'Order not found' };
    
    const order = orders[0];
    
    // Đã xử lý rồi thì skip
    if (order.loyalty_processed) {
      return { success: true, skipped: true };
    }
    
    // Tích điểm
    const earnResult = await loyaltyService.earnPointsFromOrder(
      orderId,
      order.customer_email,
      order.customer_name,
      order.total_amount
    );
    
    if (!earnResult.success) {
      return { success: false, error: earnResult.message };
    }
    
    // Confirm redeem nếu có dùng điểm
    if (order.loyalty_points_used > 0) {
      const accounts = await base44.entities.LoyaltyAccount.filter({ user_email: order.customer_email });
      if (accounts.length > 0) {
        await loyaltyService.confirmRedemption(accounts[0].id, order.loyalty_points_used, orderId);
      }
    }
    
    return { success: true, earnedPoints: earnResult.data.earnedPoints };
  } catch (error) {
    console.error('Error processing loyalty on order complete:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply loyalty discount khi checkout
 */
export async function applyLoyaltyDiscount(customerEmail, pointsToUse, orderAmount) {
  const result = await loyaltyService.redeemPoints(customerEmail, pointsToUse, orderAmount);
  
  if (!result.success) {
    return { success: false, error: result.message };
  }
  
  return { 
    success: true, 
    discountAmount: result.data.discountAmount,
    pointsToRedeem: result.data.pointsToRedeem 
  };
}

export default {
  processLoyaltyOnOrderComplete,
  applyLoyaltyDiscount
};