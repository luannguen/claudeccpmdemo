/**
 * orderReferralBridge - Kết nối Order ↔ Referral
 * Bridge Module - KHÔNG import OrderService hay ReferralService
 * 
 * Mục đích: Xử lý logic liên quan cả order và referral mà không gây circular
 */

import { base44 } from '@/api/base44Client';
import referralCore from './referralCore';
import orderCore from './orderCore';
import TierAlertService from './TierAlertService';
import CommissionReversalService from './CommissionReversalService';

/**
 * Process referral sau khi tạo order
 * @param {Object} order - Order vừa tạo
 * @param {string} customerEmail - Email khách hàng
 * @param {string} referralCode - Mã giới thiệu
 */
export async function processReferralAfterOrder(order, customerEmail, referralCode) {
  if (!referralCode) return { success: false, message: 'No referral code' };

  try {
    // Validate referral code (dùng core)
    const validation = await referralCore.validateReferralCode(referralCode);
    if (!validation.valid) {
      console.warn('Invalid referral code:', referralCode);
      return { success: false, message: validation.error };
    }

    const referrer = validation.referrer;

    // Check self-referral
    if (customerEmail === referrer.user_email) {
      console.warn('Self-referral blocked:', customerEmail);
      return { success: false, message: 'Self-referral not allowed' };
    }

    // Apply referral to customer (chỉ dùng repository, không import ReferralService)
    const customers = await base44.entities.Customer.filter({ email: customerEmail });
    if (customers.length === 0 || !customers[0].referral_locked) {
      // Update customer
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

    // Calculate commission (dùng core)
    const settings = await getReferralSettings();
    const commission = await referralCore.calculateOrderCommission(order, referrer, settings);
    
    if (!commission) {
      return { success: false, message: 'Commission calculation failed' };
    }

    // Create ReferralEvent
    const event = await base44.entities.ReferralEvent.create({
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
    await base44.entities.ReferralMember.update(referrer.id, {
      total_referral_revenue: (referrer.total_referral_revenue || 0) + order.total_amount,
      current_month_revenue: commission.current_month_revenue,
      unpaid_commission: (referrer.unpaid_commission || 0) + commission.commission_amount
    });

    // Mark order as commission calculated
    await base44.entities.Order.update(order.id, {
      referral_commission_calculated: true
    });

    // Commission log
    await base44.entities.ReferralCommissionLog.create({
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

    // Check tier progress (gửi alert nếu gần lên tier)
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
 * Auto reverse commission khi order bị return/refund
 */
export async function handleOrderReturnRefund(orderId, reason = 'order_returned') {
  try {
    // Check order có referral không
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length === 0) return { success: false };
    
    const order = orders[0];
    
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

// ========== HELPER: GET SETTINGS ==========

async function getReferralSettings() {
  try {
    const settings = await base44.entities.ReferralSetting.filter({ setting_key: 'main' });
    if (settings.length > 0) return settings[0];
    
    // Default settings
    return {
      is_program_enabled: true,
      commission_tiers: referralCore.DEFAULT_COMMISSION_TIERS
    };
  } catch (error) {
    return {
      is_program_enabled: true,
      commission_tiers: referralCore.DEFAULT_COMMISSION_TIERS
    };
  }
}

export default {
  processReferralAfterOrder,
  handleOrderReturnRefund
};