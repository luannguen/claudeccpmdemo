/**
 * Checkout ↔ Referral Bridge
 * Bridge Module - Connects checkout and referral without circular dependency
 * 
 * KHÔNG import CheckoutService hay ReferralService
 * Chỉ import repositories và core modules
 * 
 * @module features/bridges/checkoutReferralBridge
 */

import { orderRepository } from '@/components/features/checkout/data';
import { base44 } from '@/api/base44Client';
import { 
  memberRepository, 
  eventRepository, 
  settingRepository,
  auditRepository,
  calculateOrderCommission,
  normalizeCode
} from '@/components/features/referral';
import TierAlertService from '@/components/services/TierAlertService';
import CommissionReversalService from '@/components/services/CommissionReversalService';

/**
 * Apply referral code to order after creation
 * @param {Object} order - Created order
 * @param {string} customerEmail - Customer email
 * @param {string} referralCode - Referral code
 * @returns {Promise<Object>} { success: boolean, event?, commission?, message? }
 */
export async function applyReferralToOrder(order, customerEmail, referralCode) {
  if (!referralCode) {
    return { success: false, message: 'No referral code' };
  }

  try {
    // Validate referral code
    const normalized = normalizeCode(referralCode);
    const referrer = await memberRepository.getActiveByCode(normalized);
    
    if (!referrer) {
      console.warn('Invalid referral code:', referralCode);
      return { success: false, message: 'Mã giới thiệu không hợp lệ' };
    }

    // Prevent self-referral
    if (customerEmail === referrer.user_email) {
      console.warn('Self-referral blocked:', customerEmail);
      return { success: false, message: 'Self-referral not allowed' };
    }

    // Apply referral to customer
    const customers = await base44.entities.Customer.filter({ email: customerEmail });
    if (customers.length === 0 || !customers[0].referral_locked) {
      if (customers.length > 0) {
        await base44.entities.Customer.update(customers[0].id, {
          referrer_id: referrer.id,
          referral_code_used: referralCode,
          referred_date: new Date().toISOString(),
          is_referred_customer: true,
          customer_source: 'referral'
        });
      }
      
      // Update referrer count
      await base44.entities.ReferralMember.update(referrer.id, {
        total_referred_customers: (referrer.total_referred_customers || 0) + 1
      });
      
      console.log('✅ Referral applied to customer:', customerEmail);
    }

    // Calculate commission
    const settings = await settingRepository.getMainSettings();
    const tiers = settings.commission_tiers;
    const rankBonus = referrer.seeder_rank_bonus || 0;
    const customRate = referrer.custom_rate_enabled ? referrer.custom_commission_rate : null;
    
    // Get current month revenue
    const currentMonthEvents = await eventRepository.listCurrentMonthByReferrer(referrer.id);
    const currentMonthRevenue = currentMonthEvents.reduce((sum, e) => sum + (e.order_amount || 0), 0);
    
    const commission = calculateOrderCommission({
      orderAmount: order.total_amount,
      currentMonthRevenue,
      tiers,
      rankBonus,
      customRate
    });
    
    if (!commission) {
      return { success: false, message: 'Commission calculation failed' };
    }

    // Create ReferralEvent
    const event = await eventRepository.create({
      referrer_id: referrer.id,
      referrer_email: referrer.user_email,
      referrer_name: referrer.full_name,
      referred_customer_email: order.customer_email,
      referred_customer_name: order.customer_name,
      referred_customer_phone: order.customer_phone,
      order_id: order.id,
      order_number: order.order_number,
      order_amount: order.total_amount,
      commission_tier: commission.commission_tier,
      commission_rate: commission.commission_rate,
      commission_amount: commission.commission_amount,
      event_type: 'subsequent_purchase',
      status: 'calculated',
      calculation_date: new Date().toISOString(),
      period_month: new Date().toISOString().slice(0, 7)
    });

    // Update referrer stats
    await memberRepository.updateCommissionStats(
      referrer.id,
      commission.commission_amount,
      order.total_amount,
      commission.current_month_revenue
    );

    // Mark order as commission calculated
    await orderRepository.updateOrder(order.id, {
      referral_commission_calculated: true
    });

    // Commission log
    await auditRepository.createCommissionLog({
      referrer_id: referrer.id,
      referrer_email: referrer.user_email,
      event_id: event.id,
      order_id: order.id,
      change_type: 'commission_earned',
      affected_amount: commission.commission_amount,
      balance_before: referrer.unpaid_commission || 0,
      balance_after: (referrer.unpaid_commission || 0) + commission.commission_amount,
      triggered_by: 'system',
      triggered_by_role: 'system',
      reason: 'Order commission calculated',
      metadata: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        commission_rate: commission.commission_rate
      }
    });

    // Check tier progress
    await TierAlertService.checkTierProgress(referrer.id, commission.current_month_revenue);

    // Lock customer after first order
    if (customers.length > 0 && !customers[0].referral_locked) {
      await base44.entities.Customer.update(customers[0].id, {
        referral_locked: true
      });
    }

    console.log('✅ Referral processed for order:', order.order_number);
    return { success: true, event, commission };

  } catch (err) {
    console.error('Error processing referral:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Handle order return/refund - reverse commission
 * @param {string} orderId - Order ID
 * @param {string} reason - Return/refund reason
 * @returns {Promise<Object>}
 */
export async function handleOrderReturnRefund(orderId, reason = 'order_returned') {
  try {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    
    if (!order.referral_commission_calculated) {
      return { success: true, message: 'No commission to reverse' };
    }

    // Reverse commission
    const result = await CommissionReversalService.reverseOrderCommission(orderId, reason);
    
    return result;
  } catch (error) {
    console.error('Error handling return/refund:', error);
    return { success: false, message: error.message };
  }
}



export default {
  applyReferralToOrder,
  handleOrderReturnRefund
};