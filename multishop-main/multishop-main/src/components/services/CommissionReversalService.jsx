/**
 * CommissionReversalService - Xử lý hoàn hoa hồng khi return/refund
 * Data/Service Layer - Trả về Result<T>
 * 
 * KHÔNG import ReferralService (tránh circular)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createPageUrl } from '@/utils';

/**
 * Reverse commission khi order bị return/refund
 * @param {string} orderId - ID đơn hàng
 * @param {string} reason - "order_returned" | "order_cancelled" | "fraud_detected"
 */
export async function reverseOrderCommission(orderId, reason = 'order_returned') {
  try {
    // Get order
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length === 0) {
      return failure('Không tìm thấy đơn hàng', ErrorCodes.NOT_FOUND);
    }
    
    const order = orders[0];
    
    // Check đã tính hoa hồng chưa
    if (!order.referral_commission_calculated) {
      return success({ message: 'Đơn hàng chưa tính hoa hồng, không cần reverse' });
    }

    // Get referral event gốc
    const events = await base44.entities.ReferralEvent.filter({ 
      order_id: orderId,
      status: { $in: ['calculated', 'paid'] }
    });
    
    if (events.length === 0) {
      return success({ message: 'Không tìm thấy event hoa hồng cho đơn này' });
    }

    const originalEvent = events[0];
    
    // Check đã reverse chưa
    if (originalEvent.reversed) {
      return failure('Event này đã được reverse trước đó', ErrorCodes.VALIDATION_ERROR);
    }

    // Get referrer
    const referrers = await base44.entities.ReferralMember.filter({ id: originalEvent.referrer_id });
    if (referrers.length === 0) {
      return failure('Không tìm thấy CTV', ErrorCodes.NOT_FOUND);
    }
    
    const referrer = referrers[0];
    const reversalAmount = originalEvent.commission_amount;

    // Tạo reversal event (commission âm)
    const reversalEvent = await base44.entities.ReferralEvent.create({
      referrer_id: referrer.id,
      referrer_email: referrer.user_email,
      referrer_name: referrer.full_name,
      referred_customer_email: originalEvent.referred_customer_email,
      referred_customer_name: originalEvent.referred_customer_name,
      referred_customer_phone: originalEvent.referred_customer_phone,
      order_id: orderId,
      order_number: order.order_number,
      order_amount: -order.total_amount,
      commission_tier: 'Reversal',
      commission_rate: originalEvent.commission_rate,
      commission_amount: -reversalAmount,
      event_type: 'subsequent_purchase',
      status: 'calculated',
      calculation_date: new Date().toISOString(),
      period_month: new Date().toISOString().slice(0, 7),
      reversed: true,
      reversed_reason: reason,
      original_event_id: originalEvent.id
    });

    // Update original event
    await base44.entities.ReferralEvent.update(originalEvent.id, {
      reversed: true,
      reversed_date: new Date().toISOString(),
      reversed_reason: reason
    });

    // Update referrer balance
    const newUnpaid = Math.max(0, (referrer.unpaid_commission || 0) - reversalAmount);
    const newTotalRevenue = Math.max(0, (referrer.total_referral_revenue || 0) - order.total_amount);
    
    await base44.entities.ReferralMember.update(referrer.id, {
      unpaid_commission: newUnpaid,
      total_referral_revenue: newTotalRevenue
    });

    // Commission log
    await base44.entities.ReferralCommissionLog.create({
      referrer_id: referrer.id,
      referrer_email: referrer.user_email,
      event_id: reversalEvent.id,
      order_id: orderId,
      change_type: 'commission_reversed',
      old_value: { balance: referrer.unpaid_commission },
      new_value: { balance: newUnpaid },
      affected_amount: -reversalAmount,
      balance_before: referrer.unpaid_commission || 0,
      balance_after: newUnpaid,
      triggered_by: 'system',
      triggered_by_role: 'system',
      reason: reason,
      metadata: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        original_event_id: originalEvent.id
      }
    });

    // Notify referrer
    await base44.entities.Notification.create({
      recipient_email: referrer.user_email,
      type: 'referral_commission_earned',
      title: '⚠️ Hoa hồng bị hoàn trả',
      message: `Đơn #${order.order_number} đã bị hủy/hoàn. Hoa hồng ${reversalAmount.toLocaleString('vi-VN')}đ đã được trừ khỏi số dư.`,
      link: createPageUrl('MyReferrals'),
      priority: 'normal',
      referral_event_id: reversalEvent.id,
      metadata: {
        reversed_amount: reversalAmount,
        reason: reason
      }
    });

    return success({ reversalEvent, newBalance: newUnpaid });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  reverseOrderCommission
};